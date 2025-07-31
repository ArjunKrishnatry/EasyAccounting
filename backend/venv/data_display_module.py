import json

def create_summed_classifications(data):
    with open("expense_classification.json", "r") as f:
        expense_data = json.load(f)
    with open("income_classification.json", "r") as f:
        income_data = json.load(f)

    # Build a unified map of classifications with initial totals of 0
    classification_totals = {}

    for item in expense_data:
        classification_totals[item["classification"]] = 0

    for item in income_data:
        classification_totals[item["classification"]] = 0

    # Process each row in the data
    for row in data:
        expense = float(row[2]) if row[2] else 0
        income = float(row[3]) if row[3] else 0
        classification = row[4].strip()

        if classification in classification_totals:
            if expense > 0:
                classification_totals[classification] += expense
            elif income > 0:
                classification_totals[classification] += income

    # Convert to list of tuples
    tupled_classifications = list(classification_totals.items())

    return tupled_classifications