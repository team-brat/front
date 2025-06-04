import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { ExclamationTriangleIcon, CameraIcon, XMarkIcon } from '@heroicons/react/20/solid';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const DocVerification = () => {
  const [docsUploaded, setDocsUploaded] = useState({ invoice: false, bill: false, airway: false });
  const [barcode, setBarcode] = useState('');
  const [orderId, setOrderId] = useState(''); // New state to store order_id
  const [accuracy, setAccuracy] = useState(null);
  const [files, setFiles] = useState({ invoice: null, bill: null, airway: null });
  const [barcodeError, setBarcodeError] = useState(false);
  const [documentOcrResults, setDocumentOcrResults] = useState({}); // OCR results from retrieved documents
  const [perDocumentScores, setPerDocumentScores] = useState({});
  const [mismatchAlert, setMismatchAlert] = useState('');
  const [ocrProgress, setOcrProgress] = useState({ invoice: '', bill: '', airway: '' }); // Progress for user uploaded/captured docs
  const [apiError, setApiError] = useState('');
  const [retrievalMessage, setRetrievalMessage] = useState('');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Used for initial capture from video
  const streamRef = useRef(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [fullImage, setFullImage] = useState(null); // Full image data URL for cropping
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState({ width: 80, height: 80, x: 10, y: 10 }); // Default crop values
  const imgRef = useRef(null); // Ref for the image in ReactCrop
  const previewCanvasRef = useRef(null); // Canvas for drawing the final cropped image

  const [currentStep, setCurrentStep] = useState('barcode');
  // const [showSuccessModal, setShowSuccessModal] = useState(false); // Replaced by modalState
  const [modalState, setModalState] = useState({ isOpen: false, type: '', title: '', message: '' });


  const closeModal = () => {
    setModalState({ isOpen: false, type: '', title: '', message: '' });
  };

  const resetInitialStateAndCloseModal = () => {
    resetInitialState();
    closeModal();
  };

  const resetInitialState = () => {
    setDocsUploaded({ invoice: false, bill: false, airway: false });
    setBarcode('');
    setOrderId(''); // Reset orderId
    setAccuracy(null);
    setFiles({ invoice: null, bill: null, airway: null });
    setBarcodeError(false);
    setDocumentOcrResults({});
    setPerDocumentScores({});
    setMismatchAlert('');
    setOcrProgress({ invoice: '', bill: '', airway: '' });
    setApiError('');
    setRetrievalMessage('');
    
    setCurrentStep('barcode');
    // setShowSuccessModal(false); // Handled by closeModal now

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCurrentDocType(null);
    setIsCropMode(false);
    setFullImage(null);
    setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
    setCompletedCrop({ width: 80, height: 80, x: 10, y: 10 });
  };

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

  const handleRetrieve = async () => {
    if (!barcode) return setBarcodeError(true);
    setBarcodeError(false);
    setApiError('');
    setRetrievalMessage('Retrieving documents...');
    // Reset states related to previous verification for this specific step
    setDocumentOcrResults({});
    setFiles({ invoice: null, bill: null, airway: null });
    setDocsUploaded({ invoice: false, bill: false, airway: false });
    setOcrProgress({ invoice: '', bill: '', airway: '' });
    setPerDocumentScores({});
    setAccuracy(null);
    setMismatchAlert('');
    setOrderId(''); // Reset orderId before new retrieval

    try {
      const res = await fetch(`https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders/by-barcode/${barcode}`);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to retrieve documents: ${res.status} ${errorData}`);
      }
      const data = await res.json();

      // Extract order_id as per instruction: "order" 키 값의 value에서 "order_id"
      if (data.order && data.order.order_id) {
        setOrderId(data.order.order_id);
      } else {
        // Fallback or if structure is different, try direct data.order_id (as was in original code)
        // This part might need adjustment based on actual API response structure.
        // For now, strictly following the "data.order.order_id" instruction.
        console.error("order_id not found in data.order.order_id. Full response:", data);
        // If data.order_id was the previous correct path:
        if (data.order_id) {
            setOrderId(data.order_id);
            console.warn("Used fallback data.order_id as data.order.order_id was not found.");
        } else {
            throw new Error('Order ID could not be extracted from the response.');
        }
      }
      
      const urls = data.documents.map(doc => ({ type: doc.document_type, url: doc.download_url }));

      const ocrResults = {};
      for (const { type, url } of urls) {
        const key = type.toLowerCase().includes('airway') ? 'airway' : type.toLowerCase().includes('invoice') ? 'invoice' : type.toLowerCase().includes('bill') ? 'bill' : null;
        if (!key) continue;
        ocrResults[key] = `Retrieved OCR text for ${key}`; // Placeholder
      }

      setDocumentOcrResults(ocrResults);
      setRetrievalMessage(''); 
      setCurrentStep('upload');
    } catch (err) {
      setApiError(err.message);
      setRetrievalMessage(''); 
    }
  };

  const handleVerifyDocuments = async () => {
    if (!barcode) {
        setBarcodeError(true);
        setApiError("Barcode is missing.");
        return;
    }
    setBarcodeError(false);

    if (Object.keys(documentOcrResults).length === 0) {
        setApiError("Please retrieve documents first before verifying.");
        return;
    }
    
    const isAnyDocUploaded = Object.values(docsUploaded).some(status => status === true);
    if (!isAnyDocUploaded) {
        setApiError("Please upload or capture at least one document to verify.");
        return;
    }
    setApiError('');

    // New logic to automatically pass verification and set "Approved"
    setAccuracy(100); // Overall accuracy
    setPerDocumentScores({ // These scores will be used to display "Approved"
      invoice: { score: 1, matched: true },
      bill: { score: 1, matched: true },
      airway: { score: 1, matched: true }
    });
    setMismatchAlert(''); // Clear any previous mismatch alerts
    
    const newOcrProgress = { ...ocrProgress };
    for (const type of ['invoice', 'bill', 'airway']) {
        if (docsUploaded[type]) { // Only mark as 'Verified' if it was uploaded/captured
            newOcrProgress[type] = 'Verified';
        }
    }
    setOcrProgress(newOcrProgress);

    // Delay the transition to results step by 2 seconds
    setTimeout(() => {
      setCurrentStep('results'); // Move to step 3
    }, 2000);
  };

  const verifyUploadedDocuments = async (ocrReference) => {
    const results = {};
    let matchCount = 0;
    let processedFileCount = 0;

    for (const [docType, file] of Object.entries(files)) {
      if (!file) continue; 
      
      processedFileCount++;
      if (!ocrReference[docType]) {
        console.warn(`No OCR reference found for ${docType}. Skipping comparison.`);
        results[docType] = { score: 0, matched: false, error: 'No reference document' };
        setOcrProgress(prev => ({ ...prev, [docType]: 'Reference Missing' }));
        continue;
      }

      try {
        setOcrProgress(prev => ({ ...prev, [docType]: 'Performing OCR...' }));
        const uploadedText = await Tesseract.recognize(file, 'eng').then(r => r.data.text);
        setOcrProgress(prev => ({ ...prev, [docType]: 'Calculating Score...' }));
        const score = jaccardSimilarity(uploadedText, ocrReference[docType]);
        const matched = score >= 0.7;
        results[docType] = { score, matched };
        if (matched) matchCount++;
        setOcrProgress(prev => ({ ...prev, [docType]: 'Verified' }));
      } catch (err) {
        console.error(`Error processing ${docType}:`, err);
        results[docType] = { matched: false, score: 0, error: 'OCR Failed' };
        setOcrProgress(prev => ({ ...prev, [docType]: 'OCR Error' }));
      }
    }
    
    setAccuracy(processedFileCount > 0 ? Math.round((matchCount / processedFileCount) * 100) : 0);
    const mismatches = Object.entries(results).filter(([_, r]) => !r.matched && docsUploaded[_]);
    setMismatchAlert(mismatches.length ? `Mismatched: ${mismatches.map(([k, r]) => `${k}: ${r.error ? r.error : Math.round(r.score * 100)+'% match'}`).join(', ')}` : '');
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
      .catch(() => alert("Camera access denied. Please enable camera permissions in your browser settings."));
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    setFullImage(canvas.toDataURL('image/jpeg', 0.95));
    closeCamera(); 
    setIsCropMode(true);
  };

  const applyCrop = () => {
    if (!previewCanvasRef.current || !imgRef.current || !fullImage) {
      console.error("Crop apply prerequisites not met:", { previewCanvasRefExists: !!previewCanvasRef.current, imgRefExists: !!imgRef.current, fullImageExists: !!fullImage });
      return;
    }

    const imageElement = imgRef.current; 
    const canvas = previewCanvasRef.current; 
    const cropData = completedCrop || { width: 80, height: 80, x: 10, y: 10 }; 

    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;

    canvas.width = cropData.width;
    canvas.height = cropData.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imageElement,      
      cropData.x * scaleX, 
      cropData.y * scaleY, 
      cropData.width * scaleX,  
      cropData.height * scaleY, 
      0,                   
      0,                   
      cropData.width,      
      cropData.height      
    );

    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `${currentDocType}.jpg`, { type: 'image/jpeg' });
        setFiles(prev => ({ ...prev, [currentDocType]: file }));
        setDocsUploaded(prev => ({ ...prev, [currentDocType]: true }));
        setOcrProgress(prev => ({ ...prev, [currentDocType]: 'Image Captured' }));
      } else {
        console.error("Canvas toBlob resulted in null.");
      }
      setIsCropMode(false);
      setFullImage(null);
      setCompletedCrop({ width: 80, height: 80, x: 10, y: 10 }); 
    }, 'image/jpeg', 0.95);
  };

  const getLabel = (type) => type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
  const getDocumentLabel = (type) => {
    return type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
  };

  const steps = [
    { id: '1', name: 'Enter Barcode', key: 'barcode' },
    { id: '2', name: 'Upload Documents', key: 'upload' },
    { id: '3', name: 'Verification Results', key: 'results' },
  ];

  const renderBreadcrumb = () => (
    <nav className="mb-8" aria-label="Progress">
      <ol className="flex space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.key} className="flex-1">
            <div
              className={`flex flex-col text-sm font-medium border-b-4 pb-1 ${
                currentStep === step.key
                  ? 'text-lime-600 border-lime-500'
                  : steps.findIndex((s) => s.key === currentStep) > stepIdx
                  ? 'text-gray-500 border-gray-300' // Completed step
                  : 'text-gray-400 border-gray-100' // Future step
              }`}
            >
              <span>Step {step.id}</span>
              <span>{step.name}</span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );

  const canEnableConfirmStep2Button = Object.values(docsUploaded).some(isUploaded => isUploaded);

  const finalizeVerification = async () => {
    setApiError(''); // Clear previous errors before this specific action

    if (!orderId) {
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Order ID Missing', 
        message: 'Order ID is not available. Please ensure documents were retrieved successfully in Step 1.' 
      });
      return;
    }

    try {
      const response = await fetch(`https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          comments: '테스트를 위한 자동 승인입니다.', // Automatic approval for testing.
          user_id: 'approver-user', // Placeholder user_id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Order status updated:', data);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Verification Finalized', 
        message: 'The order status has been successfully updated to APPROVED.' 
      });
      // setShowSuccessModal(true); // Replaced by modalState
    } catch (error) {
      console.error('Error finalizing verification:', error);
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Finalization Failed', 
        message: `Failed to update order status. ${error.message}` 
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[80vh] max-w-lg" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex mt-4 space-x-4">
            <button onClick={closeCamera} className="bg-gray-700 px-4 py-2 rounded text-white">Cancel</button>
            <button onClick={captureImage} className="bg-lime-500 px-4 py-2 rounded text-white">Capture</button>
          </div>
        </div>
      )}

      {isCropMode && fullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 p-4 flex flex-col items-center justify-center">
          <div className="bg-white p-2 rounded-lg shadow-xl">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined} 
            >
              <img 
                ref={imgRef} 
                src={fullImage} 
                alt="Captured for cropping" 
                style={{ maxHeight: '70vh', maxWidth: '80vw', imageRendering: 'pixelated' }} 
                onLoad={(e) => {
                    if (completedCrop && (completedCrop.width === 0 || completedCrop.height === 0)) {
                        setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
                    }
                }}
              />
            </ReactCrop>
          </div>
          <canvas ref={previewCanvasRef} className="hidden" /> 
          <div className="flex mt-4 space-x-4">
            <button onClick={() => { setIsCropMode(false); setFullImage(null); setCompletedCrop({ width: 80, height: 80, x: 10, y: 10 });}} className="bg-gray-700 px-4 py-2 rounded text-white">Cancel</button>
            <button 
                onClick={applyCrop} 
                className="bg-lime-500 px-4 py-2 rounded text-white"
            >
                Apply Crop
            </button>
          </div>
        </div>
      )}

      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
                <button 
                    onClick={closeModal} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className={`text-2xl font-bold mb-4 ${modalState.type === 'success' ? 'text-lime-600' : 'text-red-600'}`}>
                    {modalState.title}
                </h3>
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{modalState.message}</p>
                <button
                    onClick={modalState.type === 'success' ? resetInitialStateAndCloseModal : closeModal}
                    className={`w-full font-semibold px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out ${
                        modalState.type === 'success' 
                            ? 'bg-lime-500 hover:bg-lime-600 text-white' 
                            : 'bg-gray-600 hover:bg-gray-700 text-white' // Adjusted error button color
                    }`}
                >
                    OK
                </button>
            </div>
        </div>
      )}

      {renderBreadcrumb()}

      <h2 className="text-3xl font-bold text-gray-800 mb-10">Document Verification</h2>

      {/* Step 1: Barcode Input */}
      <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10 ${currentStep !== 'barcode' ? 'opacity-50' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Enter Barcode & Retrieve Documents</h3>
        {apiError && currentStep === 'barcode' && <p className="text-red-500 text-sm mb-2">{apiError}</p>}
        <div className="flex items-center">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode"
            className={`flex-grow border px-4 py-3 rounded-lg text-gray-800 text-sm shadow-sm ${barcodeError ? 'border-red-400' : 'border-gray-300'}`}
            disabled={currentStep !== 'barcode'}
          />
          <button
            onClick={handleRetrieve}
            className="ml-2 bg-lime-500 hover:bg-lime-400 text-white font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
            disabled={currentStep !== 'barcode' || !barcode}
          >
            Retrieve
          </button>
        </div>
        {barcodeError && currentStep === 'barcode' && <p className="text-red-500 text-sm mt-2">Barcode required</p>}
        {retrievalMessage && currentStep === 'barcode' && <p className="text-green-600 text-sm mt-2">{retrievalMessage}</p>}
      </div>

      {/* Step 2: Upload Documents */}
      <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10 ${currentStep !== 'upload' ? 'opacity-50' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">2. Upload or Capture Your Documents</h3>
        {apiError && currentStep === 'upload' && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
        <div className="space-y-6">
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{getDocumentLabel(type)}</span>
                {ocrProgress[type] && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ocrProgress[type] === 'Processed' || ocrProgress[type] === 'Verified' ? 'bg-green-100 text-green-700' :
                    ocrProgress[type].includes('Error') || ocrProgress[type].includes('Missing') ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {ocrProgress[type]}
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <label className={`w-full cursor-pointer text-center bg-lime-100 hover:bg-lime-200 text-lime-800 font-semibold py-2 rounded-lg border border-lime-300 ${currentStep !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input type="file" className="sr-only" onChange={(e) => handleFileChange(e, type)} accept="image/*,.pdf" disabled={currentStep !== 'upload'}/>
                  Upload File
                </label>
                <button
                  onClick={() => openCamera(type)}
                  className={`w-full bg-lime-500 hover:bg-lime-400 text-white font-semibold py-2 rounded-lg flex items-center justify-center ${currentStep !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentStep !== 'upload'}
                >
                  <CameraIcon className="w-5 h-5 mr-2" /> Capture
                </button>
              </div>
            </div>
          ))}
          <div className="text-right mt-8">
            <button
              onClick={handleVerifyDocuments}
              disabled={!canEnableConfirmStep2Button || currentStep !== 'upload'}
              className="inline-block bg-lime-500 hover:bg-lime-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      
      {/* Step 3: Verification Results */}
      { (currentStep === 'results' && (accuracy !== null || Object.keys(perDocumentScores).length > 0)) &&
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Verification Results</h3>
          {accuracy !== null && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700">Overall:</h4>
              <p className="text-2xl font-bold text-green-600">Approved</p>
            </div>
          )}
          
          <h4 className="text-md font-semibold text-gray-700 mb-2">Per Document:</h4>
          <div className="grid md:grid-cols-3 gap-6">
            {['invoice', 'bill', 'airway'].map((type) => {
              const docScoreData = perDocumentScores[type];
              const uploaded = docsUploaded[type]; 
              const label = getLabel(type);
              
              let content = 'Not Uploaded';
              let color = 'border-gray-300 bg-gray-50 text-gray-500';

              if (uploaded && docScoreData) { 
                if (docScoreData.error) { 
                    content = docScoreData.error;
                    color = 'border-red-400 bg-red-50 text-red-700';
                } else if (docScoreData.matched) {
                    content = "Approved";
                    color = 'border-lime-400 bg-lime-50 text-lime-700';
                } else { 
                    content = `${Math.round(docScoreData.score * 100)}% match`;
                    color = 'border-red-400 bg-red-50 text-red-700';
                }
              } else if (uploaded && !docScoreData) { 
                  content = ocrProgress[type] || 'Processing...';
                  color = 'border-blue-400 bg-blue-50 text-blue-700';
              }

              return (
                <div key={type} className={`p-4 rounded-xl border text-center ${color}`}>
                  <h4 className="font-semibold text-gray-800 mb-1">{label}</h4>
                  <p className="text-lg font-bold">{content}</p>
                </div>
              );
            })}
          </div>
           {mismatchAlert && (
            <div className="mt-8 flex items-start bg-yellow-50 text-yellow-700 p-4 rounded-lg border-l-4 border-yellow-500">
              <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{mismatchAlert}</span>
            </div>
          )}
          <div className="text-center mt-10">
                <button
                    onClick={finalizeVerification}
                    className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
                    disabled={!orderId} // Disable if orderId is not available
                >
                    Finalize Verification
                </button>
            </div>
        </div>
      }
    </div>
  );
};

export default DocVerification;