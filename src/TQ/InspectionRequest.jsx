import React, { useState } from 'react';

const mockInspectionList = [
  {
    receivedDate: '2025-04-20',
    supplierName: 'Logix Co.',
    supplierNumber: 'SUP123',
    skuName: 'Winter Jacket',
    skuNumber: 'SKU9876',
    barcode: 'BC12345678',
  },
  {
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },
  {
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },{
    receivedDate: '2025-04-21',
    supplierName: 'Fresh Corp.',
    supplierNumber: 'SUP456',
    skuName: 'Organic Apple',
    skuNumber: 'SKU5432',
    barcode: 'BC87654321',
  },
];

const InspectionRequest = () => {


  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Inspection Requests</h2>

      {/* Table */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-lime-300 text-left">
            <tr>
              <th className="px-4 py-2">Received Date</th>
              <th className="px-4 py-2">Supplier Name</th>
              <th className="px-4 py-2">Supplier #</th>
              <th className="px-4 py-2">SKU Name</th>
              <th className="px-4 py-2">SKU #</th>
              <th className="px-4 py-2">Serial/Barcode #</th>
            </tr>
          </thead>
          <tbody>
            {mockInspectionList.map((item, idx) => (
              <tr key={idx} className="bg-[#152b22] border border-white/10 hover:bg-[#294636]">
                <td className="px-4 py-2">{item.receivedDate}</td>
                <td className="px-4 py-2">{item.supplierName}</td>
                <td className="px-4 py-2">{item.supplierNumber}</td>
                <td className="px-4 py-2">{item.skuName}</td>
                <td className="px-4 py-2">{item.skuNumber}</td>
                <td className="px-4 py-2">{item.barcode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InspectionRequest;
