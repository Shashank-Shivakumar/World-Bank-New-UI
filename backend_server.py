import os
import re
import uuid
import hashlib
import tempfile
import time
import traceback
from datetime import datetime
from typing import List, Optional
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

##############################################
# PyPDF2 for PDF text extraction
##############################################
try:
    from PyPDF2 import PdfReader
except ImportError:
    print("Warning: PyPDF2 is not installed. PDF extraction may fail.")
    PdfReader = None

##############################################
# ReportLab for PDF generation
##############################################
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

##############################################
# OpenAI client – your custom wrapper
##############################################
from openai import OpenAI

##############################################
# Load environment and MongoDB setup
##############################################
from dotenv import load_dotenv
import certifi
from pymongo import MongoClient

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Warning: No OPENAI_API_KEY found in environment. LLM endpoints may fail.")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Mongo:SecureMongo@cluster0.poitw.mongodb.net/?retryWrites=true&w=majority"
)
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = mongo_client["projects_db"]
collection = db["wb_projects"]
mappings_collection = db["vector_store_mappings"]

##############################################
# Initialize OpenAI Client
##############################################
openai_client = None
try:
    if OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY, timeout=60)
except Exception as e:
    print("Failed to initialize OpenAI client:", str(e))

##############################################
# In-memory document storage for uploads
##############################################
huggingface_docs = [
    {"id": "HF1", "name": "HugFaceDoc1", "pad_doc": "Some HF doc text..."},
    {"id": "HF2", "name": "HugFaceDoc2", "pad_doc": "Another HF doc text..."},
]
upload_storage = {}  # Stores uploaded docs: doc_id -> {"name": str, "pad_doc": str}


##############################################
# Pydantic Models
##############################################
class DocumentEntry(BaseModel):
    id: str
    name: str
    source: str
    preview: Optional[str] = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str


class IndexResponse(BaseModel):
    success: bool
    vector_store_id: Optional[str] = None
    message: Optional[str] = None


class ReportRequest(BaseModel):
    prompt: str


class ReportResponse(BaseModel):
    reportText: str


class PDFRequestPayload(BaseModel):
    fullText: str


##############################################
# OpenAI-Based Vector Store Helpers
##############################################
def create_vector_store() -> str:
    """
    Creates a new vector store using the OpenAI client and returns its ID.
    The returned ID will match the expected pattern (e.g. "vs_67f701cf74688191a3ef60def46d87c5").
    """
    try:
        response = openai_client.vector_stores.create(name="Document Index")
        vector_store_id = response.id
        if not vector_store_id:
            raise Exception("No vector store id returned.")
        return vector_store_id
    except Exception as e:
        raise Exception(f"Error creating vector store: {str(e)}")


def upload_document_as_file(document_text: str) -> str:
    """
    Uploads the document text as a file using the OpenAI client.
    Returns the file ID.
    """
    try:
        file_bytes = BytesIO(document_text.encode("utf-8"))
        file_bytes.name = "document.txt"
        response = openai_client.files.create(file=file_bytes, purpose="assistants")
        file_id = response.id
        if not file_id:
            raise Exception("No file id returned.")
        return file_id
    except Exception as e:
        raise Exception(f"Error uploading document as file: {str(e)}")


def attach_file_to_vector_store(vector_store_id: str, file_id: str):
    """
    Attaches the uploaded file to the vector store.
    """
    try:
        response = openai_client.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=file_id
        )
        return response
    except Exception as e:
        raise Exception(f"Error attaching file to vector store: {str(e)}")


##############################################
# Common Helper Functions
##############################################
def find_doc_text_by_id(document_id: str) -> Optional[str]:
    """
    Returns document text from:
      1) MongoDB ("wb_projects")
      2) Hugging Face docs
      3) In-memory uploads
    """
    # Check MongoDB
    doc = collection.find_one({"project_id": document_id}, {"_id": 0, "pad_doc": 1})
    if doc:
        return doc.get("pad_doc", "")
    # Check Hugging Face docs
    for hf in huggingface_docs:
        if hf["id"] == document_id:
            return hf["pad_doc"]
    # Check uploads
    if document_id in upload_storage:
        return upload_storage[document_id]["pad_doc"]
    return None


def compute_doc_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def get_vector_store_mapping(doc_hash: str) -> Optional[str]:
    mapping_doc = mappings_collection.find_one({"doc_hash": doc_hash})
    if mapping_doc:
        return mapping_doc.get("vector_store_id")
    return None


def set_vector_store_mapping(doc_hash: str, vector_store_id: str):
    mappings_collection.update_one(
        {"doc_hash": doc_hash},
        {"$set": {"vector_store_id": vector_store_id}},
        upsert=True
    )


