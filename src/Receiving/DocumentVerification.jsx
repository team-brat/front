import React, { useState } from 'react';

const DocVerification = () => {
  const [docsUploaded, setDocsUploaded] = useState({ invoice: false, bill: false, airway: false });
  const [barcode, setBarcode] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [files, setFiles] = useState({ invoice: null, bill: null, airway: null });
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e, docType) => {
    if (e.target.files.length > 0) {
      setFiles({ ...files, [docType]: e.target.files[0] });
      setDocsUploaded({ ...docsUploaded, [docType]: true });
    }
  };

  const handleBarcodeConfirm = () => {
    // mock verification logic
    const randomAccuracy = Math.floor(Math.random() * 101); // 0~100%
    setAccuracy(randomAccuracy);
  };

  const handleConfirm = async () => {
    const API_URL = "https://zf42ytba0m.execute-api.us-east-2.amazonaws.com/dev"; // Base API URL
    const DOCUMENT_ENDPOINT = `${API_URL}/documents`;
    const orderId = `ORDER-${Date.now()}`;

    const uploadDocument = async (file, documentType) => {
      if (!file) return;

      const reader = new FileReader();
      
      try {
        const base64Content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Map document types to API expected format
        const documentTypeMap = {
          invoice: 'INVOICE',
          bill: 'BILL_OF_ENTRY',
          airway: 'AIRWAY_BILL'
        };

        const payload = {
          order_id: orderId,
          document_type: documentTypeMap[documentType],
          file_name: file.name,
          content_type: file.type,
          file_content: base64Content,
          user_id: "brat"
        };

        // Debug logs before API call
        // console.log('=== Debug Info for Document Upload ===');
        // console.log('Endpoint:', DOCUMENT_ENDPOINT);
        // console.log('Document Type:', documentTypeMap[documentType]);
        // console.log('File Name:', file.name);
        // console.log('Content Type:', file.type);
        // console.log('Order ID:', orderId);
        // console.log('Payload Size:', JSON.stringify(payload).length, 'bytes');
        // console.log('Base64 Content Preview:', base64Content.substring(0, 100) + '...');
        // console.log('================================');

        try {
          console.log(`Attempting to upload ${documentType} document...`);
          
          const response = await fetch(DOCUMENT_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include' // Include cookies if needed
          });

          console.log('Response Status:', response.status);
          console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Upload failed for ${documentType}`);
          }

          const result = await response.json();
          console.log(`${documentType} upload successful:`, result);
          return result;

        } catch (fetchError) {
          console.error('Fetch Error Details:', {
            message: fetchError.message,
            stack: fetchError.stack
          });
          throw new Error(`Network error while uploading ${documentType}: ${fetchError.message}`);
        }

      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        setUploadStatus(`Failed to upload ${documentType}: ${error.message}`);
        return null;
      }
    };

    setUploadStatus('Uploading documents...');

    try {
      const uploadPromises = [];
      for (const [docType, file] of Object.entries(files)) {
        if (file) {
          uploadPromises.push(uploadDocument(file, docType));
        }
      }

      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter(Boolean);
      const totalFiles = Object.values(files).filter(Boolean).length;
      
      if (successfulUploads.length === totalFiles) {
        setUploadStatus('All documents uploaded successfully!');
      } else {
        setUploadStatus(`${successfulUploads.length} out of ${totalFiles} documents uploaded successfully`);
      }
    } catch (error) {
      setUploadStatus('Error uploading documents');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">Document Verification</h2>

      <div className="space-y-6 mb-10">
        {/* Upload Area */}
        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-lime-300">Upload Required Documents</h3>
            <button 
              onClick={handleConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition">
              Confirm
            </button>
          </div>
          {uploadStatus && (
            <div className="mb-4 text-sm text-lime-400">
              {uploadStatus}
            </div>
          )}
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="flex items-center gap-4 mb-3">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, type)}
                className="block w-full md:w-auto text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a3e635]/20 file:text-lime-300 hover:file:bg-lime-400/30"
              />
              <span className="text-sm font-dm">
                {type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill'}{' '}
                {docsUploaded[type] && <span className="text-lime-400">Uploaded</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Barcode Check */}
        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Enter Barcode or Serial #</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode or serial number..."
              className="input w-full"
            />
            <button
              onClick={handleBarcodeConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="mt-8 text-center">
          <p className="text-lime-300 text-xl font-bold">Document verification match rate: {accuracy !== null ? accuracy : ''}%</p>
          <div className="mt-4 flex justify-center gap-6">
            <button className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-lg">
              Approved
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-lg">
              Declined
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          background-color: #0f1f17;
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #334d3d;
          color: white;
          font-size: 0.875rem;
        }
        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default DocVerification;