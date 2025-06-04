// BinningRequest.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BinningRequest = () => {
  const [binningData, setBinningData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBinningRequests = async () => {
      try {
        const response = await axios.get('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/binning/requests');
        console.log('Binning Requests Response:', response.data); // Log the entire response data
        setBinningData(response.data.binning_requests || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch binning requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBinningRequests();
  }, []);

  const handleRowClick = (item) => {
    // 예: Binning Recommender로 이동하면서 state 전달
    navigate('/binning/recommender', { state: { skuData: item } });
  };

  const getDisplayValue = (value) => {
    // Check for actual value that is not just whitespace or boolean true
    // Condition A: value exists (not null/undefined) and its string representation (trimmed) is not empty
    // For numbers like 0, String(0).trim() is "0", so conditionA would be true if value is 0.
    // However, the original logic `value && String(value).trim()` makes `0` falsy.
    // Let's adjust to handle 0 as a displayable value if it's not boolean.
    if (value !== null && value !== undefined && String(value).trim() !== "") {
        if (typeof value === 'boolean') {
            return '-'; // Booleans are represented as '-'
        }
        return value; // Display actual value (including 0)
    }
    // If value is null, undefined, empty string, or whitespace string
    return '-';
  };


  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Binning Requests</h1>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">Loading binning requests...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Informational message about row clickability */}
            {binningData.length > 0 && (
              <div 
                className="mb-8 px-4 py-3 bg-sky-50 border border-sky-300 text-sky-700 rounded-lg shadow-sm"
                role="alert"
              >
                <p>
                  <span className="font-semibold">
                    ℹ️ Note:
                  </span> Click on a row below to navigate to the Bin Recommendation page for the selected SKU.
                </p>
              </div>
            )}

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
                  {binningData.map((item, idx) => (
                    <tr
                      key={item.inspection_request_id || idx} // Prefer unique ID if available
                      className="bg-white hover:bg-gray-50 cursor-pointer transition duration-150"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.received_date)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.supplier_name)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.supplier_id)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.sku_name)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.sku_id)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.serial_or_barcode)}</td>
                      <td className="px-6 py-4 text-gray-800">{getDisplayValue(item.quantity)}</td>
                    </tr>
                  ))}
                  {binningData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-6">
                        No binning requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BinningRequest;
