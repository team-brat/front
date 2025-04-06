import React, { useState } from 'react';

const DocVerification = () => {
  const [docsUploaded, setDocsUploaded] = useState({ invoice: false, bill: false, airway: false });
  const [barcode, setBarcode] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const handleFileChange = (e, docType) => {
    if (e.target.files.length > 0) {
      setDocsUploaded({ ...docsUploaded, [docType]: true });
    }
  };

  const handleBarcodeConfirm = () => {
    // mock verification logic
    const randomAccuracy = Math.floor(Math.random() * 101); // 0~100%
    setAccuracy(randomAccuracy);
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">Document Verification</h2>

      <div className="space-y-6 mb-10">
        {/* Upload Area */}
        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-lime-300">Upload Required Documents</h3>
            <button className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition">
              Confirm
            </button>
          </div>
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
        </div>

        {/* Barcode Check */}
        <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20">
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Enter Barcode or Serial #</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode or serial number..."
              className="input w-full"
            />
            <button
              onClick={handleBarcodeConfirm}
              className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-6 py-1.5 rounded-xl text-sm transition"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="mt-8 text-center">
          <p className="text-lime-300 text-xl font-bold">Document verification match rate: {accuracy !== null ? accuracy : ''}%</p>
          <div className="mt-4 flex justify-center gap-6">
            <button className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-lg">
              Approved
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-lg">
              Declined
            </button>
          </div>
        </div>
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

export default DocVerification;