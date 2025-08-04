import React, { useState, useEffect } from 'react';
import api from "../api";
import DropDown from './DropDown';

interface ClassificationSelectorProps {
    setShowClassifier: (show: boolean) => void;
    RemainingClassifications: any[]
    setParsedData: (data: any[]) => void
    parsedData: any[]
}

export default function ClassificationSelector({ setShowClassifier, RemainingClassifications, setParsedData, parsedData }: ClassificationSelectorProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [remaninglen, setRemaningLen] = useState<number>(RemainingClassifications.length - 1);
    const [loading, setLoading] = useState(true);
    const [transactionType, setTransactionType] = useState<string>("");
    const [amt, setAmt] = useState<any>(null);
    const [activity, setActivity] = useState<string>("");
    const [index, setIndex] = useState<number | null>(null);
    const [showNewClassificationForm, setShowNewClassificationForm] = useState(false);
    const [newClassificationName, setNewClassificationName] = useState("");

    // Update all states when remaninglen or RemainingClassifications changes
    useEffect(() => {
        if (remaninglen >= 0 && RemainingClassifications[remaninglen]) {
            const current = RemainingClassifications[remaninglen];
            setIndex(current.idx);
            setActivity(current.activity);
            if (current.expense === 0) {
                setTransactionType("Income");
                setAmt(current.income);
            } else {
                setTransactionType("Expense");
                setAmt(current.expense);
            }
        }
    }, [remaninglen, RemainingClassifications]);

    // Fetch options when transactionType changes
    useEffect(() => {
        async function fetchOptions() {
            setLoading(true);
            try {
                const endpoint = transactionType === "Income" ? "/income-options" : "/expense-options";
                const response = await api.get(endpoint);
                setOptions(response.data.options);
            } catch (error) {
                console.error("Error fetching classification options:", error);
            } finally {
                setLoading(false);
            }
        }
        if (transactionType) fetchOptions();
    }, [transactionType]);

    async function handleSave() {
        if (!selectedOption) return;
        try {
            await api.post("/addnewvalue", {
                classification: selectedOption,
                activity: activity,
            });
            if (remaninglen === 0) {
                // All done, now reclassify everything
                const response = await api.post("/reclassify", parsedData);
                setParsedData(response.data.parsed);
                setShowClassifier(false);
            } else {
                setSelectedOption(null);
                setRemaningLen(remaninglen - 1);
            }
        } catch (error) {
            alert("Failed to save activity.");
        }
    }

    async function handleCreateNewClassification() {
        if (!newClassificationName.trim()) {
            alert("Please enter a classification name");
            return;
        }

        try {
            await api.post("/addnewclassification", {
                new_classification: newClassificationName.trim(),
                selected_activity: activity,
                chosen_type: transactionType.toLowerCase()
            });

            // Refresh options after creating new classification
            const endpoint = transactionType === "Income" ? "/income-options" : "/expense-options";
            const response = await api.get(endpoint);
            setOptions(response.data.options);

            // Select the newly created classification
            setSelectedOption(newClassificationName.trim());
            setNewClassificationName("");
            setShowNewClassificationForm(false);

            alert("New classification created successfully!");
        } catch (error) {
            alert("Failed to create new classification.");
        }
    }

    if (loading) return <div>Loading classification options...</div>;

    return (
        <div className="classification-selector">
            <h2>
                {selectedOption
                    ? `You selected ${selectedOption} for your classification`
                    : "Select your Classification"}
            </h2>
            <h3>
                Activity: {activity}
                <div></div>
                Type: {transactionType}
                <div></div>
                Amount: {amt}
            </h3>

            {!showNewClassificationForm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <DropDown
                        classifications={options}
                        showDropDown={true}
                        toggleDropDown={() => { }}
                        classificationSelection={(classification: string) => {
                            setSelectedOption(classification);
                        }}
                    />
                    <button
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            cursor: selectedOption ? 'pointer' : 'not-allowed',
                            opacity: selectedOption ? 1 : 0.5
                        }}
                        onClick={handleSave}
                        disabled={!selectedOption}
                    >
                        Select
                    </button>
                    <button
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowNewClassificationForm(true)}
                    >
                        Create New
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            New Classification Name:
                        </label>
                        <input
                            type="text"
                            value={newClassificationName}
                            onChange={(e) => setNewClassificationName(e.target.value)}
                            placeholder={`Enter new ${transactionType.toLowerCase()} classification`}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db',
                                width: '100%',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                background: '#059669',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onClick={handleCreateNewClassification}
                        >
                            Create Classification
                        </button>
                        <button
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                setShowNewClassificationForm(false);
                                setNewClassificationName("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}