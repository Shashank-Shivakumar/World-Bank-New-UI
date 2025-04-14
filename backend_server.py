import os
import certifi
import hashlib
import tempfile
import time
import traceback
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

##############################################
# REPORTLAB for PDF
##############################################
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

##############################################
# Our "OpenAI" client - your custom wrapper
##############################################
from openai import OpenAI  # or however you import your custom OpenAI library

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Warning: No OPENAI_API_KEY found in environment. The index/report endpoints may fail.")

##############################################
# Initialize FastAPI + CORS
##############################################
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

##############################################
# MongoDB Setup
##############################################
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
# In-Memory Doc Mocks
##############################################
huggingface_docs = [
    {"id": "HF1", "name": "HugFaceDoc1", "pad_doc": "Some HF doc text..."},
    {"id": "HF2", "name": "HugFaceDoc2", "pad_doc": "Another HF doc text..."},
]
upload_storage = {}  # doc_id -> { "name": str, "pad_doc": str }

##############################################
# Helper Models
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
# Helper Functions
##############################################
def find_doc_text_by_id(document_id: str) -> Optional[str]:
    """
    Return doc text from:
      1) Mongo "wb_projects"
      2) huggingface_docs
      3) upload_storage
    """
    # 1) From Mongo
    doc = collection.find_one({"project_id": document_id}, {"_id": 0, "pad_doc": 1})
    if doc:
        return doc.get("pad_doc", "")

    # 2) huggingface
    for hf in huggingface_docs:
        if hf["id"] == document_id:
            return hf["pad_doc"]

    # 3) upload
    if document_id in upload_storage:
        return upload_storage[document_id]["pad_doc"]

    return None

def compute_doc_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def do_fcv_analysis(doc_text: str, user_prompt: str, vector_store_id: str) -> str:
    """
    Example function that calls your LLM to generate the final 'report' text.
    We replicate the logic from the Streamlit query_document approach:
      1) Perform a search on vector_store_id
      2) Return the final LLM text plus usage/cost info
    """
    if not openai_client:
        # If no client is configured, return a mock
        return "(OpenAI client not configured, returning mock text.)"

    # We’re calling the LLM with a question (the user_prompt) plus a file_search tool
    # that references the same vector_store_id used in your /chat route:
    try:
        response = openai_client.responses.create(
            model="gpt-4o",  # or whichever you want, e.g. st.session_state["selected_model"]
            input=user_prompt,
            tools=[{
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
                "max_num_results": 30
            }]
        )
        # Extract final text from your client’s response object:
        if len(response.output) > 1 and hasattr(response.output[1], "content"):
            content_list = response.output[1].content  # typically a list
            if content_list and isinstance(content_list, list):
                # take the first chunk’s text if it exists
                first_chunk = content_list[0]
                answer = first_chunk.text if hasattr(first_chunk, "text") else "(No text found)"
            else:
                answer = "(No content returned from the LLM)"
        else:
            answer = "(No output array returned.)"

        # Optionally, if your client returns usage info, you can append usage/cost:
        usage = getattr(response, "usage", None)
        if usage and hasattr(usage, "input_tokens"):
            input_tokens = usage.input_tokens
            output_tokens = usage.output_tokens
            # If you want to show cost, adapt your formula:
            # e.g. cost = (input_tokens / 1000)*0.005 + (output_tokens / 1000)*0.015
            # Or use your custom PRICING dict, etc.
            cost_estimate = "(Cost info...)"  # build something real
            answer += (
                "\n\n---\n"
                f"🧮 **Usage Summary**\n"
                f"- Input tokens: {input_tokens}\n"
                f"- Output tokens: {output_tokens}\n"
                f"- Estimated cost: {cost_estimate}\n"
            )

        return answer

    except Exception as e:
        return f"Error calling openai_client in do_fcv_analysis: {str(e)}"



##############################################
# Root Endpoint
##############################################
@app.get("/")
def root():
    return {"message": "Backend up with real indexing approach + PDF support."}


##############################################
# GET /documents/sources
##############################################
@app.get("/documents/sources", response_model=List[DocumentEntry])
def get_document_sources():
    """
    Return a list of all documents from:
      - Mongo
      - huggingface_docs
      - upload_storage
    """
    results = []

    # Mongo
    mongo_docs = collection.find({}, {"_id": 0, "project_id": 1, "pad_doc": 1})
    for doc in mongo_docs:
        pid = doc["project_id"]
        text = doc.get("pad_doc", "")
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=pid,
            name=pid,
            source="mongodb",
            preview=short_prev
        ))

    # huggingface
    for hf in huggingface_docs:
        text = hf["pad_doc"]
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=hf["id"],
            name=hf["name"],
            source="huggingface",
            preview=short_prev
        ))

    # uploads
    for doc_id, data in upload_storage.items():
        text = data["pad_doc"] or ""
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=doc_id,
            name=data["name"],
            source="upload",
            preview=short_prev
        ))

    return results


##############################################
# GET /documents/{document_id}/preview
##############################################
@app.get("/documents/{document_id}/preview")
def get_document_preview(document_id: str):
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Document {document_id} not found")
    return text


##############################################
# POST /documents/upload
##############################################
@app.post("/documents/upload", response_model=DocumentEntry)
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    text_decoded = content.decode("utf-8", errors="replace")
    new_id = f"UP_{len(upload_storage) + 1}"

    upload_storage[new_id] = {
        "name": file.filename,
        "pad_doc": text_decoded
    }

    short_prev = text_decoded[:60] + "..." if len(text_decoded) > 60 else text_decoded
    return DocumentEntry(
        id=new_id,
        name=file.filename,
        source="upload",
        preview=short_prev
    )


