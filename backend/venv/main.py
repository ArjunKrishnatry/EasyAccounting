import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from fastapi import UploadFile, File, Body
from classification_module import *
from data_display_module import *  # Assuming classify.py is in the same directory
import io
import json
import os
from datetime import datetime
import uuid

index = -1

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://your-production-domain.com",  # Replace with your production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)   

# File storage
STORAGE_FILE = "uploaded_files.json"

def load_stored_files():
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, 'r') as f:
            return json.load(f)
    return []

def save_stored_files(files):
    with open(STORAGE_FILE, 'w') as f:
        json.dump(files, f, indent=2)

@app.post("/uploadcsv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    headers = ['date', 'activity', 'expense', 'income', 'total']
    df = pd.read_csv(io.StringIO(content.decode("utf-8")), names=headers)

    df = df.replace([float('inf'), float('-inf')], None)
    df = df.fillna(0)  # Replace NaN with None (valid in JSON)
    df, remaning_classifications = classify(df)
    
    # Calculate totals
    total_expense = df['expense'].sum()
    total_income = df['income'].sum()
    total_records = len(df)
    
    # Create file record
    file_id = str(uuid.uuid4())
    file_record = {
        "id": file_id,
        "filename": file.filename,
        "uploadDate": datetime.now().isoformat(),
        "totalRecords": total_records,
        "totalExpense": float(total_expense),
        "totalIncome": float(total_income),
        "data": df.to_dict(orient="records")
    }
    
    # Store the file
    stored_files = load_stored_files()
    stored_files.append(file_record)
    save_stored_files(stored_files)
    
    if remaning_classifications == []:
        parsed_data = df.to_dict(orient="records")
        return {"parsed": parsed_data, "fileId": file_id}
    else:
        parsed_data = df.to_dict(orient="records")
        return {"rem_class": remaning_classifications, "parsed": parsed_data, "fileId": file_id}

@app.get("/stored-files")
def get_stored_files():
    files = load_stored_files()
    # Return both files and folders with their metadata
    result = []
    for item in files:
        if 'type' in item and item['type'] == 'folder':
            # Return folder metadata
            result.append({
                "id": item["id"],
                "type": "folder",
                "name": item["name"],
                "createdDate": item["createdDate"],
                "files": item["files"]  # Include the files array
            })
        else:
            # Return file metadata
            result.append({
                "id": item["id"],
                "filename": item["filename"],
                "uploadDate": item["uploadDate"],
                "totalRecords": item["totalRecords"],
                "totalExpense": item["totalExpense"],
                "totalIncome": item["totalIncome"]
            })
    return result

@app.get("/file-data/{file_id}")
def get_file_data(file_id: str):
    files = load_stored_files()
    for file in files:
        if file["id"] == file_id:
            return {"data": file["data"]}
    return {"error": "File not found"}

@app.delete("/file/{file_id}")
def delete_file(file_id: str):
    files = load_stored_files()
    files = [f for f in files if f["id"] != file_id]
    save_stored_files(files)
    return {"message": "File deleted successfully"}

@app.post("/reclassify")
async def reclassify(parsed: list = Body(...)):
    df = pd.DataFrame(parsed)
    df, _ = classify(df)  # This will use the updated JSON files
    parsed_data = df.to_dict(orient="records")
    return {"parsed": parsed_data}

@app.post("/addnewvalue")
async def add_new_activity_post(
    classification: str = Body(...), 
    activity: str = Body(...),
):
    addnewValue(classification,activity)
    print("new expense added")
    return {
        "message": "Expense added successfully",
        "classification": classification
    }

@app.post("/addnewclassification")
async def add_new_classification(
    new_classification: str = Body(...), 
    selected_activity: str = Body(...),
    chosen_type: str = Body(...)
):
    addnewClassification(classification=new_classification,activity=selected_activity,type=chosen_type)
    return{
        "message": "Classification added succesfully"
    }


@app.get("/expense-options")
def get_expense_classification_options():
    import json
    with open("expense_classification.json", "r") as f:
        expense_data = json.load(f)
    options = [item["classification"] for item in expense_data]
    print("expense options selected")
    return {"options": sorted(options)}

@app.get("/income-options")
def get_income_classification_options():
    import json
    with open("income_classification.json", "r") as f:
        income_data = json.load(f)
    options = [item["classification"] for item in income_data]
    print("income options selected")
    return {"options": sorted(options)}


@app.post("/pivot-table")
def sum_classifications(classifications: List = Body(...)):
    summed_classifications = create_summed_classifications(classifications)
    return summed_classifications

@app.post("/create-folder")
def create_folder(folder_data: dict = Body(...)):
    folder_name = folder_data.get("folder_name")
    if not folder_name:
        return {"error": "Folder name is required"}
    
    stored_files = load_stored_files()
    
    # Check if folder already exists
    for file in stored_files:
        if file.get("type") == "folder" and file.get("name") == folder_name:
            return {"error": "Folder already exists"}
    
    folder_id = str(uuid.uuid4())
    folder_record = {
        "id": folder_id,
        "type": "folder",
        "name": folder_name,
        "createdDate": datetime.now().isoformat(),
        "files": []
    }
    
    stored_files.append(folder_record)
    save_stored_files(stored_files)
    return {"message": "Folder created successfully", "folderId": folder_id}

@app.get("/debug-stored")
def debug_stored_files():
    """Debug endpoint to see what's actually stored"""
    files = load_stored_files()
    return {"files": files, "count": len(files)}

@app.post("/rename-file")
def rename_file(file_id: str = Body(...), new_name: str = Body(...)):
    stored_files = load_stored_files()
    
    for file in stored_files:
        if file["id"] == file_id:
            file["filename"] = new_name
            save_stored_files(stored_files)
            return {"message": "File renamed successfully"}
    
    return {"error": "File not found"}

@app.post("/move-file")
def move_file(file_id: str = Body(...), folder_id: str = Body(...)):
    stored_files = load_stored_files()
    
    # Find the file and folder
    file_to_move = None
    target_folder = None
    
    for file in stored_files:
        if file["id"] == file_id:
            file_to_move = file
        elif file["id"] == folder_id and file.get("type") == "folder":
            target_folder = file
    
    if not file_to_move:
        return {"error": "File not found"}
    if not target_folder:
        return {"error": "Folder not found"}
    
    # Remove file from current location
    stored_files = [f for f in stored_files if f["id"] != file_id]
    
    # Add file to folder
    target_folder["files"].append(file_to_move)
    
    save_stored_files(stored_files)
    return {"message": "File moved successfully"}

@app.delete("/folder/{folder_id}")
def delete_folder(folder_id: str):
    stored_files = load_stored_files()
    stored_files = [f for f in stored_files if f["id"] != folder_id]
    save_stored_files(stored_files)
    return {"message": "Folder deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

