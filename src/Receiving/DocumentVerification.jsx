import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

const DocVerification = () => {
  const [docsUploaded, setDocsUploaded] = useState({ invoice: false, bill: false, airway: false });
  const [barcode, setBarcode] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [files, setFiles] = useState({ invoice: null, bill: null, airway: null });
  const [barcodeError, setBarcodeError] = useState(false);
  const [documentOcrResults, setDocumentOcrResults] = useState({});
  const [perDocumentScores, setPerDocumentScores] = useState({});
  const [mismatchAlert, setMismatchAlert] = useState('');
  const [ocrProgress, setOcrProgress] = useState({ invoice: '', bill: '', airway: '' });

  const handleFileChange = (e, docType) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [docType]: file }));
      setDocsUploaded(prev => ({ ...prev, [docType]: true }));
      setOcrProgress(prev => ({ ...prev, [docType]: 'Performing OCR...' }));

      // Start OCR immediately upon file input
      Tesseract.recognize(file, 'eng')
        .then(ocrResult => {
          setDocumentOcrResults(prev => ({ ...prev, [docType]: ocrResult.data.text }));
          setOcrProgress(prev => ({ ...prev, [docType]: 'Submitted' }));
        })
        .catch(err => {
          console.error(`OCR failed for ${docType}:`, err);
          setOcrProgress(prev => ({ ...prev, [docType]: 'Failed' }));
        });
    }
  };

  const jaccardSimilarity = (textA, textB) => {
    const tokenize = text => new Set(
      text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(w => w.length > 2)
    );
    const setA = tokenize(textA);
    const setB = tokenize(textB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  };

  const handleConfirm = async () => {
    if (!barcode) {
      setBarcodeError(true);
      return;
    }
    setBarcodeError(false);

    try {
      const response = await fetch(`https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders/by-barcode/${barcode}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      const urls = data.documents.map(doc => ({ type: doc.document_type, url: doc.download_url }));

      const ocrResults = {};
      for (const { type, url } of urls) {
        const key = type.toLowerCase().includes('airway') ? 'airway'
           : type.toLowerCase().includes('invoice') ? 'invoice'
           : type.toLowerCase().includes('bill') ? 'bill'
           : null;

        if (key) {
          setOcrProgress(prev => ({ ...prev, [key]: 'Performing OCR...' }));
          const ocrResult = await Tesseract.recognize(url, 'eng');
          ocrResults[key] = ocrResult.data.text;
          setOcrProgress(prev => ({ ...prev, [key]: 'Submitted' }));
        }
      }
      setDocumentOcrResults(ocrResults);

      await verifyUploadedDocuments(ocrResults);

    } catch (error) {
      console.error('OCR or fetch error:', error);
    }
  };

  const verifyUploadedDocuments = async (ocrReference) => {
    const results = {};
    let matchCount = 0;

    for (const [docType, file] of Object.entries(files)) {
      if (!file || !ocrReference) continue;
      try {
        setOcrProgress(prev => ({ ...prev, [docType]: 'Performing OCR...' }));
        const uploadedText = documentOcrResults[docType];
        const referenceText = ocrReference[docType];
        if (!referenceText) continue;

        const score = jaccardSimilarity(uploadedText, referenceText);
        const matched = score >= 0.7;

        results[docType] = { score, matched };
        if (matched) matchCount++;
        setOcrProgress(prev => ({ ...prev, [docType]: 'Submitted' }));
      } catch (err) {
        console.error(`OCR failed for ${docType}:`, err);
        results[docType] = { matched: false, score: 0 };
        setOcrProgress(prev => ({ ...prev, [docType]: 'Failed' }));
      }
    }

    const total = Object.values(files).filter(Boolean).length;
    setAccuracy(total ? Math.round((matchCount / total) * 100) : 0);

    const mismatches = Object.entries(results).filter(([_, r]) => !r.matched);
    if (mismatches.length > 0) {
      const wrongDocs = mismatches.map(([k, r]) => `${k}: ${Math.round(r.score * 100)}%`).join(', ');
      setMismatchAlert(`Mismatched documents: ${wrongDocs}`);
    } else {
      setMismatchAlert('');
    }
    setPerDocumentScores(results);
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">Document Verification</h2>
      <div className="space-y-6 mb-10">
        <div className={`bg-[#152b22] p-6 rounded-xl border ${barcodeError ? 'border-red-500' : 'border-lime-400/20'}`}>
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Enter Barcode or Serial #</h3>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode or serial number..."
            className={`input w-full ${barcodeError ? 'border-red-500' : ''}`}
          />
          {barcodeError && <p className="text-red-400 text-xs mt-2">Barcode is required</p>}
        </div>

        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold text-lime-300 mb-4 pb-4">Upload Required Documents</h3>
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="flex items-center gap-4 mb-3">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, type)}
                className="block w-full md:w-auto text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a3e635]/20 file:text-lime-300 hover:file:bg-lime-400/30"
              />
              <span className="text-sm font-dm">
                {type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill'}{' '}
                {ocrProgress[type] && <span className="text-yellow-300 ml-2">({ocrProgress[type]})</span>}
              </span>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition">
              Confirm
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-start text-sm">
            {['invoice', 'bill', 'airway'].map((type) => {
              const label = type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
              const doc = perDocumentScores[type];
              const uploaded = docsUploaded[type];
              let content;
              if (!uploaded) content = <p className="text-lg text-gray-400">Waiting for file...</p>;
              else if (!doc) content = <p className="text-lg text-yellow-300">Calculating...</p>;
              else content = <p className="text-lg font-bold text-lime-300">{Math.round(doc.score * 100)}% match</p>;
              const borderColor = doc ? (doc.matched ? 'border-lime-400 bg-[#1f352b]/80' : 'border-red-400 bg-[#2b1f1f]/80') : 'border-gray-900 bg-[#1a1a1a]/80';
              return (
                <div key={type} className={`p-4 rounded-xl border ${borderColor} shadow`}>
                  <h4 className="text-base font-semibold mb-1 text-white">{label}</h4>
                  {content}
                </div>
              );
            })}
          </div>

          {mismatchAlert && (
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-4 mt-6">
              <div className="flex">
                <div className="shrink-0">
                  <ExclamationTriangleIcon aria-hidden="true" className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 whitespace-pre-line">{mismatchAlert}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-center gap-6">
            <button className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-lg">Approved</button>
            <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-lg">Declined</button>
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
