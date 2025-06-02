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

  const handleBarcodeSearch = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch(
        `https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/skus/barcode/${barcode}`
      );
      const data = await res.json();
      setSkuInfo(data);
      setCurrentStep('sku');
    } catch (e) {
      setError('SKU 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRFID = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch(
        `https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/rfid/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku_id: skuInfo.sku_id }),
        }
      );
      const data = await res.json();
      setRfidTags(data.rfids || []);
      setCurrentStep('rfid');
    } catch (e) {
      setError('RFID 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = () => {
    setCurrentStep('connect');
    setShowModal(true);
  };

  const renderBreadcrumb = () => (
    <nav className="mb-8" aria-label="Progress">
      <ol className="flex space-x-8">
        {steps.map((step) => (
          <li key={step.id} className="flex-1">
            <div
              className={`flex flex-col text-sm font-medium border-b-4 pb-1 ${
                currentStep === step.key
                  ? 'text-green-600 border-green-500'
                  : steps.findIndex((s) => s.key === currentStep) > steps.findIndex((s) => s.key === step.key)
                  ? 'text-gray-500 border-gray-300'
                  : 'text-gray-400 border-gray-100'
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
          />
          <button
            onClick={handleBarcodeSearch}
            className="ml-4 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black"
          >
            Search
          </button>
        </div>

        {/* Step 2 */}
        {skuInfo && (
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
        {skuInfo && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">3. Create RFID Tags</h2>
            <button
              onClick={handleCreateRFID}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>

            {rfidTags.length > 0 && (
              <div className="mt-4 text-sm text-gray-800 bg-green-50 p-3 rounded-lg border border-green-300">
                ✅ {rfidTags.length} RFID tags created.
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {rfidTags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">4. Connect to RFID software</h2>
            <button
              onClick={handleLink}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Link
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div className="text-red-500 mt-6">{error}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl relative w-96">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-lime-600">
                Success
              </h3>
              <p className="text-lg text-gray-700">Process completed successfully</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDTaggingPage;
