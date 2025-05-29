import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const mockData = [
  {
    date: '2025-05-20',
    supplierName: 'Logix Co.',
    supplierId: 'SUP123',
    skuName: 'Winter Jacket',
    skuId: 'SKU9876',
    barcode: 'BC12345678',
    workerId: 'WK001',
    status: 'Approved',
  },
  {
    date: '2025-05-21',
    supplierName: 'K-Fresh',
    supplierId: 'SUP456',
    skuName: 'Apple Box',
    skuId: 'SKU5432',
    barcode: 'BC87654321',
    workerId: 'WK002',
    status: 'In Progress',
  },
  {
    date: '2025-05-21',
    supplierName: 'TechParts',
    supplierId: 'SUP999',
    skuName: 'Circuit Board',
    skuId: 'SKU0001',
    barcode: 'BC00011122',
    workerId: 'WK003',
    status: 'Rejected',
    defectCode: 'D102',
    defectReason: 'Missing connector pins',
  },
];

const statusColor = {
  'Approved': 'text-green-400',
  'In Progress': 'text-yellow-300',
  'Rejected': 'text-red-500',
};

const InspectionRecords = () => {
  const [query, setQuery] = useState('');
  const [selectedDefect, setSelectedDefect] = useState(null);

  const filtered = query
    ? mockData.filter((item) =>
        Object.values(item).some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : mockData;

  return (
    <div className="p-10 space-y-10 w-full">
      <div>
        <div className="pb-8 mb-10 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Inspection Records</h1>
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

        <div className="overflow-x-auto">
          <table className="w-full text-lg border-separate border-spacing-y-2">
            <thead className="text-gray-700 text-left">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Supplier #</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">SKU #</th>
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4">Worker ID</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={idx}
                  className="bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (item.status === 'Rejected') setSelectedDefect(item);
                  }}
                >
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4">{item.supplierName}</td>
                  <td className="px-6 py-4">{item.supplierId}</td>
                  <td className="px-6 py-4">{item.skuName}</td>
                  <td className="px-6 py-4">{item.skuId}</td>
                  <td className="px-6 py-4">{item.barcode}</td>
                  <td className="px-6 py-4">{item.workerId}</td>
                  <td className={`px-6 py-4 font-semibold ${statusColor[item.status]}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedDefect && (
          <div className="mt-10 p-8 bg-white border border-red-400 rounded-xl shadow-lg">
            <h3 className="text-red-400 text-xl font-semibold mb-4">Defect Details</h3>
            <p className="text-gray-700 mb-2 text-lg">
              <span className="text-gray-900 font-medium">Defect Code:</span> {selectedDefect.defectCode}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="text-gray-900 font-medium">Defect Reason:</span> {selectedDefect.defectReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionRecords;
