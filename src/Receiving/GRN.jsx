import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserAuthContext } from '../App';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

const API_BASE_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const formatDate = (timestampInput) => {
  if (timestampInput === null || typeof timestampInput === 'undefined' || timestampInput === '') {
    return '-';
  }

  let date;
  // Check if it's a string in YYYYMMDD format
  if (typeof timestampInput === 'string' && /^\d{8}$/.test(timestampInput)) {
    const year = parseInt(timestampInput.substring(0, 4), 10);
    const month = parseInt(timestampInput.substring(4, 6), 10) - 1; // JS months are 0-indexed
    const day = parseInt(timestampInput.substring(6, 8), 10);
    date = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues with YYYYMMDD
  } else {
    // Assume it's a timestamp in seconds (can be number or string)
    const numericTimestamp = Number(timestampInput);
    if (!isNaN(numericTimestamp)) {
      // Assuming timestamp is in seconds, convert to milliseconds for Date constructor
      date = new Date(numericTimestamp * 1000);
    }
  }

  if (!date || isNaN(date.getTime())) {
    return '-'; // Invalid date or input format
  }
  
  // Format to YYYY-MM-DD in UTC to match en-CA like behavior consistently
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GRN = () => {
  const { userAuth, workId } = useContext(UserAuthContext); // workId might be supplier_id
  const [query, setQuery] = useState('');
  const [grnRecords, setGrnRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 500);

  const fetchData = useCallback(async (currentSearchQuery) => {
    setIsLoading(true);
    setError(null); // Reset error state at the beginning of every fetch attempt
    
    const params = {};

    // Apply supplier filter if the user is a supplier
    // This filter applies if no specific supplier_id is part of the currentSearchQuery
    if (userAuth === 'supplier' && workId) {
      params.supplier_id = workId;
    }

    if (currentSearchQuery) {
      const upperQuery = currentSearchQuery.toUpperCase();

      if (upperQuery.startsWith('GRN-')) {
        params.grn_id = currentSearchQuery;
      } else if (upperQuery.startsWith('SKU-')) {
        params.sku_id = currentSearchQuery;
      } else if (upperQuery.startsWith('SUP-')) {
        // If user searches for a specific SUP-id, it overrides the default supplier filter
        params.supplier_id = currentSearchQuery; 
      } else if (/^(\d{8}|\d{10})$/.test(currentSearchQuery)) {
        params.received_date = currentSearchQuery;
      } else {
        params.supplier_name = currentSearchQuery;
      }
    }
    // If currentSearchQuery is empty:
    // - params will be { supplier_id: workId } if user is a supplier with a workId.
    // - params will be {} if user is not a supplier or has no workId.
    // This is intended to fetch all relevant records for the user.

    try {
      const response = await axios.get(`${API_BASE_URL}/grn-search`, { params });
      setGrnRecords(response.data?.grn_results || []);
    } catch (err) {
      // Only set an error message if the fetch was initiated by a non-empty search query.
      // If currentSearchQuery is empty (meaning an attempt to fetch all/default records) and it fails,
      // the error state remains null (as it was cleared at the start of fetchData).
      if (currentSearchQuery) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch GRN records.');
      }
      // In any error case (whether currentSearchQuery was empty or not), clear the records.
      setGrnRecords([]); 
    } finally {
      setIsLoading(false);
    }
  }, [userAuth, workId]); // currentSearchQuery is passed as an argument, not a direct dependency of useCallback

  useEffect(() => {
    // Fetch data when debouncedQuery changes.
    // This includes the initial fetch when the component mounts (debouncedQuery is initially ''),
    // and subsequent fetches when the user types and pauses, or clears the search input.
    fetchData(debouncedQuery);
  }, [debouncedQuery, fetchData]);

  const displayableGrnItems = grnRecords.flatMap((grn) =>
    grn.skus.flatMap((sku) => {
      if (sku.items && sku.items.length > 0) {
        return sku.items.map((item) => ({
          grn_id: grn.grn_id,
          received_date: formatDate(grn.received_date),
          supplier_name: grn.supplier_name,
          sku_name: sku.sku_name,
          sku_id: sku.sku_id,
          serial_barcode: item.serial_or_barcode,
        }));
      }
      // If a SKU has no items, create a row with N/A for barcode
      return [{
        grn_id: grn.grn_id,
        received_date: formatDate(grn.received_date),
        supplier_name: grn.supplier_name,
        sku_name: sku.sku_name,
        sku_id: sku.sku_id,
        serial_barcode: 'N/A',
      }];
    })
  );

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">GRN Search</h1>
        </div>

        <div className="w-full mb-8">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID (GRN, SKU, SUP), Supplier Name, Date (YYYYMMDD or Timestamp)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base shadow-sm bg-white transition"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-gray-700">Loading records...</div>
        )}
        {error && ( // This will only be true if error state is set (i.e., for failed non-empty queries)
          <div className="my-4 p-4 bg-red-50 text-red-700 border border-red-300 rounded-lg">
            Error: {error}
          </div>
        )}

        {!isLoading && !error && ( // Render table if not loading AND no error is set
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
                {displayableGrnItems.map((item, idx) => (
                  <tr
                    key={`${item.grn_id}-${item.sku_id}-${item.serial_barcode}-${idx}`}
                    className="bg-white hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.grn_id}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.received_date}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.supplier_name}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.sku_name}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.sku_id}</td>
                    <td className="px-8 py-4 text-gray-900 whitespace-nowrap">{item.serial_barcode}</td>
                  </tr>
                ))}
                {displayableGrnItems.length === 0 && ( // Show "No matching records" if list is empty (and not loading, no error message)
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
