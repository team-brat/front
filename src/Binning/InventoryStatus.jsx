// InventoryStatus.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryStatus = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev';

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/inventory/status`);
        setInventory(response.data.inventory_status || []);
      } catch (err) {
        console.error("Failed to fetch inventory status:", err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch inventory status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryStatus();
  }, []);

  const getDisplayValue = (value) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
        if (typeof value === 'boolean') {
            return '-'; // Booleans are represented as '-'
        }
        return value; // Display actual value (including 0)
    }
    return '-';
  };

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Inventory Status</h1>
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
                  <th className="px-6 py-4 font-medium text-gray-700">Bin Loc</th>
                  <th className="px-6 py-4 font-medium text-gray-700">SKU ID</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Max Capacity</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Remaining Qty</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Serial / Barcode</th>
                  <th className="px-6 py-4 font-medium text-gray-700">SKU Name</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Supplier ID</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Supplier Name</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Worker ID</th>
                  <th className="px-6 py-4 font-medium text-gray-700">Inventory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item, idx) => (
                  <tr key={idx} className="bg-white hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.bin_loc)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.sku_id)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.max_capacity)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.remaining_qty)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.serial_or_barcode)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.sku_name)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.supplier_id)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.supplier_name)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.worker_id)}</td>
                    <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.inventory_status)}</td>
                  </tr>
                ))}
                {inventory.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="10" className="text-center text-gray-500 py-6">
                      No inventory status records available.
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

export default InventoryStatus;