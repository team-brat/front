
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
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-10">Document Verification</h2>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Barcode</h3>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode"
          className={`w-full border px-4 py-3 rounded-lg text-gray-800 text-sm shadow-sm ${barcodeError ? 'border-red-400' : 'border-gray-300'}`}
        />
        {barcodeError && <p className="text-red-500 text-sm mt-2">Barcode required</p>}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Upload or Capture Documents</h3>
        <div className="space-y-6">
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{getDocumentLabel(type)}</span>
                {ocrProgress[type] && (
                  <span className="text-xs text-gray-500">({ocrProgress[type]})</span>
                )}
              </div>
              <div className="flex gap-4">
                <label className="w-full cursor-pointer text-center bg-lime-100 hover:bg-lime-200 text-lime-800 font-semibold py-2 rounded-lg border border-lime-300">
                  <input type="file" className="sr-only" onChange={(e) => handleFileChange(e, type)} />
                  Upload File
                </label>
                <button
                  onClick={() => openCamera(type)}
                  className="w-full bg-lime-500 hover:bg-lime-400 text-white font-semibold py-2 rounded-lg flex items-center justify-center"
                >
                  <CameraIcon className="w-5 h-5 mr-2" /> Capture
                </button>
              </div>
            </div>
          ))}
          <div className="text-right">
            <button
              onClick={handleConfirm}
              className="inline-block bg-lime-500 hover:bg-lime-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Verification Status</h4>
        <div className="divide-y divide-gray-100 text-sm">
          {['invoice', 'bill', 'airway'].map((type) => {
            const status = ocrProgress[type] || 'Not Started';
            const label = getDocumentLabel(type);
            return (
              <div key={type} className="flex justify-between py-2">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-800 font-medium">{status}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {['invoice', 'bill', 'airway'].map((type) => {
          const doc = perDocumentScores[type];
          const uploaded = docsUploaded[type];
          const label = getLabel(type);
          const content = !uploaded ? 'Not Started' : !doc ? 'In Progress' : `${Math.round(doc.score * 100)}% match`;
          const color = doc ? (doc.matched ? 'border-lime-400 bg-lime-50' : 'border-red-400 bg-red-50') : 'border-gray-300 bg-gray-50';
          return (
            <div key={type} className={`p-4 rounded-xl border text-center ${color}`}>
              <h4 className="font-semibold text-gray-800 mb-1">{label}</h4>
              <p className="text-lg font-bold text-gray-900">{content}</p>
            </div>
          );
        })}
      </div>

      {mismatchAlert && (
        <div className="mt-8 flex items-start bg-yellow-50 text-yellow-800 p-4 rounded-lg border-l-4 border-yellow-500">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <span>{mismatchAlert}</span>
        </div>
      )}
    </div>
  );
};

export default DocVerification;
