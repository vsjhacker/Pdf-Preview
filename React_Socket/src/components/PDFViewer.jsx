import React from 'react';

// Import the main component
import { Viewer } from '@react-pdf-viewer/core';

// Import the default layout styles and components
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'pdfjs-dist';

// Import the default layout for the viewer
import { Worker } from '@react-pdf-viewer/core';
import { DefaultLayout } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFViewer = ({ fileUrl }) => {
  // Function to trigger the print dialog
  const printPdf = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = fileUrl;
    document.body.appendChild(iframe);

    iframe.contentWindow.print();
    document.body.removeChild(iframe);

    if (window.chrome && window.chrome.webview) {
      const message = JSON.stringify({
          action: 'PrintPDF',
          status: 'Success',
      });
      window.chrome.webview.postMessage(message);
  }

  // Close the window
  window.close();

  };

  return (
    <>
    <div className="pdf-viewer-container" style={{ height: '90vh', width: '85%' }}>
      

      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
        <Viewer fileUrl={fileUrl} />
      </Worker>
      </div>
      
      {/* Fixed Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={printPdf}
          className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Print PDF
        </button>
      </div>
    
    </>
  );
};

export default PDFViewer;
