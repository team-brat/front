import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/binning/checking';

const InventoryChecking = () => {
  const [workerId, setWorkerId] = useState('');
  const [skuRfid, setSkuRfid] = useState('');
  const [inventoryCount, setInventoryCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalDetail, setModalDetail] = useState('');

  const handleCheck = async () => {
    if (!workerId || !skuRfid || !inventoryCount) return;

    try {
      setIsLoading(true);
      const response = await axios.post(API_URL, {
        sku_rfid: skuRfid,
        inventory_count: Number(inventoryCount),
        worker_id: workerId
      });

      const { status, previous_remaining_qty, updated_remaining_qty, remaining_qty } = response.data;

      if (status === 'Inventory Reconciled') {
        setModalStatus('success');
        setModalDetail('Inventory Reconciled');
      } else if (status === 'Inventory Discrepancy') {
        setModalStatus('error');
        setModalDetail(`Inventory Discrepancy!\nPrevious: ${previous_remaining_qty}, Now: ${updated_remaining_qty}`);
      } else {
        setModalStatus('error');
        setModalDetail('Unexpected response');
      }

      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalStatus('error');
      setModalDetail('API Error. Please try again.');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-12 w-full space-y-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Inventory Checking</h1>

      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Worker ID</label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
              placeholder="Enter Worker ID"
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
            disabled={isLoading}
            className={`bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Checking...' : 'DONE'}
          </button>
        </div>

        <div className="border-l pl-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">WMS count</h3>
          <p className="text-gray-500">Inventory Count: <span className="font-bold">1,345</span></p>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg relative w-96 text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
            <h2 className={`text-2xl font-bold mb-4 ${
              modalStatus === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {modalDetail}
            </h2>
            <p className="text-sm text-gray-500 mt-2">This result will be reflected in Inventory Status.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryChecking;