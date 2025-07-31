import pandas as pd
import json

def classify(df):
    # Load classification data from JSON
    with open("expense_classification.json", "r") as f:
        expense_data = json.load(f)
    with open("income_classification.json", "r") as f:
        income_data = json.load(f)

    # Build lookup dictionaries from classification files
    expense_classification_map = {
        item["classification"]: [kw.lower() for kw in item["expenses_attributed"]]
        for item in expense_data
    }
    income_classification_map = {
        item["classification"]: [kw.lower() for kw in item["income_attributed"]]
        for item in income_data
    }

    remaining_classifications = []
    df["classification"] = "No classification"

    for idx, row in df.iterrows():
        activity = str(row["activity"]).lower()
        matched = False

        # Check if the row has expense or income and classify accordingly
        if int(row["expense"]) > 0:
            for category, keywords in expense_classification_map.items():
                for keyword in keywords:
                    if keyword == activity :
                        print(f"Category: {category}, Activity: {activity}")
                        df.at[idx, "classification"] = category
                        matched = True
                        break
            if not matched:
                row_dict = row.to_dict()
                row_dict['idx'] = idx
                remaining_classifications.append(row_dict)

        elif int(row["income"]) > 0:
            for category, keywords in income_classification_map.items():
                for keyword in keywords:
                    if keyword == activity :
                        print(f"Category: {category}, Activity: {activity}")
                        df.at[idx, "classification"] = category
                        matched = True
                        break
            if not matched:
                row_dict = row.to_dict()
                row_dict['idx'] = idx
                remaining_classifications.append(row_dict)

    df["expense"] = pd.to_numeric(df["expense"], errors='coerce').fillna(0)
    df["income"] = pd.to_numeric(df["income"], errors='coerce').fillna(0)
    df = df.sort_values(by="classification")
    print(remaining_classifications)
    
    return df, remaining_classifications

def addnewValue(classification, activity):
    print(classification[:1])
    if classification[:2] == "IN":
        with open("income_classification.json", "r") as f:
            data = json.load(f)
        # Find the block and add the expense
        for block in data:
            print(block["classification"])
            if block["classification"] == classification:
                print(block["classification"], classification)
                if activity not in block["income_attributed"]:
                    block["income_attributed"].append(activity)
                break

        with open("income_classification.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    else:
        with open("expense_classification.json", "r") as f:
            data = json.load(f)
        for block in data:
            print(block["classification"])
            if block["classification"] == classification:
                print(block["classification"], classification)
                if activity not in block["expenses_attributed"]:
                    block["expenses_attributed"].append(activity)
                break
        
        with open("expense_classification.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

def addnewClassification(classification, activity, type):
    if type == "income":
        with open("income_classification.json", "r") as f:
            data = json.load(f)
        
        new_block = {"classification":classification, "income_attributed": [activity]}
        data.append(new_block)

        with open("income_classification.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    else:
        with open("expense_classification.json", "r") as f:
            data = json.load(f)
        
        new_block = {"classification":classification, "expenses_attributed": [activity]}
        data.append(new_block)

        with open("expense_classification.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)


