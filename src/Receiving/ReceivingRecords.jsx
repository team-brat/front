import React, { useState, useContext } from 'react';
import { UserAuthContext } from '../App'; // Import the context
import mockData from '../sample-data/mock-receiving-records.json';

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
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-8 tracking-tight font-grotesk">
        Receiving Records
      </h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by any field..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-[#152b22] px-4 py-2 rounded-full text-sm border border-[#334d3d] text-white w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
        />
        <button
          onClick={() => setQuery('')}
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2 rounded-full shadow-md text-sm"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-lime-500/10 shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#2a3d33] text-lime-300">
            <tr>
              <th className="px-6 py-3 font-medium font-grotesk">Received Date</th>
              <th className="px-6 py-3 font-medium font-grotesk">Supplier Name</th>
              <th className="px-6 py-3 font-medium font-grotesk">Supplier #</th>
              <th className="px-6 py-3 font-medium font-grotesk">SKU Name</th>
              <th className="px-6 py-3 font-medium font-grotesk">SKU #</th>
              <th className="px-6 py-3 font-medium font-grotesk">Serial / Barcode #</th>
              <th className="px-6 py-3 font-medium font-grotesk">GRN #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334d3d]">
            {filteredData.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr
                  onClick={() => toggleRow(idx)}
                  className="odd:bg-[#1a2a21] even:bg-[#1f3328] hover:bg-[#294636] transition duration-150 cursor-pointer"
                >
                  <td className="px-6 py-3 whitespace-nowrap">{row.receivedDate}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.supplierName}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.supplierNumber}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.skuName}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.skuNumber}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.barcode}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{row.grn}</td>
                </tr>
                {expandedRows.includes(idx) && (
                  <tr className="bg-[#2a3d33]">
                    <td colSpan="7" className="px-6 py-3">
                      <div className="text-white">
                        <div className="flex justify-between">
                          <span>HS Code: 6109.10</span>
                          <span>Description: Name: Cottom T-Shirt / Size: S</span>
                          <span>Quantity: 500</span>
                          <span>Price: 30</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>HS Code: 6109.10</span>
                          <span>Description: Name: Cottom T-Shirt / Size: M</span>
                          <span>Quantity: 700</span>
                          <span>Price: 31</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-6">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivingRecords;