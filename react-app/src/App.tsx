import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import TableView from './components/TableView';
import DataView from './components/DataView';
import ClassificationSelector from './components/ClassificationSelector';
import SideTable from './components/SideTable';
import api from './api';
import './App.css';

interface FileRecord {
  id: string;
  filename: string;
  uploadDate: string;
  totalRecords: number;
  totalExpense: number;
  totalIncome: number;
}

interface FolderRecord {
  id: string;
  type: 'folder';
  name: string;
  createdDate: string;
  files: FileRecord[];
}

type FileOrFolder = FileRecord | FolderRecord;

function App() {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showTableView, setShowTableView] = useState(true);
  const [showClassifier, setShowClassifier] = useState(false);
  const [showOrganized, setShowOrganized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [remaningclassifications, setRemaningClassifications] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileOrFolder[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Load stored files on component mount
  useEffect(() => {
    loadStoredFiles();
  }, []);

  const loadStoredFiles = async () => {
    try {
      const response = await api.get('/stored-files');
      console.log('Loaded files:', response.data); // Debug log
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error loading stored files:', error);
    }
  };

  const handleFileSelect = async (fileId: string) => {
    try {
      const response = await api.get(`/file-data/${fileId}`);
      if (response.data.data) {
        setParsedData(response.data.data);
        setSelectedFileId(fileId);
        setShowClassifier(false);
        setShowOrganized(false);
      }
    } catch (error) {
      console.error('Error loading file data:', error);
    }
  };

  const handleFileUpload = async (fileData: any, fileId?: string) => {
    setParsedData(fileData);
    if (fileId) {
      setSelectedFileId(fileId);
    }
    // Reload the file list to show the new file
    await loadStoredFiles();
  };

  return (
    <div className="App min-h-screen w-screen bg-gray-900 text-white flex flex-col">
      <header className="App-Header" style={{ width: '100%', textAlign: 'center', position: 'fixed', top: 0, left: 0, padding: '20px', backgroundColor: '#1a202c' }}>
        <h1>Financial Data Analysis</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="uploader-container w-full flex justify-center">
          <FileUploader
            setParsedData={handleFileUpload}
            setShowOrganized={setShowOrganized}
            setShowClassifier={setShowClassifier}
            setCurrentIndex={setCurrentIndex}
            setRemaningClassifications={setRemaningClassifications}
          />
        </div>

        <div className="main-flex-container">
          <div className="side-container">
            <SideTable
              uploadedFiles={uploadedFiles}
              onFileSelect={handleFileSelect}
              selectedFileId={selectedFileId}
              onRefresh={loadStoredFiles}
            />
          </div>

          <div className="right_container" style={{ display: 'flex', flexDirection: 'column', width: '80%' }}>
            <button onClick={() => setShowTableView(!showTableView)}>
              Switch Views
            </button>

            {showClassifier ? (
              <ClassificationSelector
                setShowClassifier={setShowClassifier}
                RemainingClassifications={remaningclassifications}
                setParsedData={setParsedData}
                parsedData={parsedData} />
            ) : (
              showTableView ? (
                <div>
                  <TableView data={parsedData} />
                </div>
              ) : (
                <div className="min-h-[300px]">
                  <DataView data={parsedData} />
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;