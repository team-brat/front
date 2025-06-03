// BinningRequest.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BinningRequest = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        const response = await axios.get('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/inventory/status');
        setInventoryData(response.data.inventory_status || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch inventory status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryStatus();
  }, []);

  const handleRowClick = (item) => {
    // 예: Bin Recommender로 이동하면서 state 전달
    navigate('/bin-recommender', { state: { skuData: item } });
  };

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Binning Request</h1>
          <p className="text-gray-500 text-base">Click a row to continue to Bin Recommender</p>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">Loading inventory status...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-700">Received Date</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Supplier Name</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Supplier ID</th>
                  <th className="px-6 py-4 font-medium text-gray-700">SKU Name</th>
                  <th className="px-6 py-4 font-medium text-gray-700">SKU ID</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Barcode / Serial</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="bg-white hover:bg-gray-50 cursor-pointer transition duration-150"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-6 py-4 text-gray-800">{item.received_date || '-'}</td>
                    <td className="px-6 py-4 text-gray-800">{item.supplier_name}</td>
                    <td className="px-6 py-4 text-gray-800">{item.supplier_id}</td>
                    <td className="px-6 py-4 text-gray-800">{item.sku_name}</td>
                    <td className="px-6 py-4 text-gray-800">{item.sku_id}</td>
                    <td className="px-6 py-4 text-gray-800">{item.serial_or_barcode}</td>
                    <td className="px-6 py-4 text-gray-800">{item.remaining_qty}</td>
                  </tr>
                ))}
                {inventoryData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-6">
                      No inventory items to bin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinningRequest;
