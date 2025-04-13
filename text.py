#########################################################
# backend_server.py
#########################################################
import os
import certifi
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import pandas as pd
from io import BytesIO

#########################################################
# FastAPI app + CORS
#########################################################
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, narrow this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#########################################################
# MongoDB Connection with certifi
#########################################################
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Mongo:SecureMongo@cluster0.poitw.mongodb.net/?retryWrites=true&w=majority"
)
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client["projects_db"]
collection = db["wb_projects"]  # must have documents of form: { "project_id":"...", "pad_doc":"..." }

#########################################################
# In-memory mock data
#########################################################
huggingface_docs = [
    {"id": "HF1", "name": "HugFaceDoc1", "pad_doc": "Some HF doc text..."},
    {"id": "HF2", "name": "HugFaceDoc2", "pad_doc": "Another HF doc text..."},
]
upload_storage = {}  # doc_id -> { "name":..., "pad_doc": ... }

#########################################################
# Pydantic Models
#########################################################
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

#########################################################
@app.get("/")
def root():
    return {"message": "Backend is running with Mongo + certifi."}

#########################################################
# GET /documents/sources
#########################################################
@app.get("/documents/sources", response_model=List[DocumentEntry])
def get_document_sources():
    """
    Returns combined doc entries from:
      1) MongoDB
      2) Hugging Face (mock)
      3) Upload in-memory
    The front end filters them by .source === "mongodb"|"huggingface"|"upload".
    """
    results = []

    # 1) Mongo
    docs_cursor = collection.find({}, {"_id":0, "project_id":1, "pad_doc":1})
    for doc in docs_cursor:
        pid = doc["project_id"]
        text = doc["pad_doc"] or ""
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=pid,
            name=pid,
            source="mongodb",
            preview=short_prev
        ))

    # 2) Hugging Face mock
    for hf in huggingface_docs:
        text = hf["pad_doc"]
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=hf["id"],
            name=hf["name"],
            source="huggingface",
            preview=short_prev
        ))

    # 3) Upload
    for doc_id, data in upload_storage.items():
        txt = data["pad_doc"] or ""
        short_prev = txt[:60] + "..." if len(txt) > 60 else txt
        results.append(DocumentEntry(
            id=doc_id,
            name=data["name"],
            source="upload",
            preview=short_prev
        ))

    return results

#########################################################
# GET /documents/{document_id}/preview
#########################################################
@app.get("/documents/{document_id}/preview")
def get_document_preview(document_id: str):
    """
    Return plain text for the doc from Mongo/huggingface/upload.
    The front end should call res.text() to get it.
    """
    # 1) Check Mongo
    doc = collection.find_one({"project_id": document_id}, {"_id":0, "pad_doc":1})
    if doc:
        return doc["pad_doc"] or ""

    # 2) Hugging Face
    for hf in huggingface_docs:
        if hf["id"] == document_id:
            return hf["pad_doc"]

    # 3) Upload
    if document_id in upload_storage:
        return upload_storage[document_id]["pad_doc"]

    raise HTTPException(404, f"Document {document_id} not found")

#########################################################
# POST /documents/upload
#########################################################
@app.post("/documents/upload", response_model=DocumentEntry)
async def upload_document(file: UploadFile = File(...)):
    """
    Save an uploaded doc into the in-memory 'upload_storage'.
    """
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    new_id = f"UP_{len(upload_storage) + 1}"

    upload_storage[new_id] = {
        "name": file.filename,
        "pad_doc": text
    }
    short_prev = text[:60] + "..." if len(text) > 60 else text
    return DocumentEntry(
        id=new_id,
        name=file.filename,
        source="upload",
        preview=short_prev
    )

#########################################################
# POST /documents/{document_id}/index
#########################################################
@app.post("/documents/{document_id}/index")
def index_document(document_id: str):
    """
    Mock: check doc existence. In real usage, do embeddings, etc.
    """
    try:
        _ = get_document_preview(document_id)
    except HTTPException:
        raise HTTPException(404, f"Doc {document_id} not found, cannot index.")
    return {"success": True, "message": f"Indexed doc {document_id} (mock)"}

