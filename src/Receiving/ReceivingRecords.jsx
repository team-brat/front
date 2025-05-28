import React, { useState, useContext } from 'react';
import { UserAuthContext } from '../App';
import mockData from '../sample-data/mock-receiving-records.json';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const ReceivingRecords = () => {
  const { userAuth } = useContext(UserAuthContext);
  const [query, setQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredData = mockData.filter((row) => {
    const matchesQuery = Object.values(row).some((value) =>
      value.toLowerCase().includes(query.toLowerCase())
    );
    const isSupplierAuth =
      userAuth === 'supplier' ? row.supplierNumber === 'SUP123' : true;
    return matchesQuery && isSupplierAuth;
  });

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
              {filteredData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    onClick={() => toggleRow(idx)}
                    className="bg-white hover:bg-gray-50 transition duration-150 cursor-pointer"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.receivedDate}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.supplierName}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.supplierNumber}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.skuName}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.skuNumber}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.barcode}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-900 pr-12">{row.grn}</td>
                  </tr>
                  {expandedRows.includes(idx) && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-8 py-6">
                        <div className="text-gray-900 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="px-4">HS Code: 6109.10</span>
                            <span className="px-4">Description: Name: Cottom T-Shirt / Size: S</span>
                            <span className="px-4">Quantity: 500</span>
                            <span className="px-4">Price: 30</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="px-4">HS Code: 6109.10</span>
                            <span className="px-4">Description: Name: Cottom T-Shirt / Size: M</span>
                            <span className="px-4">Quantity: 700</span>
                            <span className="px-4">Price: 31</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredData.length === 0 && (
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