import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserAuthContext } from '../App'; // Import UserAuthContext

const API_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/inventory/checking';

const InventoryChecking = () => {
  const { workId: contextWorkId } = useContext(UserAuthContext); // Get workId from context
  const [workerId, setWorkerId] = useState(contextWorkId || ''); // Initialize with context workId
  const [skuRfid, setSkuRfid] = useState('');
  const [inventoryCount, setInventoryCount] = useState(''); // This is the user's input
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(''); // 'success' or 'error'
  const [modalDetail, setModalDetail] = useState('');
  // wmsDisplayCount stores the relevant WMS quantity based on API response:
  // - For 'Inventory Reconciled', it's `remaining_qty`.
  // - For 'Inventory Discrepancy', it's `previous_remaining_qty` (current WMS count, as per original logic).
  // - For other errors, it's `null`.
  const [wmsDisplayCount, setWmsDisplayCount] = useState(null);

  useEffect(() => {
    if (contextWorkId) {
      setWorkerId(contextWorkId);
    }
  }, [contextWorkId]);

  const handleCheck = async () => {
    if (!workerId || !skuRfid || !inventoryCount) return;

    try {
      setIsLoading(true);
      const response = await axios.post(API_URL, {
        sku_rfid: skuRfid,
        inventory_count: Number(inventoryCount),
        worker_id: workerId
      });

      const { status, previous_remaining_qty, remaining_qty } = response.data;

      if (status === 'Inventory Reconciled') {
        setModalStatus('success');
        setModalDetail('Inventory Reconciled');
        setWmsDisplayCount(remaining_qty);
      } else if (status === 'Inventory Discrepancy') {
        setModalStatus('error'); // Use 'error' for red styling of title
        setModalDetail('Inventory Discrepancy');
        setWmsDisplayCount(previous_remaining_qty); // Show current WMS count before any potential update
      } else {
        setModalStatus('error');
        setModalDetail('Unexpected response from server');
        setWmsDisplayCount(null); 
      }

      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalStatus('error');
      const errorMessage = err.response?.data?.message || err.message || 'API Error. Please try again.';
      setModalDetail(errorMessage);
      setWmsDisplayCount(null); 
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalCloseAndReset = () => {
    setModalOpen(false);
    setSkuRfid('');
    setInventoryCount('');
    setWmsDisplayCount(null);
    // Optionally reset modal status/detail if they affect anything outside the modal lifecycle
    // setModalStatus('');
    // setModalDetail('');
  };

  return (
    <div className="p-12 w-full space-y-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Inventory Checking</h1>

      {/* Adjusted grid to make form take one column, second column (if any) would be empty or for future use */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 md:col-span-2"> {/* Form content - Changed md:col-span-1 to md:col-span-2 */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Worker ID</label>
            <input
              type="text"
              value={workerId}
              disabled 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-gray-100 opacity-70"
              placeholder="Worker ID"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6">Inventory count</h3>

          <div>
            <label className="block mb-1 font-medium text-gray-700">SKU Barcode</label>
            <input
              type="text"
              value={skuRfid}
              onChange={(e) => setSkuRfid(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
              placeholder="Enter SKU Barcode"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Inventory Count</label>
            <input
              type="number"
              value={inventoryCount}
              onChange={(e) => setInventoryCount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
              placeholder="Enter Inventory Count"
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={isLoading || !workerId || !skuRfid || !inventoryCount}
            className={`bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md ${
              (isLoading || !workerId || !skuRfid || !inventoryCount) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Checking...' : 'DONE'}
          </button>
        </div>

        {/* The WMS count display that was previously here has been removed and integrated into the modal. */}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative w-full max-w-md text-center">
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${
              modalStatus === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {modalDetail}
            </h2>

            {/* Display WMS Count for success status */}
            {modalStatus === 'success' && (
              <p className="text-gray-700 mb-2">
                WMS Count: <span className="font-bold">
                  {wmsDisplayCount !== null && typeof wmsDisplayCount === 'number' 
                    ? wmsDisplayCount.toLocaleString() 
                    : '---'}
                </span>
              </p>
            )}

            {/* Display for Inventory Discrepancy */}
            {modalStatus === 'error' && modalDetail === 'Inventory Discrepancy' && (
              <>
                <p className="text-gray-700 mb-1">
                  Current WMS Count: <span className="font-bold">
                    {wmsDisplayCount !== null && typeof wmsDisplayCount === 'number' 
                      ? wmsDisplayCount.toLocaleString() 
                      : '---'}
                  </span>
                </p>
                <p className="text-gray-700 mb-3">
                  Your Submitted Count: <span className="font-bold">
                    {inventoryCount !== '' ? Number(inventoryCount).toLocaleString() : '---'}
                  </span>
                </p>
                <p className="text-red-600 font-semibold mb-4 text-sm sm:text-base">
                  {/* This text implies an action for "Confirm". Currently, "Confirm" only closes the modal.
                      A subsequent change might involve making an API call here. */}
                  Confirming will update the WMS count to {inventoryCount !== '' ? Number(inventoryCount).toLocaleString() : 'your input'}.
                </p>
              </>
            )}
            
            {/* Display WMS Count for other errors (non-discrepancy) */}
            {modalStatus === 'error' && modalDetail !== 'Inventory Discrepancy' && (
               <p className="text-gray-700 mb-2">
                WMS Count: <span className="font-bold">
                  {wmsDisplayCount !== null && typeof wmsDisplayCount === 'number' 
                    ? wmsDisplayCount.toLocaleString() 
                    : '---'}
                </span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-6">
              {modalStatus === 'success' && modalDetail === 'Inventory Reconciled'
                ? 'The inventory count has been accurately confirmed.'
                : 'This result will be reflected in Inventory Status.'}
            </p>

            {/* Modal Buttons */}
            {modalStatus === 'success' ? (
              <button
                onClick={handleModalCloseAndReset}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md w-full text-sm sm:text-base"
              >
                OK
              </button>
            ) : modalStatus === 'error' && modalDetail === 'Inventory Discrepancy' ? (
              <button
                onClick={handleModalCloseAndReset} // Currently, this just closes the modal.
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md w-full text-sm sm:text-base"
              >
                Confirm
              </button>
            ) : ( // Handles other errors (API error, unexpected server response)
               <button
                onClick={handleModalCloseAndReset}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md w-full text-sm sm:text-base"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryChecking;