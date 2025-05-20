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
  
  // 카메라 관련 상태
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [capturedImages, setCapturedImages] = useState({ invoice: null, bill: null, airway: null });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 카메라 열기
  const openCamera = (docType) => {
    setCurrentDocType(docType);
    setIsCameraOpen(true);
    
    // 모바일 화면에 최적화된 카메라 설정
    const constraints = { 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 4/3 }
      } 
    };
    
    // iOS Safari에서 더 나은 호환성을 위한 코드
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // iOS에서 비디오가 제대로 로드되도록 보장
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("비디오 재생 오류:", e));
              }
            }, 300);
          }
        })
        .catch(err => {
          console.error("카메라 접근 오류:", err);
          alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
          setIsCameraOpen(false);
        });
    } else {
      alert("브라우저가 카메라 기능을 지원하지 않습니다.");
      setIsCameraOpen(false);
    }
  };

  // 카메라 닫기
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // 이미지 캡처
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // 비디오 해상도에 맞게 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 캔버스 내용을 이미지로 변환
    canvas.toBlob((blob) => {
      // 이미지 URL 생성
      const imageUrl = URL.createObjectURL(blob);
      
      // 파일 객체 생성 (Tesseract.js와 호환되도록)
      const file = new File([blob], `${currentDocType}.jpg`, { type: 'image/jpeg' });
      
      // 상태 업데이트
      setCapturedImages(prev => ({ ...prev, [currentDocType]: imageUrl }));
      setFiles(prev => ({ ...prev, [currentDocType]: file }));
      setDocsUploaded(prev => ({ ...prev, [currentDocType]: true }));
      setOcrProgress(prev => ({ ...prev, [currentDocType]: '이미지 캡처됨' }));
      
      // 카메라 닫기
      closeCamera();
    }, 'image/jpeg', 0.95);
  };

  // 컴포넌트 언마운트 시 카메라 리소스 정리
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
          setOcrProgress(prev => ({ ...prev, [key]: 'OCR 수행 중...' }));
          const ocrResult = await Tesseract.recognize(url, 'eng');
          ocrResults[key] = ocrResult.data.text;
          setOcrProgress(prev => ({ ...prev, [key]: '제출됨' }));
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
      if (!file || !ocrReference[docType]) continue;
      try {
        setOcrProgress(prev => ({ ...prev, [docType]: '계산 중...' }));
        const uploadedText = await Tesseract.recognize(file, 'eng').then(ocrResult => ocrResult.data.text);
        const referenceText = ocrReference[docType];
        
        const score = jaccardSimilarity(uploadedText, referenceText);
        const matched = score >= 0.7;

        results[docType] = { score, matched };
        if (matched) matchCount++;
        setOcrProgress(prev => ({ ...prev, [docType]: '제출됨' }));
      } catch (err) {
        console.error(`OCR failed for ${docType}:`, err);
        results[docType] = { matched: false, score: 0 };
        setOcrProgress(prev => ({ ...prev, [docType]: '실패' }));
      }
    }

    const total = Object.values(files).filter(Boolean).length;
    setAccuracy(total ? Math.round((matchCount / total) * 100) : 0);

    const mismatches = Object.entries(results).filter(([_, r]) => !r.matched);
    if (mismatches.length > 0) {
      const wrongDocs = mismatches.map(([k, r]) => `${k}: ${Math.round(r.score * 100)}%`).join(', ');
      setMismatchAlert(`일치하지 않는 문서: ${wrongDocs}`);
    } else {
      setMismatchAlert('');
    }
    setPerDocumentScores(results);
  };

  const getDocumentLabel = (type) => {
    return type === 'invoice' ? '송장' : type === 'bill' ? '수입신고서' : '항공화물운송장';
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">문서 확인</h2>
      
      {/* 카메라 UI */}
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
          
          {/* 고정된 하단 버튼 영역 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 flex justify-center space-x-4 safe-bottom">
            <button 
              onClick={closeCamera}
              className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              취소
            </button>
            <button 
              onClick={captureImage}
              className="bg-lime-500 text-gray-900 px-6 py-3 rounded-full font-bold text-lg flex-1 max-w-[120px]"
            >
              촬영
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6 mb-10">
        <div className={`bg-[#152b22] p-6 rounded-xl border ${barcodeError ? 'border-red-500' : 'border-lime-400/20'}`}>
          <h3 className="text-lg font-semibold mb-4 text-lime-300">바코드 또는 일련번호 입력</h3>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="바코드 또는 일련번호를 입력하세요..."
            className={`input w-full ${barcodeError ? 'border-red-500' : ''}`}
          />
          {barcodeError && <p className="text-red-400 text-xs mt-2">바코드가 필요합니다</p>}
        </div>

        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold text-lime-300 mb-4 pb-4">필수 문서 촬영</h3>
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
                  <span className="text-sm text-lime-400/70">클릭하여 촬영</span>
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition">
              확인
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-start text-sm">
            {['invoice', 'bill', 'airway'].map((type) => {
              const doc = perDocumentScores[type];
              const uploaded = docsUploaded[type];
              let content;
              if (!uploaded) content = <p className="text-lg text-gray-400">파일 대기 중...</p>;
              else if (!doc) content = <p className="text-lg text-yellow-300">계산 중...</p>;
              else content = <p className="text-lg font-bold text-lime-300">{Math.round(doc.score * 100)}% 일치</p>;
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
            <button className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-lg">승인</button>
            <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-lg">거절</button>
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