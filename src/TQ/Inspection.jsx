import React, { useState } from 'react';
import axios from 'axios';

const steps = [
  { id: '1', name: 'Scan Barcode', key: 'scan' },
  { id: '2', name: 'Inspect Item', key: 'inspect' },
];

const Inspection = () => {
  const [workerId] = useState('W1003'); // Account linked value
  const [barcode, setBarcode] = useState('');
  const [defectReason, setDefectReason] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [showModal, setShowModal] = useState(false); // General success/error modal
  const [showDefectModal, setShowDefectModal] = useState(false); // Defect report modal

  const [grnNumber, setGrnNumber] = useState('');
  const [defectId, setDefectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [currentStep, setCurrentStep] = useState('scan');

  const BASE_URL = 'https://tf9s4afzsh.execute-api.us-east-2.amazonaws.com/dev';

  const resetToScanStep = () => {
    setBarcode('');
    setDefectReason('');
    setImageFile(null);
    setCurrentStep('scan');
  };

  const handleBarcodeConfirm = () => {
    if (!barcode) {
      setModalTitle('Error');
      setModalMessage('Please enter barcode');
      setShowModal(true);
      return;
    }
    // In a real scenario, you might add an API call here to validate the barcode
    // For now, we just proceed to the next step.
    setCurrentStep('inspect');
  };

  const handleApproved = async () => {
    if (!barcode) { // Should ideally not be hit if flow is correct
      setModalTitle('Error');
      setModalMessage('Barcode not found. Please go back to scan.');
      setShowModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/inspection/${barcode}/approved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worker_id: workerId,
          barcode: barcode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data = await response.json();
      setGrnNumber(data.grn);
      setModalTitle('Success');
      setModalMessage(`Item Approved. GRN: ${data.grn}`);
      setShowModal(true);
      resetToScanStep();
    } catch (err) {
      console.error(err);
      setModalTitle('Error');
      setModalMessage(err.message || 'Approval failed');
      setShowModal(true);
      // Stay on inspect step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRejectModal = () => {
     if (!barcode) { // Should ideally not be hit if flow is correct
      setModalTitle('Error');
      setModalMessage('Barcode not found. Please go back to scan.');
      setShowModal(true);
      return;
    }
    setShowDefectModal(true);
  };

  const handleSubmitDefectReport = async () => {
    if (!defectReason) {
      setModalTitle('Error');
      setModalMessage('Please select defect reason');
      // Keep defect modal open for correction, or close and show general modal
      // For this implementation, we'll show error in general modal and close defect modal
      setShowDefectModal(false); 
      setShowModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const base64Image = imageFile ? await toBase64(imageFile) : '';
      const body = {
        worker_id: workerId,
        barcode: barcode,
        defect_reason: defectReason,
        defect_image: base64Image,
      };

      const res = await axios.post(`${BASE_URL}/inspection/${barcode}/declined`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
          return status < 500; // Handle 4xx errors as non-exceptions
        }
      });

      if (res.status === 200 || res.status === 201) { // Assuming 201 for created as well
        setDefectId(res.data.defect_id);
        setModalTitle('Success');
        setModalMessage(`Defect Reported. Defect ID: ${res.data.defect_id}`);
        setShowDefectModal(false);
        setShowModal(true);
        resetToScanStep();
      } else {
        throw new Error(res.data.message || 'Failed to register defect report');
      }
    } catch (err) {
      console.error(err);
      setModalTitle('Error');
      setModalMessage(err.message || 'Report failed');
      setShowDefectModal(false);
      setShowModal(true);
      // Stay on inspect step on error
    } finally {
      setIsLoading(false);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="pb-8 mb-10 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Inspection</h1>
      </div>
      
      {renderBreadcrumb()}

      {/* Step 1: Scan Barcode */}
      {currentStep === 'scan' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Step 1: Scan Barcode</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">Worker ID</label>
              <input 
                disabled 
                value={workerId} 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm opacity-60" 
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">SKU Barcode</label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm"
                placeholder="Scan barcode or enter serial number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleBarcodeConfirm}
                disabled={isLoading || !barcode}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base ${
                  (isLoading || !barcode) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Confirm Barcode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Inspect Item */}
      {currentStep === 'inspect' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Step 2: Inspect Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">Scanned Barcode</label>
              <input 
                disabled 
                value={barcode} 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm opacity-60" 
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleOpenRejectModal}
                disabled={isLoading}
                className={`bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={handleApproved}
                disabled={isLoading}
                className={`bg-lime-500 hover:bg-lime-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defect Report Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl relative w-96 shadow-xl">
            <button 
              onClick={() => {
                setShowDefectModal(false);
                setDefectReason(''); // Reset reason if modal is closed
                setImageFile(null);   // Reset image if modal is closed
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Report Defect</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Defect Reason</label>
                <select
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm"
                  value={defectReason}
                  onChange={(e) => setDefectReason(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">-- Select reason --</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Quantity Mismatch">Quantity Mismatch</option>
                  <option value="Barcode Mismatch">Barcode Mismatch</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Proof of Defect (image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-base file:font-semibold file:bg-lime-100 file:text-lime-800 hover:file:bg-lime-200"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmitDefectReport}
                  disabled={isLoading || !defectReason}
                  className={`bg-red-600 hover:bg-red-500 text-white font-semibold mt-12 px-4 py-2 rounded-lg shadow-sm text-base ${
                    (isLoading || !defectReason) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Submitting...' : 'Submit Defect Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Success/Error Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl relative w-96">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className={`text-xl font-bold mb-4 ${
                modalTitle === 'Error' ? 'text-red-600' : 'text-lime-600'
              }`}>
                {modalTitle}
              </h3>
              <p className="text-lg text-gray-700">{modalMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspection;
