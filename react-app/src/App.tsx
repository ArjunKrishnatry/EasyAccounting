import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import TableView from './components/TableView';
import DataView from './components/DataView';
import ClassificationSelector from './components/ClassificationSelector';
import './App.css';

function App() {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showTableView, setShowTableView] = useState(true);
  const [showClassifier, setShowClassifier] = useState(false);
  const [showOrganized, setShowOrganized]= useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [remaningclassifications, setRemaningClassifications] = useState<any[]>([]);


  return (
    <div className="App min-h-screen w-screen bg-gray-900 text-white flex flex-col">
      <header className="App-Header" style={{ width: '100%', textAlign: 'center', position: 'fixed', top: 0, left: 0, padding: '20px', backgroundColor: '#1a202c' }}>
        <h1>Financial Data Analysis</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="uploader-container w-full flex justify-center">
          <FileUploader
            setParsedData={setParsedData}
            setShowOrganized={setShowOrganized}
            setShowClassifier={setShowClassifier}
            setCurrentIndex={setCurrentIndex}
            setRemaningClassifications={setRemaningClassifications}
          />
        </div>

        <div className="main-flex-container">
          <div className="side-container">
            <h2>Previous Months</h2>
            <p>Put dropdown of different years</p>
          </div>

          <div className="right_container" style={{ display: 'flex', flexDirection: 'column', width: '80%' }}>
            <button onClick={() => setShowTableView(!showTableView)}>
              Switch Views
            </button>

            {showClassifier ? (
              <ClassificationSelector
              setShowClassifier={setShowClassifier}
              RemainingClassifications = {remaningclassifications}
              setParsedData = {setParsedData}
              parsedData = {parsedData} />
            ) : (
              showTableView ? (
                <div>
                  <TableView data={parsedData} />
                </div>
              ) : (
                <div className="min-h-[300px]">
                  <DataView data={parsedData}/>
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