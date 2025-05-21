import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { ExclamationTriangleIcon, CameraIcon } from '@heroicons/react/20/solid';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [fullImage, setFullImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e, docType) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [docType]: file }));
      setDocsUploaded(prev => ({ ...prev, [docType]: true }));
      setOcrProgress(prev => ({ ...prev, [docType]: 'File Uploaded' }));
    }
  };

  const jaccardSimilarity = (textA, textB) => {
    const tokenize = text => new Set(text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(w => w.length > 2));
    const setA = tokenize(textA);
    const setB = tokenize(textB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  };

  const handleConfirm = async () => {
    if (!barcode) return setBarcodeError(true);
    setBarcodeError(false);

    try {
      const res = await fetch(`https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders/by-barcode/${barcode}`);
      const data = await res.json();
      const urls = data.documents.map(doc => ({ type: doc.document_type, url: doc.download_url }));

      const ocrResults = {};
      for (const { type, url } of urls) {
        const key = type.toLowerCase().includes('airway') ? 'airway' : type.toLowerCase().includes('invoice') ? 'invoice' : type.toLowerCase().includes('bill') ? 'bill' : null;
        if (!key) continue;
        setOcrProgress(prev => ({ ...prev, [key]: 'Performing OCR...' }));
        const ocrResult = await Tesseract.recognize(url, 'eng');
        ocrResults[key] = ocrResult.data.text;
        setOcrProgress(prev => ({ ...prev, [key]: 'Submitted' }));
      }

      setDocumentOcrResults(ocrResults);
      await verifyUploadedDocuments(ocrResults);
    } catch (err) {
      console.error(err);
    }
  };

  const verifyUploadedDocuments = async (ocrReference) => {
    const results = {};
    let matchCount = 0;

    for (const [docType, file] of Object.entries(files)) {
      if (!file || !ocrReference[docType]) continue;
      try {
        setOcrProgress(prev => ({ ...prev, [docType]: 'Calculating...' }));
        const uploadedText = await Tesseract.recognize(file, 'eng').then(r => r.data.text);
        const score = jaccardSimilarity(uploadedText, ocrReference[docType]);
        const matched = score >= 0.7;
        results[docType] = { score, matched };
        if (matched) matchCount++;
        setOcrProgress(prev => ({ ...prev, [docType]: 'Submitted' }));
      } catch (err) {
        console.error(err);
        results[docType] = { matched: false, score: 0 };
        setOcrProgress(prev => ({ ...prev, [docType]: 'Failed' }));
      }
    }

    setAccuracy(Object.values(files).filter(Boolean).length ? Math.round((matchCount / Object.values(files).filter(Boolean).length) * 100) : 0);
    const mismatches = Object.entries(results).filter(([_, r]) => !r.matched);
    setMismatchAlert(mismatches.length ? `Mismatched: ${mismatches.map(([k, r]) => `${k}: ${Math.round(r.score * 100)}%`).join(', ')}` : '');
    setPerDocumentScores(results);
  };

  const openCamera = (docType) => {
    setCurrentDocType(docType);
    setIsCameraOpen(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => alert("Camera access denied."));
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setFullImage(canvas.toDataURL('image/jpeg', 0.95));
    setIsCameraOpen(false);
    setIsCropMode(true);
  };

  const applyCrop = () => {
    if (!completedCrop || !previewCanvasRef.current) return;
    previewCanvasRef.current.toBlob(blob => {
      const file = new File([blob], `${currentDocType}.jpg`, { type: 'image/jpeg' });
      setFiles(prev => ({ ...prev, [currentDocType]: file }));
      setDocsUploaded(prev => ({ ...prev, [currentDocType]: true }));
      setOcrProgress(prev => ({ ...prev, [currentDocType]: 'Captured' }));
      setIsCropMode(false);
      setFullImage(null);
    }, 'image/jpeg', 0.95);
  };

  const getLabel = (type) => type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
  const getDocumentLabel = (type) => {
    return type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 text-white font-sans">
      <h2 className="text-3xl font-bold mb-8">Document Verification</h2>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex mt-4 space-x-4">
            <button onClick={closeCamera} className="bg-gray-700 px-4 py-2 rounded">Cancel</button>
            <button onClick={captureImage} className="bg-lime-500 px-4 py-2 rounded">Capture</button>
          </div>
        </div>
      )}

      {isCropMode && (
        <div className="fixed inset-0 bg-black z-50 p-4 flex flex-col items-center justify-center">
          <ReactCrop src={fullImage} crop={crop} onChange={c => setCrop(c)} onComplete={setCompletedCrop}>
            <img ref={imgRef} src={fullImage} alt="Captured" />
          </ReactCrop>
          <canvas ref={previewCanvasRef} className="hidden" />
          <div className="flex mt-4 space-x-4">
            <button onClick={() => setIsCropMode(false)} className="bg-gray-700 px-4 py-2 rounded">Cancel</button>
            <button onClick={applyCrop} className="bg-lime-500 px-4 py-2 rounded">Crop</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className={`p-4 rounded-xl ${barcodeError ? 'border-red-500' : 'border-lime-400/20'} border bg-[#152b22]`}>
          <h3 className="text-lg font-semibold mb-2 text-lime-300">Enter Barcode</h3>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="input w-full"
            placeholder="Enter barcode"
          />
          {barcodeError && <p className="text-red-400 text-sm mt-1">Barcode required</p>}
        </div>

        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold text-lime-300 mb-4">Upload or Capture Documents</h3>
          {
            ['invoice', 'bill', 'airway'].map((type) => (
              <div key={type} className="mb-5">
                <div className="text-sm font-semibold mb-2">
                  {getDocumentLabel(type)}{' '}
                  {ocrProgress[type] && (
                    <span className="text-yellow-300 ml-2">({ocrProgress[type]})</span>
                  )}
                </div>
            
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <label className="relative cursor-pointer block w-full">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, type)}
                      className="sr-only"
                    />
                    <span className="inline-block w-full text-center bg-lime-800/50 hover:bg-lime-700 text-white font-semibold py-2 px-4 rounded-xl transition">
                      Upload File
                    </span>
                  </label>
            
                  <button
                    onClick={() => openCamera(type)}
                    className="w-full bg-lime-500 hover:bg-lime-400 text-gray-900 font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center"
                  >
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Capture
                  </button>
                </div>
              </div>
            ))
            
            
          }
          
          <div className="text-right mt-4">
            <button
              onClick={handleConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-black font-semibold px-6 py-2 rounded-lg shadow-sm"
            >
              Confirm
            </button>
          </div>
        </div>
        <div className="bg-[#13291e] rounded-xl p-4 mb-6 border border-lime-400/20">
  <h4 className="text-lime-300 text-sm font-semibold mb-2">Verification Status</h4>
  {['invoice', 'bill', 'airway'].map((type) => {
    const status = ocrProgress[type];
    const label = getDocumentLabel(type);
    let color = 'text-gray-300';
    let message = 'Not Started';

    if (status.includes('File')) {
      color = 'text-blue-300';
      message = 'Document Uploaded';
    } else if (status.toLowerCase().includes('ocr')) {
      color = 'text-yellow-300';
      message = 'Running OCR';
    } else if (status.toLowerCase().includes('calculating')) {
      color = 'text-orange-300';
      message = 'Calculating Match Score';
    } else if (status.toLowerCase().includes('submitted')) {
      color = 'text-green-300';
      message = 'Match Calculated';
    } else if (status.toLowerCase().includes('failed')) {
      color = 'text-red-400';
      message = 'Failed to process';
    }

    return (
      <div key={type} className="flex justify-between text-sm py-1 px-2">
        <span className="text-white">{label}</span>
        <span className={`${color} font-medium`}>{message}</span>
      </div>
    );
  })}
</div>


        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {['invoice', 'bill', 'airway'].map((type) => {
            const doc = perDocumentScores[type];
            const uploaded = docsUploaded[type];
            const label = getLabel(type);
            const content = !uploaded
              ? 'Not Started'
              : !doc
              ? 'In Progress'
              : `${Math.round(doc.score * 100)}% match`;
            const color = doc ? (doc.matched ? 'border-lime-400' : 'border-red-400') : 'border-gray-400';
            const textColor = content === 'Not Started' || content === 'In Progress' ? 'text-[#1a1a1a]' : 'text-white';
            return (
              <div key={type} className={`p-4 rounded-xl border ${color} bg-[#1a1a1a] text-center`}>
                <h4 className="font-semibold mb-2 text-white">{label}</h4>
                <p className={`text-lg ${textColor}`}>{content}</p>
              </div>
            );
          })}
        </div>

        {mismatchAlert && (
          <div className="p-4 bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 mt-6 flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5" />
            <span>{mismatchAlert}</span>
          </div>
        )}
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
