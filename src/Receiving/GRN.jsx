import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserAuthContext } from '../App';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

const API_BASE_URL = 'https://mdbi6j3x50.execute-api.us-east-2.amazonaws.com/dev';

const GRN = () => {
  const { userAuth } = useContext(UserAuthContext);
  const [query, setQuery] = useState('');
  const [grnRecords, setGrnRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/grn-records`);
      setGrnRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch GRN records.');
      setGrnRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = grnRecords.filter((row) => {
    const isSupplierAuth = userAuth === 'supplier' ? row.supplier_id === 'SUP123' : true;
    if (!isSupplierAuth) {
      return false;
    }

    if (query.trim() === '') {
      return true;
    }

    const lowerQuery = query.toLowerCase();
    return (
      (row.grn_id && String(row.grn_id).toLowerCase().includes(lowerQuery)) ||
      (row.received_date && String(row.received_date).toLowerCase().includes(lowerQuery)) ||
      (row.supplier_name && row.supplier_name.toLowerCase().includes(lowerQuery)) ||
      (row.supplier_id && String(row.supplier_id).toLowerCase().includes(lowerQuery)) ||
      (row.sku_name && row.sku_name.toLowerCase().includes(lowerQuery)) ||
      (row.sku_id && String(row.sku_id).toLowerCase().includes(lowerQuery)) ||
      (row.serial_barcode && String(row.serial_barcode).toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">GRN History</h1>
        </div>

        <div className="w-full mb-8">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by GRN, barcode, supplier..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base shadow-sm bg-white transition"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-gray-700">Loading records...</div>
        )}
        {error && (
          <div className="my-4 p-4 bg-red-50 text-red-700 border border-red-300 rounded-lg">
            Error: {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
            <table className="min-w-full text-base text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 font-medium text-gray-700">GRN #</th>
                  <th className="px-8 py-4 font-medium text-gray-700">Date</th>
                  <th className="px-8 py-4 font-medium text-gray-700">Supplier Name</th>
                  <th className="px-8 py-4 font-medium text-gray-700">SKU Name</th>
                  <th className="px-8 py-4 font-medium text-gray-700">SKU #</th>
                  <th className="px-8 py-4 font-medium text-gray-700">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((row, idx) => (
                  <tr
                    key={`${row.grn_id}-${row.sku_id}-${idx}`} // Using a composite key, assuming grn_id + sku_id might not be unique if API returns multiple entries for same combo. idx makes it unique for rendering.
                    className="bg-white hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.grn_id}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.received_date}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.supplier_name}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.sku_name}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.sku_id}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{row.serial_barcode}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-8">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          background-color: #ffffff;
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 1.125rem;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .input::placeholder {
          color: #6b7280;
          font-size: 1.3rem;
        }
      `}</style>
    </div>
  );
};

export default GRN;