#########################################################
# POST /chat/{document_id}
#########################################################
@app.post("/chat/{document_id}", response_model=ChatResponse)
def chat_document(document_id: str, payload: ChatRequest):
    """
    Mock chat referencing doc text. Real usage might call an LLM with doc context.
    """
    try:
        text = get_document_preview(document_id)
    except HTTPException:
        raise HTTPException(404, f"Doc {document_id} not found for chat.")

    answer = (
        f"You asked: '{payload.message}'\n\n"
        "Excerpt:\n"
        + text[:300]
        + "\n-- End of excerpt (mock response)."
    )
    now = datetime.now().isoformat()
    import time
    return ChatResponse(
        id=f"msg_{time.time()}",
        role="assistant",
        content=answer,
        timestamp=now
    )

#########################################################
# GET /export/{document_id}?format=pdf|csv|json
#########################################################
@app.get("/export/{document_id}")
def export_data(document_id: str, format: str = Query(...)):
    """
    Mock export route in pdf/csv/json.
    """
    try:
        text = get_document_preview(document_id)
    except HTTPException:
        raise HTTPException(404, f"Doc {document_id} not found for export.")

    if format not in ["pdf","csv","json"]:
        raise HTTPException(400, "Invalid format")

    if format=="json":
        return {"document_id": document_id, "analysis":"Mock JSON data"}
    elif format=="csv":
        return {"data":"Mock CSV data would be here."}
    else:  # pdf
        return {"data":"Mock PDF data would be here."}

#########################################################
# main
#########################################################
if __name__=="__main__":
    import uvicorn
    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=True)


########################### NOWWWW ##########################
#########################################################
# backend_server.py
#########################################################
import os
import certifi
import hashlib
from datetime import datetime
from typing import List, Optional
from io import BytesIO
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

# If your environment uses .env to load OPENAI_API_KEY
from dotenv import load_dotenv
load_dotenv()

import time
import requests.exceptions

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("Warning: No OPENAI_API_KEY found in environment.")

# This must be the specialized library that has vector_stores, files, responses
# used in your Streamlit code. If it's not standard, ensure the same version is installed.
from openai import OpenAI

# OpenAI API constants
OPENAI_API_TIMEOUT = 60  # Timeout in seconds for OpenAI API calls

#########################################################
# FastAPI + CORS
#########################################################
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#########################################################
# MongoDB Connection using certifi
#########################################################
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Mongo:SecureMongo@cluster0.poitw.mongodb.net/?retryWrites=true&w=majority"
)
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = mongo_client["projects_db"]
collection = db["wb_projects"]             # Must have documents of form: { "project_id": "...", "pad_doc": "..." }
mappings_collection = db["vector_store_mappings"]  # doc_hash => vector_store_id

#########################################################
# Initialize your custom OpenAI client
#########################################################
openai_client = None
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY, timeout=OPENAI_API_TIMEOUT)
else:
    print("OpenAI client not configured - no API key found.")

#########################################################
# In-memory mock data (HuggingFace-like + uploaded)
#########################################################
huggingface_docs = [
    {"id": "HF1", "name": "HugFaceDoc1", "pad_doc": "Some HF doc text..."},
    {"id": "HF2", "name": "HugFaceDoc2", "pad_doc": "Another HF doc text..."},
]
upload_storage = {}  # doc_id -> { "name": <filename>, "pad_doc": <string content> }

#########################################################
# Pydantic Models
#########################################################
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

#########################################################
# Utility to get doc from "collection" or in-memory
#########################################################
def find_doc_text_by_id(document_id: str) -> Optional[str]:
    """
    Return the full doc text (pad_doc) from:
      1) Mongo by project_id
      2) huggingface_docs
      3) upload_storage
    or None if not found
    """
    # Check Mongo
    doc = collection.find_one({"project_id": document_id}, {"_id": 0, "pad_doc": 1})
    if doc:
        return doc.get("pad_doc", "")

    # Check huggingface
    for hf in huggingface_docs:
        if hf["id"] == document_id:
            return hf["pad_doc"]

    # Check upload
    if document_id in upload_storage:
        return upload_storage[document_id]["pad_doc"]

    return None

def compute_doc_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()