##############################################
# POST /documents/{document_id}/index
##############################################
@app.post("/documents/{document_id}/index", response_model=IndexResponse)
def index_document(document_id: str):
    """
    Called to index the doc in a vector store. 
    Right now, we mock it, but you can do real logic with openai_client.
    """
    print(f"POST /documents/{document_id}/index => Start indexing...")

    doc_text = find_doc_text_by_id(document_id)
    if not doc_text or doc_text.strip() == "":
        raise HTTPException(404, f"Document {document_id} not found or empty.")

    doc_hash = compute_doc_hash(doc_text)
    existing = mappings_collection.find_one({"doc_hash": doc_hash})
    if existing:
        vs_id = existing.get("vector_store_id")
        if vs_id:
            print(f"Doc {document_id} already indexed => vs_id={vs_id}")
            return IndexResponse(success=True, vector_store_id=vs_id, message="Re-using existing vector store")

    # Create a fake vector store ID
    vs_id = f"VS_{document_id}"
    print(f"Created mock vector store: {vs_id}")
    mappings_collection.insert_one({
        "doc_hash": doc_hash,
        "vector_store_id": vs_id,
        "document_id": document_id,
        "created_at": datetime.utcnow()
    })

    return IndexResponse(success=True, vector_store_id=vs_id, message="Document indexed.")


##############################################
# POST /chat/{document_id}
##############################################
@app.post("/chat/{document_id}", response_model=ChatResponse)
def chat_document(document_id: str, payload: ChatRequest):
    """
    Real chat logic, similar to your Streamlit query_document approach.
    - Find the doc text
    - Look up vector store
    - Call openai_client to do a file_search
    - Return the final content
    """
    doc_text = find_doc_text_by_id(document_id)
    if not doc_text:
        raise HTTPException(404, f"Document {document_id} not found")

    # Check if we have a vector store
    doc_hash = compute_doc_hash(doc_text)
    mapping = mappings_collection.find_one({"doc_hash": doc_hash})
    if not mapping or not mapping.get("vector_store_id"):
        raise HTTPException(400, "Document not indexed or no vector_store_id found. Please index first.")
    vs_id = mapping["vector_store_id"]

    user_message = payload.message
    now = datetime.now().isoformat()

    if not openai_client:
        # Fallback: just return excerpt
        excerpt = doc_text[:300]
        answer = (
            f"(OpenAI client not configured, returning mock excerpt)\n\n"
            f"User asked: '{user_message}'\n\nExcerpt:\n{excerpt}..."
        )
    else:
        # Example usage with openai_client:
        # Adjust model, tools, etc. as needed.
        try:
            response = openai_client.responses.create(
                model="gpt-4o",  # or whichever model you prefer
                input=user_message,
                tools=[{
                    "type": "file_search",
                    "vector_store_ids": [vs_id],
                    "max_num_results": 30
                }]
            )
            # Extract the final text
            # This depends on your openai_client's structure
            if len(response.output) > 1 and hasattr(response.output[1], "content"):
                content_list = response.output[1].content  # typically a list
                if content_list and isinstance(content_list, list):
                    # take the first chunk
                    first_chunk = content_list[0]
                    answer = first_chunk.text if hasattr(first_chunk, "text") else "(No text found)"
                else:
                    answer = "(No content returned from the LLM)"
            else:
                answer = "(No output array returned.)"
        except Exception as e:
            answer = f"Error calling openai_client: {str(e)}"

    chat_resp = ChatResponse(
        id=f"chat_{time.time()}",
        role="assistant",
        content=answer,
        timestamp=now
    )
    return chat_resp


##############################################
# POST /documents/{document_id}/report
##############################################
@app.post("/documents/{document_id}/report", response_model=ReportResponse)
def generate_report(document_id: str, body: ReportRequest):
    """
    Return text from a real LLM analysis, akin to your do_fcv_analysis in Streamlit.
    """
    doc_text = find_doc_text_by_id(document_id)
    if not doc_text:
        raise HTTPException(404, f"Document {document_id} not found")

    # Check if there's a vector store for this doc (so the LLM can do file_search)
    doc_hash = compute_doc_hash(doc_text)
    mapping = mappings_collection.find_one({"doc_hash": doc_hash})
    if not mapping or not mapping.get("vector_store_id"):
        raise HTTPException(400, "Document not indexed or no vector_store_id found. Please index first.")
    vs_id = mapping["vector_store_id"]

    user_prompt = body.prompt

    # Now call the updated do_fcv_analysis with the vector_store_id
    final_text = do_fcv_analysis(doc_text, user_prompt, vs_id)

    return ReportResponse(reportText=final_text)



##############################################
# POST /documents/{document_id}/report-pdf
##############################################
@app.post("/documents/{document_id}/report-pdf")
def generate_report_pdf(document_id: str, payload: PDFRequestPayload):
    """
    Receives { "fullText": "<entire LLM text>" }
    Builds a PDF from that text and returns it.
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

    return FileResponse(
        path=tmp_filename,
        media_type="application/pdf",
        filename=f"report_{document_id}.pdf"
    )


##############################################
# GET /export/{document_id}
##############################################
@app.get("/export/{document_id}")
def export_data(document_id: str, format: str = Query(...)):
    """
    Mock route for PDF/CSV/JSON
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=True)