##############################################
# Indexing Logic (mimicking the Streamlit code)
##############################################
def index_document_logic(document_id: str, doc_text: str) -> str:
    """
    Consolidated indexing logic:
      - Compute document hash and check MongoDB for an existing vector store mapping.
      - If none exists, create a new vector store via the OpenAI client.
      - Upload the document as a file and attach it to the vector store.
      - Save the mapping in MongoDB.
      - Optionally call the responses endpoint for additional indexing logging.

    This behavior mirrors your provided Streamlit implementation.
    """
    doc_hash = compute_doc_hash(doc_text)
    existing = mappings_collection.find_one({"doc_hash": doc_hash})
    if existing and existing.get("vector_store_id"):
        print(f"Document {document_id} already indexed => vector_store_id={existing['vector_store_id']}")
        return existing["vector_store_id"]
    try:
        # 1. Create a new vector store.
        vector_store_id = create_vector_store()
        # 2. Upload the document as a file.
        file_id = upload_document_as_file(doc_text)
        # 3. Attach the uploaded file to the vector store.
        attach_file_to_vector_store(vector_store_id, file_id)
    except Exception as e:
        raise Exception(f"Indexing failed: {str(e)}")
    # 4. Store the mapping in MongoDB.
    mappings_collection.insert_one({
        "doc_hash": doc_hash,
        "vector_store_id": vector_store_id,
        "document_id": document_id,
        "created_at": datetime.utcnow()
    })
    # 5. Optionally, trigger an indexing call (for logging or further LLM processing).
    try:
        indexing_response = openai_client.responses.create(
            model="gpt-4o",  # You can adjust the model as needed.
            input=doc_text,
            tools=[{"type": "file_search", "vector_store_ids": [vector_store_id]}]
        )
        print("Indexing response:", indexing_response)
    except Exception as e:
        print("Indexing response error:", str(e))
    return vector_store_id


##############################################
# Endpoints
##############################################
@app.get("/")
def root():
    return {"message": "Backend up with PDF support and Streamlit-like indexing."}


@app.get("/documents/sources", response_model=List[DocumentEntry])
def get_document_sources():
    """
    Returns a list of all documents from MongoDB, Hugging Face docs, and uploaded files.
    """
    results = []
    # MongoDB documents
    mongo_docs = collection.find({}, {"_id": 0, "project_id": 1, "pad_doc": 1})
    for doc in mongo_docs:
        pid = doc["project_id"]
        text = doc.get("pad_doc", "")
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(id=pid, name=pid, source="mongodb", preview=short_prev))
    # Hugging Face documents
    for hf in huggingface_docs:
        text = hf["pad_doc"]
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(id=hf["id"], name=hf["name"], source="huggingface", preview=short_prev))
    # Uploaded documents
    for doc_id, data in upload_storage.items():
        text = data["pad_doc"] or ""
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(id=doc_id, name=data["name"], source="upload", preview=short_prev))
    return results


@app.get("/documents/{document_id}/preview")
def get_document_preview(document_id: str):
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Document {document_id} not found")
    return text


