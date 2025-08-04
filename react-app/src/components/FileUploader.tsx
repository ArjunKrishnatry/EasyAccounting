import React, { useState } from 'react';
import api from "../api";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploaderProps {
    setParsedData: (data: any[], fileId?: string) => void;
    setShowOrganized: (show: boolean) => void;
    setShowClassifier: (show: boolean) => void;
    setCurrentIndex: (idx: number | null) => void;
    setRemaningClassifications: (data: any[]) => void;
}

export default function FileUploader({ setParsedData, setShowOrganized, setShowClassifier, setCurrentIndex, setRemaningClassifications }: FileUploaderProps,) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    async function handleFileUpload() {
        if (!file) return;

        setStatus('uploading');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post("/uploadcsv", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                }
            });

            setStatus('success');
            setUploadProgress(100);

            if (response.data && response.data.parsed) {
                // Pass both the parsed data and fileId to parent
                setParsedData(response.data.parsed, response.data.fileId);

                // Set remaningclassifications from backend response
                if (Array.isArray(response.data.rem_class)) {
                    setRemaningClassifications(response.data.rem_class);
                } else {
                    setRemaningClassifications([]);
                }

                if (Array.isArray(response.data.rem_class) && response.data.rem_class.length > 0) {
                    setShowOrganized(false);
                    setShowClassifier(true);
                    const unclassifiedIndex = response.data.parsed.findIndex(
                        (entry: any) => !entry.classification || entry.classification === 'No classification'
                    );
                    setCurrentIndex(unclassifiedIndex !== -1 ? unclassifiedIndex : null);
                } else {
                    setShowOrganized(true);
                    setShowClassifier(false);
                    setCurrentIndex(null);
                }
            }
        } catch {
            setStatus('error');
            setUploadProgress(0);
        };
    }

    return (
        <div className='space-y-4'>

            <label>Upload Financial Data  </label>
            <input type="file" accept=".csv" onChange={handleFileChange} />


            {status === 'uploading' && (
                <div className='space-y-2'>
                    <div className='h-2.5 w-full rounded-full bg-gray-200'>
                        <div
                            className='h-2.5 rounded-full bg-blue-600'
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">(uploadProgress)% uploaded</p>
                    <p>Uploading: {uploadProgress}%</p>
                    <progress value={uploadProgress} max="100"></progress>
                </div>
            )}

            {file && status !== 'uploading' && <button onClick={handleFileUpload}> Upload </button>}

            {status === 'success' && (
                <p className="text-sm text-green-600"> File uploaded successfully!</p>
            )}


            {status === 'error' && (
                <p className="text-sm text-red-600">Error uploading file. Please try again.</p>
            )}
        </div>
    );
}