#########################################################
# Routes
#########################################################
@app.get("/")
def root():
    return {"message": "Backend up with real indexing approach + certifi."}


#########################################################
# GET /documents/sources
#########################################################
@app.get("/documents/sources", response_model=List[DocumentEntry])
def get_document_sources():
    """
    Return combined doc entries from:
      1) MongoDB
      2) Hugging Face
      3) In-memory uploads
    The front end filters by doc.source.
    """
    results = []

    # 1) Mongo
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

    # 2) Hugging Face
    for hf in huggingface_docs:
        text = hf["pad_doc"]
        short_prev = text[:60] + "..." if len(text) > 60 else text
        results.append(DocumentEntry(
            id=hf["id"],
            name=hf["name"],
            source="huggingface",
            preview=short_prev
        ))

    # 3) Upload
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

#########################################################
# GET /documents/{document_id}/preview
#########################################################
@app.get("/documents/{document_id}/preview")
def get_document_preview(document_id: str):
    """
    Return plain text doc content from either:
    - Mongo (project_id)
    - huggingface_docs
    - upload_storage
    or 404 if not found
    """
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Document {document_id} not found")
    return text

#########################################################
# POST /documents/upload
#########################################################
@app.post("/documents/upload", response_model=DocumentEntry)
async def upload_document(file: UploadFile = File(...)):
    """
    Store an uploaded doc in memory: 'upload_storage'
    doc_id = "UP_1", "UP_2", ...
    """
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

