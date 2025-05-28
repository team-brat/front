import React, { useState, useContext, useEffect } from 'react';
import { UserAuthContext } from '../App';
import mockData from '../sample-data/mock-receiving-suppliers.json';

const SupplierDetails = () => {
  const { userAuth } = useContext(UserAuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    // Initialize suppliers from mockData
    setSuppliers(mockData);
    
    if (userAuth === 'supplier') {
      setInfo(mockData[0]);
    }
  }, [userAuth]);

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase().trim();
    setQuery(e.target.value);
    
    if (!searchQuery) {
      setSuppliers(mockData);
      return;
    }

    const filtered = mockData.filter((s) => {
      const searchFields = [
        s.supplierName,
        s.supplierNumber,
        s.skuName,
        s.skuNumber,
        s.barcode
      ].map(field => (field || '').toLowerCase());

      return searchFields.some(field => field.includes(searchQuery));
    });
    
    setSuppliers(filtered);
  };

  const renderSupplierInfo = (supplier) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setInfo(null)}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-2xl font-semibold text-gray-900">Supplier Information</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-400 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-full text-base transition-all duration-200"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-400 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-full text-base transition-all duration-200"
          >
            Save
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-600">
            Supplier Name
          </label>
          {isEditing ? (
            <input className="input" name="supplierName" value={supplier.supplierName} onChange={handleChange} />
          ) : (
            <p className="text-lg text-gray-900">{supplier.supplierName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-600">
            Supplier #
          </label>
          {isEditing ? (
            <input className="input" name="supplierNumber" value={supplier.supplierNumber} onChange={handleChange} />
          ) : (
            <p className="text-lg text-gray-900">{supplier.supplierNumber}</p>
          )}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="block text-base font-medium text-gray-600">
            Responsible Person Contact Info
          </label>
          {isEditing ? (
            <input className="input w-full" name="contact" value={supplier.contact} onChange={handleChange} />
          ) : (
            <p className="text-lg text-gray-900">{supplier.contact}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-12 space-y-12 w-full">
      <div className="pb-10 mb-12 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">
          {userAuth === 'supplier' ? 'My Detail' : 'Supplier Details'}
        </h1>
      </div>

      {userAuth !== 'supplier' && !info && (
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search by supplier, SKU, or barcode..."
              className="w-full bg-white border border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-gray-900 text-base placeholder-gray-400 rounded-xl py-3 pl-12 pr-4 shadow-sm transition-all duration-200"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {info ? (
        <>
          {renderSupplierInfo(info)}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-6 text-gray-900">Inbound History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600">SKU #</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600">QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.inbound.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6 text-gray-900">{item.date}</td>
                        <td className="py-4 px-6 text-gray-900">{item.sku}</td>
                        <td className="py-4 px-6 text-gray-900">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-6 text-gray-900">Outbound History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600">SKU #</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600">QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.outbound.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6 text-gray-900">{item.date}</td>
                        <td className="py-4 px-6 text-gray-900">{item.sku}</td>
                        <td className="py-4 px-6 text-gray-900">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-6">
          {suppliers.map((supplier) => (
            <div 
              key={supplier.supplierNumber}
              className="bg-white p-8 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200 backdrop-blur-sm"
              onClick={() => setInfo(supplier)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{supplier.supplierName}</h3>
                  <p className="text-base text-gray-600">Supplier #{supplier.supplierNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-base text-gray-900 mb-2">{supplier.skuName}</p>
                  <p className="text-base text-gray-600">SKU #{supplier.skuNumber}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .input {
          background-color: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 1.3rem;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .input::placeholder {
          color: #6b7280;
          font-size: 1.3rem; 
        }
        input[type="date"] {
          color-scheme: light;
        }
      `}</style>
      
    </div>
  );
};

export default SupplierDetails;
