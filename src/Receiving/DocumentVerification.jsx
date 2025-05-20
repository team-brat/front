import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { ExclamationTriangleIcon, CameraIcon } from '@heroicons/react/20/solid';

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
  
  // Camera and image related state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [capturedImages, setCapturedImages] = useState({ invoice: null, bill: null, airway: null });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Image crop related state
  const [isCropMode, setIsCropMode] = useState(false);
  const [fullImage, setFullImage] = useState(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null); // tl, tr, bl, br, t, r, b, l, move
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartRect, setDragStartRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cropCanvasRef = useRef(null);
  const cropImgRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // Open camera
  const openCamera = (docType) => {
    setCurrentDocType(docType);
    setIsCameraOpen(true);
    
    // Mobile-optimized camera settings
    const constraints = { 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 4/3 }
      } 
    };
    
    // Better compatibility for iOS Safari
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Ensure video loads properly on iOS
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("Video playback error:", e));
              }
            }, 300);
          }
        })
        .catch(err => {
          console.error("Camera access error:", err);
          alert("Cannot access camera. Please check permissions.");
          setIsCameraOpen(false);
        });
    } else {
      alert("Your browser doesn't support camera functionality.");
      setIsCameraOpen(false);
    }
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture image and enter crop mode
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the image data
    const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Store the full image and enter crop mode
    setFullImage(imageUrl);
    closeCamera();
    setIsCropMode(true);
  };
  
  // Initialize crop rectangle when image loads
  useEffect(() => {
    if (isCropMode && cropImgRef.current) {
      const loadHandler = () => {
        const img = cropImgRef.current;
        if (!img) return;
        
        const imgWidth = img.clientWidth;
        const imgHeight = img.clientHeight;
        
        setImageSize({ width: imgWidth, height: imgHeight });
        
        // Initial crop rectangle - covers most of the image
        const initialWidth = Math.max(imgWidth * 0.8, 40);
        const initialHeight = Math.max(imgHeight * 0.8, 40);
        setCropRect({
          x: (imgWidth - initialWidth) / 2,
          y: (imgHeight - initialHeight) / 2,
          width: initialWidth,
          height: initialHeight
        });
      };
      
      const img = cropImgRef.current;
      if (img.complete) {
        loadHandler();
      } else {
        img.addEventListener('load', loadHandler);
        return () => img.removeEventListener('load', loadHandler);
      }
    }
  }, [isCropMode, fullImage]);
  
  // Determine which part of the crop rectangle is being clicked
  const getCropHandleType = (x, y) => {
    const handleSize = 16; // Size of corner and edge handles
    const halfHandleSize = handleSize / 2;
    
    // Check corners first (they take precedence)
    // Top-left
    if (Math.abs(x - cropRect.x) <= halfHandleSize && Math.abs(y - cropRect.y) <= halfHandleSize)
      return 'tl';
    // Top-right
    if (Math.abs(x - (cropRect.x + cropRect.width)) <= halfHandleSize && Math.abs(y - cropRect.y) <= halfHandleSize)
      return 'tr';
    // Bottom-left
    if (Math.abs(x - cropRect.x) <= halfHandleSize && Math.abs(y - (cropRect.y + cropRect.height)) <= halfHandleSize)
      return 'bl';
    // Bottom-right
    if (Math.abs(x - (cropRect.x + cropRect.width)) <= halfHandleSize && Math.abs(y - (cropRect.y + cropRect.height)) <= halfHandleSize)
      return 'br';
    
    // Then check edges
    // Top edge
    if (y >= cropRect.y - halfHandleSize && y <= cropRect.y + halfHandleSize && 
        x > cropRect.x + halfHandleSize && x < cropRect.x + cropRect.width - halfHandleSize)
      return 't';
    // Right edge
    if (x >= cropRect.x + cropRect.width - halfHandleSize && x <= cropRect.x + cropRect.width + halfHandleSize &&
        y > cropRect.y + halfHandleSize && y < cropRect.y + cropRect.height - halfHandleSize)
      return 'r';
    // Bottom edge
    if (y >= cropRect.y + cropRect.height - halfHandleSize && y <= cropRect.y + cropRect.height + halfHandleSize &&
        x > cropRect.x + halfHandleSize && x < cropRect.x + cropRect.width - halfHandleSize)
      return 'b';
    // Left edge
    if (x >= cropRect.x - halfHandleSize && x <= cropRect.x + halfHandleSize &&
        y > cropRect.y + halfHandleSize && y < cropRect.y + cropRect.height - halfHandleSize)
      return 'l';
      
    // Inside the rectangle (for moving)
    if (x > cropRect.x && x < cropRect.x + cropRect.width && 
        y > cropRect.y && y < cropRect.y + cropRect.height)
      return 'move';
      
    return null;
  };
  
  // Mouse/Touch handlers for crop functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    
    const container = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    // Handle both mouse and touch events
    if (e.type === 'touchstart') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to container
    const x = clientX - container.left;
    const y = clientY - container.top;
    
    const handleType = getCropHandleType(x, y);
    if (handleType) {
      setIsDragging(true);
      setDragHandle(handleType);
      setDragStartPos({ x, y });
      setDragStartRect({ ...cropRect });
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    // Handle both mouse and touch events
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to container
    const x = clientX - container.left;
    const y = clientY - container.top;
    
    // Calculate movement delta
    const deltaX = x - dragStartPos.x;
    const deltaY = y - dragStartPos.y;
    
    let newRect = { ...cropRect };
    
    // Handle rectangle modifications based on handle type
    switch (dragHandle) {
      case 'tl': // Top-left corner
        newRect.x = Math.min(Math.max(0, dragStartRect.x + deltaX), dragStartRect.x + dragStartRect.width - 50);
        newRect.y = Math.min(Math.max(0, dragStartRect.y + deltaY), dragStartRect.y + dragStartRect.height - 50);
        newRect.width = Math.max(50, dragStartRect.width - deltaX);
        newRect.height = Math.max(50, dragStartRect.height - deltaY);
        break;
      case 'tr': // Top-right corner
        newRect.y = Math.min(Math.max(0, dragStartRect.y + deltaY), dragStartRect.y + dragStartRect.height - 50);
        newRect.width = Math.max(50, Math.min(imageSize.width - dragStartRect.x, dragStartRect.width + deltaX));
        newRect.height = Math.max(50, dragStartRect.height - deltaY);
        break;
      case 'bl': // Bottom-left corner
        newRect.x = Math.min(Math.max(0, dragStartRect.x + deltaX), dragStartRect.x + dragStartRect.width - 50);
        newRect.width = Math.max(50, dragStartRect.width - deltaX);
        newRect.height = Math.max(50, Math.min(imageSize.height - dragStartRect.y, dragStartRect.height + deltaY));
        break;
      case 'br': // Bottom-right corner
        newRect.width = Math.max(50, Math.min(imageSize.width - dragStartRect.x, dragStartRect.width + deltaX));
        newRect.height = Math.max(50, Math.min(imageSize.height - dragStartRect.y, dragStartRect.height + deltaY));
        break;
      case 't': // Top edge
        newRect.y = Math.min(Math.max(0, dragStartRect.y + deltaY), dragStartRect.y + dragStartRect.height - 50);
        newRect.height = Math.max(50, dragStartRect.height - deltaY);
        break;
      case 'r': // Right edge
        newRect.width = Math.max(50, Math.min(imageSize.width - dragStartRect.x, dragStartRect.width + deltaX));
        break;
      case 'b': // Bottom edge
        newRect.height = Math.max(50, Math.min(imageSize.height - dragStartRect.y, dragStartRect.height + deltaY));
        break;
      case 'l': // Left edge
        newRect.x = Math.min(Math.max(0, dragStartRect.x + deltaX), dragStartRect.x + dragStartRect.width - 50);
        newRect.width = Math.max(50, dragStartRect.width - deltaX);
        break;
      case 'move': // Move entire rectangle
        newRect.x = Math.max(0, Math.min(imageSize.width - dragStartRect.width, dragStartRect.x + deltaX));
        newRect.y = Math.max(0, Math.min(imageSize.height - dragStartRect.height, dragStartRect.y + deltaY));
        break;
    }
    
    setCropRect(newRect);
  };
  
  const handleMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
      setDragHandle(null);
    }
  };
  
  // Cursor style based on handle type
  const getCursorStyle = (handleType) => {
    switch (handleType) {
      case 'tl':
      case 'br':
        return 'nwse-resize';
      case 'tr':
      case 'bl':
        return 'nesw-resize';
      case 't':
      case 'b':
        return 'ns-resize';
      case 'l':
      case 'r':
        return 'ew-resize';
      case 'move':
        return 'move';
      default:
        return 'default';
    }
  };
  
  // Handle cursor changes on mouse movement (even when not dragging)
  const handleMouseMoveForCursor = (e) => {
    if (isDragging) return; // Already handled by the drag function
    
    const container = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - container.left;
    const y = clientY - container.top;
    
    const handleType = getCropHandleType(x, y);
    containerRef.current.style.cursor = getCursorStyle(handleType);
  };
  
  // Apply the crop and process the image
  const applyCrop = () => {
    if (!cropImgRef.current || !cropCanvasRef.current) return;
    
    const img = cropImgRef.current;
    const canvas = cropCanvasRef.current;
    const context = canvas.getContext('2d');
    
    // Calculate the actual crop coordinates relative to the original image
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const imgDisplayWidth = img.clientWidth;
    const imgDisplayHeight = img.clientHeight;
    
    // Scale the crop dimensions to match the original image size
    const scaleX = imgNaturalWidth / imgDisplayWidth;
    const scaleY = imgNaturalHeight / imgDisplayHeight;
    
    const cropX = cropRect.x * scaleX;
    const cropY = cropRect.y * scaleY;
    const cropWidth = cropRect.width * scaleX;
    const cropHeight = cropRect.height * scaleY;
    
    // Set canvas size to the crop dimensions
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    // Draw the cropped portion to the canvas
    context.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,  // Source rectangle
      0, 0, cropWidth, cropHeight           // Destination rectangle
    );
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      // Create image URL for display
      const imageUrl = URL.createObjectURL(blob);
      
      // Create file object for OCR processing
      const file = new File([blob], `${currentDocType}.jpg`, { type: 'image/jpeg' });
      
      // Update state
      setCapturedImages(prev => ({ ...prev, [currentDocType]: imageUrl }));
      setFiles(prev => ({ ...prev, [currentDocType]: file }));
      setDocsUploaded(prev => ({ ...prev, [currentDocType]: true }));
      setOcrProgress(prev => ({ ...prev, [currentDocType]: 'Image captured' }));
      
      // Exit crop mode
      setIsCropMode(false);
      setFullImage(null);
    }, 'image/jpeg', 0.95);
  };
  
  // Cancel cropping
  const cancelCrop = () => {
    setIsCropMode(false);
    setFullImage(null);
  };

  // Clean up resources on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  // This function makes the API call to fetch document data and then processes OCR
  const handleConfirm = async () => {
    if (!barcode) {
      setBarcodeError(true);
      return;
    }
    setBarcodeError(false);

    try {
      // Loading indicators
      setPerDocumentScores({}); // Reset previous scores
      
      // Fetch document data from API
      const response = await fetch(`https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders/by-barcode/${barcode}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      const urls = data.documents.map(doc => ({ type: doc.document_type, url: doc.download_url }));

      // Process OCR for each document type
      const ocrResults = {};
      for (const { type, url } of urls) {
        const key = type.toLowerCase().includes('airway') ? 'airway'
           : type.toLowerCase().includes('invoice') ? 'invoice'
           : type.toLowerCase().includes('bill') ? 'bill'
           : null;

        if (key) {
          setOcrProgress(prev => ({ ...prev, [key]: 'Processing OCR...' }));
          try {
            const ocrResult = await Tesseract.recognize(url, 'eng', {
              logger: m => console.log(m) // Optional: add progress logging
            });
            ocrResults[key] = ocrResult.data.text;
            setOcrProgress(prev => ({ ...prev, [key]: 'Submitted' }));
          } catch (err) {
            console.error(`OCR error for ${key}:`, err);
            setOcrProgress(prev => ({ ...prev, [key]: 'OCR Failed' }));
          }
        }
      }
      
      setDocumentOcrResults(ocrResults);
      
      // Now verify user uploaded documents against the fetched ones
      if (Object.keys(ocrResults).length > 0) {
        await verifyUploadedDocuments(ocrResults);
      } else {
        console.error("No OCR results found from API");
        alert("Could not retrieve document data. Please try a different barcode.");
      }

    } catch (error) {
      console.error('API or OCR error:', error);
      alert("Error processing request. Please try again.");
    }
  };

  // This function compares user uploaded documents with reference documents
  const verifyUploadedDocuments = async (ocrReference) => {
    const results = {};
    let matchCount = 0;

    for (const [docType, file] of Object.entries(files)) {
      // Skip if no file uploaded or no reference document
      if (!file || !ocrReference[docType]) continue;
      
      try {
        setOcrProgress(prev => ({ ...prev, [docType]: 'Calculating...' }));
        
        // Process OCR on uploaded file
        const uploadedText = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(m) // Optional: add progress logging
        }).then(ocrResult => ocrResult.data.text);
        
        const referenceText = ocrReference[docType];
        
        // Calculate similarity score
        const score = jaccardSimilarity(uploadedText, referenceText);
        const matched = score >= 0.7; // 70% threshold for match

        results[docType] = { score, matched };
        if (matched) matchCount++;
        setOcrProgress(prev => ({ ...prev, [docType]: 'Submitted' }));
      } catch (err) {
        console.error(`OCR failed for ${docType}:`, err);
        results[docType] = { matched: false, score: 0 };
        setOcrProgress(prev => ({ ...prev, [docType]: 'Failed' }));
      }
    }

    // Calculate overall accuracy
    const total = Object.values(files).filter(Boolean).length;
    setAccuracy(total ? Math.round((matchCount / total) * 100) : 0);

    // Generate mismatch alert if any documents don't match
    const mismatches = Object.entries(results).filter(([_, r]) => !r.matched);
    if (mismatches.length > 0) {
      const wrongDocs = mismatches.map(([k, r]) => `${k}: ${Math.round(r.score * 100)}%`).join(', ');
      setMismatchAlert(`Mismatched documents: ${wrongDocs}`);
    } else {
      setMismatchAlert('');
    }
    
    setPerDocumentScores(results);
  };

  const getDocumentLabel = (type) => {
    return type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill';
  };
  
  // Empty function since we don't need grid lines anymore
  const renderCropGrid = () => {
    return null;
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">Document Verification</h2>
      
      {/* Camera UI */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="relative w-full max-w-lg max-h-[70vh]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
          
          {/* Fixed bottom button area */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 flex justify-center space-x-4 safe-bottom">
            <button 
              onClick={closeCamera}
              className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              Cancel
            </button>
            <button 
              onClick={captureImage}
              className="bg-lime-500 text-gray-900 px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              Capture
            </button>
          </div>
        </div>
      )}
      
      {/* Crop UI */}
      {isCropMode && fullImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              handleMouseMove(e);
              handleMouseMoveForCursor(e);
            }}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onMouseOut={handleMouseUp}
          >
            <img 
              ref={cropImgRef}
              src={fullImage} 
              alt="Captured" 
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Crop selection box and handles */}
            <div 
              className="absolute border border-white"
              style={{ 
                left: `${cropRect.x}px`, 
                top: `${cropRect.y}px`,
                width: `${cropRect.width}px`,
                height: `${cropRect.height}px`
              }}
            >
              {/* Corner handles */}
              <div className="absolute w-4 h-4 bg-white rounded-full -left-2 -top-2 shadow-md"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full -right-2 -top-2 shadow-md"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full -left-2 -bottom-2 shadow-md"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full -right-2 -bottom-2 shadow-md"></div>
              
              {/* Edge handles */}
              <div className="absolute w-6 h-3 bg-white rounded-full left-1/2 -translate-x-1/2 -top-1.5 shadow-md"></div>
              <div className="absolute w-3 h-6 bg-white rounded-full top-1/2 -translate-y-1/2 -right-1.5 shadow-md"></div>
              <div className="absolute w-6 h-3 bg-white rounded-full left-1/2 -translate-x-1/2 -bottom-1.5 shadow-md"></div>
              <div className="absolute w-3 h-6 bg-white rounded-full top-1/2 -translate-y-1/2 -left-1.5 shadow-md"></div>
            </div>
            
            <canvas ref={cropCanvasRef} className="hidden"></canvas>
          </div>
          
          <div className="fixed top-4 left-0 right-0 text-center text-white">
            <p className="bg-black bg-opacity-50 py-2 mx-auto max-w-xs rounded-full text-sm">
              Adjust the crop area using the handles
            </p>
          </div>
          
          {/* Crop button area */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 flex justify-center space-x-4 safe-bottom">
            <button 
              onClick={cancelCrop}
              className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              Cancel
            </button>
            <button 
              onClick={applyCrop}
              className="bg-lime-500 text-gray-900 px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              Crop
            </button>
          </div>
        </div>
      )}
      
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
          <h3 className="text-lg font-semibold text-lime-300 mb-4 pb-4">Capture Required Documents</h3>
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="flex flex-col mb-6">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold">
                  {getDocumentLabel(type)}{' '}
                  {ocrProgress[type] && <span className="text-yellow-300 ml-2">({ocrProgress[type]})</span>}
                </span>
              </div>
              
              {capturedImages[type] ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-lime-400/30">
                  <img 
                    src={capturedImages[type]} 
                    alt={`Captured ${type}`} 
                    className="w-full h-40 object-cover"
                  />
                  <button 
                    onClick={() => openCamera(type)}
                    className="absolute bottom-3 right-3 bg-black bg-opacity-60 p-2 rounded-full"
                  >
                    <CameraIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openCamera(type)}
                  className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-lime-400/30 rounded-lg hover:border-lime-400/50 transition"
                >
                  <CameraIcon className="h-10 w-10 text-lime-400/50 mb-2" />
                  <span className="text-sm text-lime-400/70">Click to capture</span>
                </button>
              )}
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
              const doc = perDocumentScores[type];
              const uploaded = docsUploaded[type];
              let content;
              if (!uploaded) content = <p className="text-lg text-gray-400">Waiting for file...</p>;
              else if (!doc) content = <p className="text-lg text-yellow-300">Calculating...</p>;
              else content = <p className="text-lg font-bold text-lime-300">{Math.round(doc.score * 100)}% match</p>;
              const borderColor = doc ? (doc.matched ? 'border-lime-400 bg-[#1f352b]/80' : 'border-red-400 bg-[#2b1f1f]/80') : 'border-gray-900 bg-[#1a1a1a]/80';
              return (
                <div key={type} className={`p-4 rounded-xl border ${borderColor} shadow`}>
                  <h4 className="text-base font-semibold mb-1 text-white">{getDocumentLabel(type)}</h4>
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