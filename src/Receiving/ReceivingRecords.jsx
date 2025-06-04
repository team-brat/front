import React, { useState, useContext, useEffect } from 'react';
import { UserAuthContext } from '../App';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const ReceivingRecords = () => {
  const { userAuth } = useContext(UserAuthContext);
  const [query, setQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/receiving-orders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecords(data.orders || []);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch receiving records:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const toggleRow = (orderId) => {
    setExpandedRows((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const filteredData = records.filter((row) => {
    if (!row || typeof row !== 'object') return false;
    const queryLower = query.toLowerCase();

    let combinedSearchableText = "";
    if (row.scheduled_date) combinedSearchableText += row.scheduled_date + " ";
    if (row.supplier_name) combinedSearchableText += row.supplier_name + " ";
    if (row.supplier_number) combinedSearchableText += row.supplier_number + " ";
    if (row.sku_name) combinedSearchableText += row.sku_name + " ";
    if (row.sku_number) combinedSearchableText += row.sku_number + " ";
    if (row.serial_barcode) combinedSearchableText += row.serial_barcode + " ";
    if (row.order_id) combinedSearchableText += row.order_id + " ";
    if (row.approval_status) combinedSearchableText += row.approval_status + " ";

    if (row.items && Array.isArray(row.items)) {
      row.items.forEach(item => {
        if (item.sku_name) combinedSearchableText += item.sku_name + " ";
        if (item.sku_number) combinedSearchableText += item.sku_number + " ";
        if (item.description) combinedSearchableText += item.description + " ";
        if (item.hs_code) combinedSearchableText += item.hs_code + " ";
        if (item.quantity) combinedSearchableText += item.quantity + " ";
        if (item.price_per_unit) combinedSearchableText += item.price_per_unit + " ";
      });
    }

    const matchesQuery = combinedSearchableText.toLowerCase().includes(queryLower);

    const isSupplierAuth =
      userAuth === 'supplier' ? row.supplier_number === 'SUP123' : true;
      
    return matchesQuery && isSupplierAuth;
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-700">Loading records...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500">Error fetching records: {error}. Please try again later.</div>;
  }

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Receiving Records</h1>
        </div>

        <div className="w-full mb-8">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search records..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base shadow-sm bg-white transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="min-w-full text-base text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 font-medium text-gray-700">Date</th>
                <th className="px-8 py-4 font-medium text-gray-700">Supplier Name</th>
                <th className="px-8 py-4 font-medium text-gray-700">Sup #</th>
                <th className="px-8 py-4 font-medium text-gray-700">SKU Name</th>
                <th className="px-8 py-4 font-medium text-gray-700">SKU #</th>
                <th className="px-8 py-4 font-medium text-gray-700">Serial / Barcode #</th>
                <th className="px-8 py-4 font-medium text-gray-700 pr-12">GRN #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((row) => (
                <React.Fragment key={row.order_id}>
                  <tr
                    onClick={() => toggleRow(row.order_id)}
                    className="bg-white hover:bg-gray-50 transition duration-150 cursor-pointer"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.scheduled_date || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.supplier_name || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.supplier_number || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.sku_name || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.sku_number || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.serial_barcode || 'N/A'}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900 pr-12">{row.order_id || 'N/A'}</td>
                  </tr>
                  {expandedRows.includes(row.order_id) && row.items && Array.isArray(row.items) && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-8 py-6">
                        <div className="text-gray-900 space-y-4">
                          {row.items.length > 0 ? (
                            row.items.map((item, itemIdx) => (
                              <div key={item.item_id || itemIdx} className="grid grid-cols-4 gap-x-4 items-center py-1 text-sm">
                                <span className="px-2">HS Code: {item.hs_code || 'N/A'}</span>
                                <span className="px-2 col-span-1">Desc: {item.sku_name || 'N/A'} {item.description ? `/ ${item.description}` : ''}</span>
                                <span className="px-2">Qty: {item.quantity !== undefined ? item.quantity : 'N/A'}</span>
                                <span className="px-2">Price: {item.price_per_unit !== undefined ? item.price_per_unit : 'N/A'}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-2">No detailed items for this order.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredData.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-8">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default ReceivingRecords;