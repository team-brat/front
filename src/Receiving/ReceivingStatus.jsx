import React, { useState } from 'react';
import mockStatus from '../sample-data/mock-receiving-status.json';

const statusColors = {
  'In progress': 'text-yellow-300',
  'Completed': 'text-green-400',
  'Rejected': 'text-red-500',
};

const ReceivingStatus = () => {
  const [date, setDate] = useState('');
  const [results, setResults] = useState(mockStatus);

  const handleSearch = () => {
    if (date === '') {
      setResults(mockStatus);
    } else {
      setResults(mockStatus.filter((row) => row.date === date));
    }
  };

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 text-white font-sans">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Receiving Status</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#0f1f17] px-4 py-2 rounded-md border border-lime-400/30 text-white text-sm"
          lang="en"
          ref={(el) => {
            if (el) {
              el.defaultValue = new Date().toLocaleDateString('en-US');
            }
          }}
        />
        
        <button
          onClick={handleSearch}
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2 rounded-xl text-sm"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-lime-300 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Supplier #</th>
              <th className="px-4 py-2">SKU #</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="bg-[#152b22] border border-white/10 rounded-xl">
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.supplierNumber}</td>
                <td className="px-4 py-2">{row.skuNumber}</td>
                <td className="px-4 py-2">{row.quantity}</td>
                <td className={`px-4 py-2 font-semibold ${statusColors[row.status]}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivingStatus;
