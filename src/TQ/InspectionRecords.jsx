import React, { useState } from 'react';

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
    <div className="bg-[#1d2e24] min-h-screen p-8 text-white font-sans">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Inspection Records</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by any field..."
          className="bg-[#0f1f17] px-4 py-2 rounded-md border border-lime-400/30 text-white text-sm w-full sm:w-80"
        />
        <button
          onClick={() => setQuery('')}
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2 rounded-xl text-sm"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-lime-300 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Supplier #</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">SKU #</th>
              <th className="px-4 py-2">Barcode</th>
              <th className="px-4 py-2">Worker ID</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr
                key={idx}
                className="bg-[#152b22] border border-white/10 hover:bg-[#294636] cursor-pointer"
                onClick={() => {
                  if (item.status === 'Rejected') setSelectedDefect(item);
                }}
              >
                <td className="px-4 py-2">{item.date}</td>
                <td className="px-4 py-2">{item.supplierName}</td>
                <td className="px-4 py-2">{item.supplierId}</td>
                <td className="px-4 py-2">{item.skuName}</td>
                <td className="px-4 py-2">{item.skuId}</td>
                <td className="px-4 py-2">{item.barcode}</td>
                <td className="px-4 py-2">{item.workerId}</td>
                <td className={`px-4 py-2 font-semibold ${statusColor[item.status]}`}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDefect && (
        <div className="mt-8 p-6 bg-[#152b22] border border-red-400 rounded-xl">
          <h3 className="text-red-400 text-lg font-semibold mb-2">Defect Details</h3>
          <p className="text-white/80 mb-1">
            <span className="text-gray-300 font-medium">Defect Code:</span> {selectedDefect.defectCode}
          </p>
          <p className="text-white/80">
            <span className="text-gray-300 font-medium">Defect Reason:</span> {selectedDefect.defectReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default InspectionRecords;
