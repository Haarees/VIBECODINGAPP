# RUN INSTRUCTIONS:
# 1. Install dependencies: pip install -r requirements.txt
# 2. Run server: uvicorn main:app --reload
# 3. Server runs at http://127.0.0.1:8000

import os
import shutil
import uuid
import time
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

app = FastAPI()

# Configuration
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def cleanup_file(path: Path):
    """Deletes a file if it exists."""
    try:
        if path.exists():
            os.remove(path)
    except Exception:
        pass  # Silently fail if file is already gone or locked

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Receives a file and saves it temporarily."""
    try:
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return JSONResponse(
            content={"filename": unique_filename, "message": "File uploaded successfully"},
            status_code=201
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/convert")
async def convert_file(filename: str):
    """Mocks a file conversion process."""
    source_path = UPLOAD_DIR / filename
    
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Mock conversion: Prefix filename with 'converted_'
        converted_filename = f"converted_{filename}"
        dest_path = UPLOAD_DIR / converted_filename
        
        # Simple copy for mock conversion
        shutil.copy2(source_path, dest_path)
        
        # Verify the converted file exists
        if not dest_path.exists():
             raise HTTPException(status_code=500, detail="Conversion failed")

        return JSONResponse(
            content={"converted_filename": converted_filename, "message": "File converted successfully"},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_file(filename: str, background_tasks: BackgroundTasks):
    """Returns the file and deletes it after download."""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Schedule file deletion after response is sent
    background_tasks.add_task(cleanup_file, file_path)
    
    return FileResponse(
        path=file_path, 
        filename=filename,
        media_type="application/octet-stream"
    )