#########################################################
# POST /documents/{document_id}/index
# Real approach like your Streamlit code
#########################################################
@app.post("/documents/{document_id}/index", response_model=IndexResponse)
def index_document(document_id: str):

    """
    Replicate your Streamlit 'index_document(document_text)' logic:
    1) find doc text
    2) compute doc_hash
    3) check 'vector_store_mappings' if we have an existing vector_store_id
    4) if not, create vector store, upload file, attach, store mapping
    5) optionally do initial 'responses.create(...)'
    """
    
    if not openai_client:
        raise HTTPException(500, "OpenAI client not configured (no API key).")

    # 1) find doc text
    doc_text = find_doc_text_by_id(document_id)
    if doc_text is None or doc_text.strip() == "":
        raise HTTPException(404, f"Document {document_id} not found or empty.")

    # Log document details for debugging
    doc_size = len(doc_text) if doc_text else 0
    print(f"Processing document: {document_id}, Size: {doc_size} characters")
    
    # Check if document is too large (OpenAI has size limits)
    max_size = 100000  # Adjust based on OpenAI's limits
    if doc_size > max_size:
        print(f"Document {document_id} is too large: {doc_size} chars. Truncating to {max_size}")
        doc_text = doc_text[:max_size]
    
    # Ensure document is properly encoded
    try:
        # Test UTF-8 encoding/decoding to catch any encoding issues
        encoded = doc_text.encode("utf-8")
        decoded = encoded.decode("utf-8")
        # If different, there might be encoding issues
        if decoded != doc_text:
            print(f"Warning: Document {document_id} has encoding issues. Attempting to clean...")
            doc_text = decoded
    except Exception as e:
        print(f"Error processing document content: {str(e)}")
        # Attempt to sanitize content
        doc_text = doc_text.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
        print(f"Document content sanitized. New size: {len(doc_text)}")

    # 2) doc_hash
    doc_hash = compute_doc_hash(doc_text)

    # 3) check existing mapping
    existing = db["vector_store_mappings"].find_one({"doc_hash": doc_hash})
    if existing:
        vs_id = existing.get("vector_store_id")
        return IndexResponse(
            success=True,
            vector_store_id=vs_id,
            message=f"Reusing existing vector store for doc {document_id}"
        )

    # 4) no existing => create new store
    try:
        print(f"Creating new vector store for document {document_id}")
        
        # Add retry logic for API calls
        max_retries = 3
        retry_delay = 2  # seconds
        
        # 1. Create vector store with retries
        for attempt in range(max_retries):
            try:
                # Include document size in the name for easier debugging
                vs_name = f"Document Index - {document_id[:20]} ({doc_size/1000:.1f}K chars)"
                vs_resp = openai_client.vector_stores.create(name=vs_name)
                vs_id = vs_resp.id
                if not vs_id:
                    raise ValueError("No vector_store_id returned from create()")
                print(f"Vector store created with ID: {vs_id}")
                break
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                if attempt < max_retries - 1:
                    print(f"Timeout creating vector store. Retrying in {retry_delay}s... ({attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    raise HTTPException(500, f"Timeout creating vector store after {max_retries} attempts")
            except Exception as e:
                print(f"Error creating vector store: {str(e)}")
                raise
        
        # 2. Upload file with retries
        print(f"Uploading document content to OpenAI...")
        file_id = None
        for attempt in range(max_retries):
            temp_path = None
            try:
                # Create a temporary file with .txt extension for OpenAI to recognize the file type
                with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as temp_file:
                    temp_file.write(doc_text.encode("utf-8"))
                    temp_file.flush()
                    temp_path = temp_file.name
                
                # Use the temporary file for upload
                with open(temp_path, "rb") as file_obj:
                    file_res = openai_client.files.create(
                        file=file_obj, 
                        purpose="assistants"
                    )
                file_id = file_res.id
                print(f"File uploaded with ID: {file_id}")
                
                # Clean up the temporary file
                if temp_path and os.path.exists(temp_path):
                    os.unlink(temp_path)
                    temp_path = None
                
                break
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                if attempt < max_retries - 1:
                    print(f"Timeout uploading file. Retrying in {retry_delay}s... ({attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    # Clean up the created vector store
                    try:
                        openai_client.vector_stores.delete(vs_id)
                        print(f"Cleaned up vector store {vs_id} after file upload failure")
                    except:
                        pass
                    raise HTTPException(500, f"Timeout uploading file after {max_retries} attempts")
            except Exception as e:
                print(f"Error uploading file: {str(e)}")
                # Clean up the created vector store
                try:
                    openai_client.vector_stores.delete(vs_id)
                    print(f"Cleaned up vector store {vs_id} after file upload failure")
                except:
                    pass
                # Clean up temporary file if it exists
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                raise

        # 3. Attach file to vector store with retries
        print(f"Attaching file to vector store...")
        
        # Add a delay after file upload to allow OpenAI to process the file
        print(f"Waiting 5 seconds for OpenAI to process the file...")
        time.sleep(5)
        
        # Use longer delays and more retries for attachment
        max_attach_retries = 5  # More retries for attachment
        attach_retry_delay = 3  # Start with longer delay
        
        for attempt in range(max_attach_retries):
            try:
                attach_res = openai_client.vector_stores.files.create(
                    vector_store_id=vs_id,
                    file_id=file_id
                )
                print(f"File attached successfully")
                break
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                if attempt < max_attach_retries - 1:
                    print(f"Timeout attaching file. Retrying in {attach_retry_delay}s... ({attempt+1}/{max_attach_retries})")
                    time.sleep(attach_retry_delay)
                    attach_retry_delay *= 2
                else:
                    # Clean up resources
                    try:
                        openai_client.vector_stores.delete(vs_id)
                        print(f"Cleaned up vector store {vs_id} after attachment failure")
                    except:
                        pass
                    raise HTTPException(500, f"Timeout attaching file after {max_attach_retries} attempts")
            except Exception as e:
                # Check if it's a 500 error from OpenAI
                if "500" in str(e) and "server_error" in str(e):
                    if attempt < max_attach_retries - 1:
                        next_delay = attach_retry_delay * (2 ** attempt)  # Exponential backoff
                        print(f"OpenAI server error. Retrying in {next_delay}s... ({attempt+1}/{max_attach_retries})")
                        time.sleep(next_delay)
                        continue
                    else:
                        # Last attempt failed, but we've created both vector store and file
                        # We can store a mapping anyway and let the user retry attachment later
                        print(f"All attachment retries failed with server errors.")
                        print(f"Storing partial mapping with vector_store_id and file_id...")
                        
                        # Store mapping with both IDs despite attachment failure
                        try:
                            db["vector_store_mappings"].insert_one({
                                "doc_hash": doc_hash,
                                "vector_store_id": vs_id,
                                "file_id": file_id,  # Store file_id for potential future attachment
                                "document_id": document_id,
                                "doc_size": doc_size,
                                "status": "partial_success",  # Mark as partial success
                                "created_at": datetime.utcnow()
                            })
                            print(f"Partial mapping stored. Vector store and file exist but aren't attached.")
                            
                            # Return partial success
                            return IndexResponse(
                                success=True,
                                vector_store_id=vs_id,
                                message=f"Created vector store and file, but attachment failed with server error. You can try again later."
                            )
                        except Exception as db_err:
                            print(f"Failed to store partial mapping: {str(db_err)}")
                
                # For other errors or if we can't handle the OpenAI server error
                print(f"Error attaching file: {str(e)}")
                # Clean up resources
                try:
                    openai_client.vector_stores.delete(vs_id)
                    print(f"Cleaned up vector store {vs_id} after attachment failure")
                except:
                    pass
                raise

        # store mapping doc_hash => vs_id
        print(f"Storing mapping in database...")
        try:
            db["vector_store_mappings"].insert_one({
                "doc_hash": doc_hash,
                "vector_store_id": vs_id,
                "document_id": document_id,  # Store document_id for reference
                "doc_size": doc_size,  # Store original document size
                "created_at": datetime.utcnow()
            })
        except Exception as e:
            print(f"Warning: Failed to store mapping in database: {str(e)}")
            print("Vector store was created successfully, but mapping was not stored.")
            # Continue despite database error - the vector store is still created

        # Optionally do an initial indexing call
        print(f"Performing initial indexing...")
        try:
            # Adding retries for indexing
            max_index_retries = 2
            for index_attempt in range(max_index_retries):
                try:
                    index_resp = openai_client.responses.create(
                        model="gpt-4o-mini",  # or use a config if you want
                        input=doc_text[:5000],  # Use just first 5000 chars for initial indexing
                        tools=[{"type": "file_search", "vector_store_ids": [vs_id]}]
                    )
                    print(f"Initial indexing completed successfully")
                    break
                except Exception as index_e:
                    if "500" in str(index_e) and index_attempt < max_index_retries - 1:
                        print(f"OpenAI server error during indexing. Retry {index_attempt+1}/{max_index_retries}")
                        time.sleep(3)
                    else:
                        raise
        except Exception as e:
            print(f"Warning: Initial indexing failed, but vector store was created: {str(e)}")
            # Continue despite indexing failure

        return IndexResponse(
            success=True,
            vector_store_id=vs_id,
            message=f"Document {document_id} was indexed => vs_id={vs_id}"
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR indexing document {document_id}: {str(e)}")
        print(error_trace)
        raise HTTPException(500, f"Error indexing document: {str(e)}")

#########################################################
# POST /chat/{document_id}
#########################################################
@app.post("/chat/{document_id}", response_model=ChatResponse)
def chat_document(document_id: str, payload: ChatRequest):
    """
    Mock chat referencing doc text. Real usage might call an LLM with doc context
    or do a 'client.responses.create(...)' with the doc's vector store.
    """
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Doc {document_id} not found for chat.")

    # Just mock a short excerpt
    excerpt = text[:300]
    from time import time
    now = datetime.now().isoformat()
    answer = (
        f"You asked: '{payload.message}'\n\n"
        "Excerpt:\n"
        + excerpt
        + "\n-- End of excerpt (mock response)."
    )

    return ChatResponse(
        id=f"msg_{time()}",
        role="assistant",
        content=answer,
        timestamp=now
    )

#########################################################
# GET /export/{document_id}?format=pdf|csv|json
#########################################################
@app.get("/export/{document_id}")
def export_data(document_id: str, format: str = Query(...)):
    """
    Mock export route in pdf/csv/json
    """
    text = find_doc_text_by_id(document_id)
    if text is None:
        raise HTTPException(404, f"Doc {document_id} not found for export")

    if format not in ["pdf","csv","json"]:
        raise HTTPException(400, "Invalid format")

    if format=="json":
        return {"document_id": document_id, "analysis":"Mock JSON data"}
    elif format=="csv":
        return {"data":"Mock CSV data would be here."}
    else:  # pdf
        return {"data":"Mock PDF data would be here."}

#########################################################
# main
#########################################################
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=True)
