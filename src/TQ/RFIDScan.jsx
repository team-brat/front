import React, { useState } from 'react';

const steps = [
  { id: '1', name: 'Barcode Scan', key: 'scan' },
  { id: '2', name: 'SKU Details', key: 'sku' },
  { id: '3', name: 'Create RFID Tags', key: 'rfid' },
  { id: '4', name: 'Connect Software', key: 'connect' },
];

const RFIDTaggingPage = () => {
  const [barcode, setBarcode] = useState('');
  const [skuInfo, setSkuInfo] = useState(null);
  const [rfidTags, setRfidTags] = useState([]);
  const [currentStep, setCurrentStep] = useState('scan');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('Process completed successfully.'); // For success message customization

  const API_BASE_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev';

  const handleBarcodeSearch = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSkuInfo(null); // Reset previous SKU info
      setRfidTags([]); // Reset RFID tags
      const res = await fetch(
        `${API_BASE_URL}/skus/barcode/${barcode}`
      );
      if (!res.ok) {
        let errorMessage = 'SKU 정보를 불러오지 못했습니다.';
        try {
            const errorData = await res.json();
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            } else {
                errorMessage = `SKU 정보를 불러오지 못했습니다. (Status: ${res.status})`;
            }
        } catch (parseError) {
            // If error response is not JSON, use generic status error
             errorMessage = `SKU 정보를 불러오지 못했습니다. (Status: ${res.status})`;
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      if (!data || !data.sku_id) { // Basic validation of SKU data
        throw new Error('수신된 SKU 정보 형식이 올바르지 않습니다.');
      }
      setSkuInfo(data);
      setCurrentStep('sku');
    } catch (e) {
      setError(e.message || 'SKU 정보를 불러오는 중 오류가 발생했습니다.');
      setCurrentStep('scan'); // Revert to scan step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRFID = async () => {
    if (!skuInfo || !skuInfo.sku_id) {
      setError('SKU 정보가 없습니다. 바코드를 먼저 스캔해주세요.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(
        `${API_BASE_URL}/rfid/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku_id: skuInfo.sku_id }),
        }
      );

      if (!response.ok) {
        let errorMessage = `RFID 생성에 실패했습니다. (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON or empty
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // According to API spec, response includes: sku_id, rfid_count, status, rfids
      // console.log('Create RFID API Response:', data); // For debugging

      if (data && data.rfids && Array.isArray(data.rfids)) {
        setRfidTags(data.rfids);
        // data.rfid_count should ideally be data.rfids.length
        // The message "✅ {rfidTags.length} RFID tags created." will use data.rfids.length
        setCurrentStep('rfid');
      } else {
        throw new Error('RFID 생성 응답 형식이 올바르지 않습니다.');
      }
    } catch (e) {
      setError(e.message || 'RFID 생성 중 오류가 발생했습니다.');
      // Stay on the current step (sku) if RFID creation fails, so user can retry.
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = async () => {
    if (!skuInfo || !skuInfo.sku_id) {
      setError('SKU 정보가 없어 승인 처리를 할 수 없습니다. 바코드를 먼저 스캔해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/skus/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku_id: skuInfo.sku_id }),
      });

      if (!response.ok) {
        let errorMessage = `SKU 승인에 실패했습니다. (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore if error response is not JSON or empty
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // console.log('Approve SKU API Response:', data); // For debugging

      // Assuming the API returns a message on success, e.g., data.message
      // Or we can construct a success message based on returned data.
      // For example: `SKU ${data.sku_id} approved. Status: ${data.status}. Processed: ${data.processed_date}`
      setModalMessage(data.message || `SKU ${data.sku_id} approved successfully.`);
      setCurrentStep('connect');
      setShowModal(true);
    } catch (e) {
      setError(e.message || 'SKU 승인 중 오류가 발생했습니다.');
      // Stay on the current step (rfid) if approval fails, so user can retry.
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeModalAndReset = () => {
    setShowModal(false);
    setBarcode('');
    setSkuInfo(null);
    setRfidTags([]);
    setCurrentStep('scan');
    setError('');
    setIsLoading(false);
    setModalMessage('Process completed successfully.'); // Reset modal message
  };


  const renderBreadcrumb = () => (
    <nav className="mb-8" aria-label="Progress">
      <ol className="flex space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex-1">
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
    <div className="p-12 max-w-4xl mx-auto bg-white min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-10">RFID Tagging</h1>
      {renderBreadcrumb()}

      <div className="space-y-10">
        {/* Step 1 */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">1. Barcode Scan</h2>
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md text-base"
            placeholder="Enter barcode or serial number"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={isLoading || currentStep !== 'scan'}
          />
          <button
            onClick={handleBarcodeSearch}
            className="ml-4 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black disabled:opacity-50"
            disabled={isLoading || !barcode || currentStep !== 'scan'}
          >
            {isLoading && currentStep === 'scan' ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Step 2 */}
        {currentStep !== 'scan' && skuInfo && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">2. SKU Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p><strong>SKU ID:</strong> {skuInfo.sku_id}</p>
              <p><strong>SKU Name:</strong> {skuInfo.sku_name}</p>
              <p><strong>Supplier:</strong> {skuInfo.supplier_name} ({skuInfo.supplier_id})</p>
              <p><strong>GRN:</strong> {skuInfo.grn_id}</p>
              <p><strong>Quantity:</strong> {skuInfo.quantity}</p>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep !== 'scan' && skuInfo && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">3. Create RFID Tags</h2>
            <button
              onClick={handleCreateRFID}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading || rfidTags.length > 0 || currentStep !== 'sku'}
            >
              {isLoading && currentStep === 'sku' ? 'Creating...' : 'Create'}
            </button>

            {rfidTags.length > 0 && (
              <div className="mt-4 text-sm text-gray-800 bg-green-50 p-3 rounded-lg border border-green-300">
                ✅ {rfidTags.length} RFID tags created.
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 'rfid' && rfidTags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">4. Connect to RFID software</h2>
            <button
              onClick={handleLink}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || currentStep !== 'rfid'}
            >
              {isLoading && currentStep === 'rfid' ? 'Approving...' : 'Link & Approve SKU'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div className="text-red-500 mt-6 p-3 bg-red-50 border border-red-300 rounded-lg">{error}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl relative w-96 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Success
              </h3>
              <p className="text-md text-gray-700 mb-6">{modalMessage}</p>
              <button 
                onClick={closeModalAndReset}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                OK
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDTaggingPage;
