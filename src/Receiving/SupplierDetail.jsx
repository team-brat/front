import React, { useState } from 'react';
import mockData from '../sample-data/mock-receiving-suppliers.json';

const mockSuppliers = mockData;

const SupplierDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState(mockSuppliers);

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setQuery('');
    setSuppliers(mockSuppliers);
    setInfo(null);
    setIsEditing(false);
  };

  const handleSearch = () => {
    if (!query) {
      setSuppliers(mockSuppliers);
      setInfo(null);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = mockSuppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(searchQuery) ||
        s.supplierNumber.toLowerCase().includes(searchQuery) ||
        s.skuName.toLowerCase().includes(searchQuery) ||
        s.skuNumber.toLowerCase().includes(searchQuery) ||
        s.barcode.toLowerCase().includes(searchQuery)
    );
    
    setSuppliers(filtered);
    setInfo(filtered[0] || null);
    setIsEditing(false);
  };

  const renderSupplierInfo = (supplier) => (
    <div className="bg-[#152b22] p-6 rounded-xl border border-lime-400/20 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-lime-300">Supplier Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="font-grotesk bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2 rounded-full text-sm"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="font-grotesk bg-lime-500 hover:bg-lime-400 text-gray-900 font-semibold px-5 py-2 rounded-full text-sm"
          >
            Save
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-gray-300">
            <span className="font-grotesk">
              Supplier Name
            </span>
          </label>
          {isEditing ? (
            <input className="input" name="supplierName" value={supplier.supplierName} onChange={handleChange} />
          ) : (
            <p>{supplier.supplierName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-300">
            <span className="font-grotesk">
              Supplier #
            </span>
          </label>
          {isEditing ? (
            <input className="input" name="supplierNumber" value={supplier.supplierNumber} onChange={handleChange} />
          ) : (
            <p>{supplier.supplierNumber}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 text-gray-300">
            <span className="font-grotesk">
              Responsible Person Contact Info
            </span>
          </label>
          {isEditing ? (
            <input className="input w-full" name="contact" value={supplier.contact} onChange={handleChange} />
          ) : (
            <p>{supplier.contact}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#1d2e24] min-h-screen p-8 rounded-2xl text-white font-sans">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Supplier Details</h2>

      <div className="flex gap-4 mb-6">
        <input
          className="input flex-1"
          placeholder="Search by Supplier name / SKU name / # / Barcode..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-600 hover:bg-gray-500 text-white font-medium px-4 py-2 rounded-xl text-sm"
        >
          Back
        </button>
      </div>

      {info ? (
        <>
          {renderSupplierInfo(info)}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#152b22] p-5 rounded-xl border border-lime-400/10">
              <h4 className="text-lg font-semibold mb-3 text-lime-200">Inbound History</h4>
              <table className="w-full text-sm">
                <thead className="text-lime-300">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">SKU #</th>
                    <th className="text-left py-2">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {info.inbound.map((item, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2">{item.date}</td>
                      <td>{item.sku}</td>
                      <td>{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[#152b22] p-5 rounded-xl border border-lime-400/10">
              <h4 className="text-lg font-semibold mb-3 text-lime-200">Outbound History</h4>
              <table className="w-full text-sm">
                <thead className="text-lime-300">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">SKU #</th>
                    <th className="text-left py-2">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {info.outbound.map((item, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2">{item.date}</td>
                      <td>{item.sku}</td>
                      <td>{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <div 
              key={supplier.supplierNumber}
              className="bg-[#152b22] p-4 rounded-xl border border-lime-400/20 cursor-pointer hover:bg-[#1a3329]"
              onClick={() => setInfo(supplier)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-lime-300">{supplier.supplierName}</h3>
                  <p className="text-sm text-gray-400">Supplier #{supplier.supplierNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-lime-200">{supplier.skuName}</p>
                  <p className="text-sm text-gray-400">SKU #{supplier.skuNumber}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default SupplierDetails;