@app.post("/documents/upload", response_model=DocumentEntry)
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads and parses a document (PDF or text), stores it in memory,
    and automatically indexes the document.
    """
    try:
        content = await file.read()
        filename = file.filename
        extension = filename.split(".")[-1].lower()
        extracted_text = ""
        if extension == "pdf":
            if not PdfReader:
                raise HTTPException(500, "PyPDF2 not available to parse PDF files.")
            try:
                reader = PdfReader(BytesIO(content))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
            except Exception as e:
                print("PDF parsing error:", e)
                extracted_text = f"(Error extracting PDF text: {e})\n\n" + content.decode("utf-8", errors="replace")
        else:
            extracted_text = content.decode("utf-8", errors="replace")
        new_id = f"UP_{len(upload_storage) + 1}"
        upload_storage[new_id] = {"name": filename, "pad_doc": extracted_text}
        # Automatically index the uploaded document.
        vector_store_id = index_document_logic(new_id, extracted_text)
        print(f"Uploaded file auto-indexed with vector store id: {vector_store_id}")
        short_prev = extracted_text[:60] + "..." if len(extracted_text) > 60 else extracted_text
        return DocumentEntry(id=new_id, name=filename, source="upload", preview=short_prev)
    except Exception as e:
        raise HTTPException(500, f"Error uploading/parsing file: {str(e)}")


@app.post("/documents/{document_id}/index", response_model=IndexResponse)
def index_document_endpoint(document_id: str):
    """
    Indexes a document (from any source) by ensuring that a vector store mapping exists.
    """
    print(f"Indexing document: {document_id}")
    doc_text = find_doc_text_by_id(document_id)
    if not doc_text or not doc_text.strip():
        raise HTTPException(404, f"Document {document_id} not found or empty.")
    try:
        vs_id = index_document_logic(document_id, doc_text)
        return IndexResponse(success=True, vector_store_id=vs_id, message="Document indexed.")
    except Exception as e:
        raise HTTPException(500, f"Indexing failed: {str(e)}")


@app.post("/chat/{document_id}", response_model=ChatResponse)
def chat_document(document_id: str, payload: ChatRequest):
    """
    Chat endpoint: retrieves the document text, confirms indexing,
    and then queries the LLM.
    """
    doc_text = find_doc_text_by_id(document_id)
    if not doc_text:
        raise HTTPException(404, f"Document {document_id} not found")
    doc_hash = compute_doc_hash(doc_text)
    mapping = mappings_collection.find_one({"doc_hash": doc_hash})
    if not mapping or not mapping.get("vector_store_id"):
        raise HTTPException(400, "Document not indexed. Please index first.")
    vs_id = mapping["vector_store_id"]
    user_message = payload.message
    now = datetime.now().isoformat()
    answer = ""
    if not openai_client:
        excerpt = doc_text[:300]
        answer = (
            f"(OpenAI client not configured, returning mock excerpt)\n\n"
            f"User asked: '{user_message}'\n\nExcerpt:\n{excerpt}..."
        )
    else:
        try:
            response = openai_client.responses.create(
                model="gpt-4o",
                input=user_message,
                tools=[{"type": "file_search", "vector_store_ids": [vs_id], "max_num_results": 30}]
            )
            if len(response.output) > 1 and hasattr(response.output[1], "content"):
                content_list = response.output[1].content
                if content_list and isinstance(content_list, list):
                    first_chunk = content_list[0]
                    answer = first_chunk.text if hasattr(first_chunk, "text") else "(No text found)"
                else:
                    answer = "(No content returned from the LLM)"
            else:
                answer = "(No output array returned.)"
        except Exception as e:
            answer = f"Error calling openai_client: {str(e)}"
    return ChatResponse(id=f"chat_{time.time()}", role="assistant", content=answer, timestamp=now)


@app.post("/documents/{document_id}/report", response_model=ReportResponse)
def generate_report(document_id: str, body: ReportRequest):
    """
    Generates an analysis report by retrieving the document, confirming indexing,
    and querying the LLM.
    """
    doc_text = find_doc_text_by_id(document_id)
    if not doc_text:
        raise HTTPException(404, f"Document {document_id} not found")
    doc_hash = compute_doc_hash(doc_text)
    mapping = mappings_collection.find_one({"doc_hash": doc_hash})
    if not mapping or not mapping.get("vector_store_id"):
        raise HTTPException(400, "Document not indexed. Please index first.")
    vs_id = mapping["vector_store_id"]
    final_text = do_fcv_analysis(doc_text, body.prompt, vs_id)
    return ReportResponse(reportText=final_text)


@app.post("/documents/{document_id}/report-pdf")
def generate_report_pdf(document_id: str, payload: PDFRequestPayload):
    """
    Builds a PDF from the provided full text and returns it.
    """
    entire_report_text = payload.fullText
    if not entire_report_text.strip():
        raise HTTPException(status_code=400, detail="No text found in 'fullText'")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
        tmp_filename = tmp_file.name
    doc = SimpleDocTemplate(tmp_filename)
    styles = getSampleStyleSheet()
    story = []
    for line in entire_report_text.split("\n"):
        line = line.rstrip()
        if not line.strip():
            story.append(Spacer(1, 10))
        else:
            story.append(Paragraph(line, styles["Normal"]))
    story.append(Spacer(1, 20))
    doc.build(story)
    return FileResponse(path=tmp_filename, media_type="application/pdf", filename=f"report_{document_id}.pdf")


@app.get("/export/{document_id}")
def export_data(document_id: str, format: str = Query(...)):
    """
    Mock route for exporting analysis in PDF/CSV/JSON formats.
    """
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Document {document_id} not found")
    if format not in ["pdf", "csv", "json"]:
        raise HTTPException(400, "Invalid format")
    if format == "json":
        return {"document_id": document_id, "analysis": "Mock JSON data here."}
    elif format == "csv":
        return {"data": "Mock CSV data here."}
    else:  # pdf
        return {"data": "Mock PDF data here."}


##############################################
# Main Execution
##############################################
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=True)
