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
];

const InspectionRequest = () => {
  const [docsUploaded, setDocsUploaded] = useState({ invoice: false, bill: false, airway: false });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e, docType) => {
    if (e.target.files.length > 0) {
      setDocsUploaded({ ...docsUploaded, [docType]: true });
    }
  };

  const handleConfirm = () => {
    const accuracy = Math.floor(Math.random() * 21) + 80; // 80~100%
    setResult(`${accuracy}%`);
  };

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

      {/* Document Upload + Barcode Confirm */}
      <div className="space-y-8">
        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Upload Required Documents</h3>
          {['invoice', 'bill', 'airway'].map((type) => (
            <div key={type} className="flex items-center gap-4 mb-3">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, type)}
                className="block w-full md:w-auto text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a3e635]/20 file:text-lime-300 hover:file:bg-lime-400/30"
              />
              <span className="text-sm font-dm">
                {type === 'invoice' ? 'Invoice' : type === 'bill' ? 'Bill of Entry' : 'Airway Bill'}{' '}
                {docsUploaded[type] && <span className="text-lime-400">Uploaded</span>}
              </span>
            </div>
          ))}
          <button className="mt-4 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm">
            Confirm
          </button>
        </div>

        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Enter Barcode or Serial #</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter barcode or serial number..."
              className="input w-full"
            />
            <button
              onClick={handleConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="text-center mt-8">
            <p className="text-lime-300 text-xl font-bold">Results: 실물과 서류 일치율 {result}</p>
            <div className="flex justify-center gap-6 mt-4">
              <button className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-lg">
                Approved
              </button>
              <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-lg">
                Declined
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          background-color: #0f1f17;
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #334d3d;
          color: white;
          font-size: 0.875rem;
        }
        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default InspectionRequest;
