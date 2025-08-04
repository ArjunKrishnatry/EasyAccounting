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

memory_db = {"expenses": []}


@app.post("/uploadcsv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    headers = ['date', 'activity', 'expense', 'income', 'total']
    df = pd.read_csv(io.StringIO(content.decode("utf-8")), names=headers)

    df = df.replace([float('inf'), float('-inf')], None)
    df = df.fillna(0)  # Replace NaN with None (valid in JSON)
    df, remaning_classifications = classify(df)
    if remaning_classifications == []:
        parsed_data = df.to_dict(orient="records")
        return {"parsed": parsed_data}
    else:
        parsed_data = df.to_dict(orient="records")
        return {"rem_class": remaning_classifications, "parsed": parsed_data}

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

