import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PDFViewer from './components/PDFViewer';

function App() {
  const [pdfUrl, setPdfUrl] = useState('');

  // Fetch the latest PDF on component mount
  useEffect(() => {
    // Fetch the latest PDF path from the API
    fetch('http://localhost:3001/latest-pdfs')
      .then(response => response.json())
      .then(data => {
        if (data.filePath) {
          setPdfUrl(data.filePath); // Set the PDF URL if the API responds with it
        } else {
          console.error('No PDF found');
        }
      })
      .catch(error => {
        console.error('Error fetching the latest PDF:', error);
      });
  }, []);

  console.log(pdfUrl)

  return (
    <>
      <Navbar />
      {/* Only render PDFViewer if the PDF URL is available */}
      {pdfUrl ? <PDFViewer fileUrl={pdfUrl} /> : <p>Loading...</p>}
    </>
  );
}

export default App;
