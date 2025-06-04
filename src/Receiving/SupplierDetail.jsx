import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserAuthContext } from '../App';

const API_BASE_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev';

// Helper to fetch suppliers list
async function getSuppliersList() {
  const response = await fetch(`${API_BASE_URL}/receiving-orders/suppliers`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Helper to fetch supplier details
async function getSupplierDetails(supplierId) {
  try {
    const response = await fetch(`${API_BASE_URL}/receiving-orders/suppliers/${supplierId}`);
    if (!response.ok) {
      console.error(`Error fetching details for supplier ID: ${supplierId}, Status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('TESTTEST: ', data); // Log the actual data received from the API
    return data;
  } catch (error) {
    console.error('Error during fetch operation:', error);
    throw error;
  }
}

const SupplierDetails = () => {
  const { userAuth } = useContext(UserAuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState(null); // Holds details of the selected supplier
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState([]); // List of suppliers to display (can be filtered)
  const [allSuppliers, setAllSuppliers] = useState([]); // Full list of suppliers from API

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectSupplier = useCallback(async (supplierId, isInitialLoad = false) => {
    if (!isInitialLoad) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getSupplierDetails(supplierId);
      setInfo({
        supplierName: data.supplier_name,
        supplierNumber: data.supplier_id,
        contact: data.contact_info,
        inbound: data.inbound_history.map(item => ({
          date: item.date,
          sku: item.sku_id, // Map sku_id to sku
          qty: item.qty,
        })),
        outbound: [], // API doesn't provide outbound, initialize as empty array
      });
    } catch (err) {
      const errorMessage = `Error loading supplier details: ${err.message}`;
      setError(errorMessage);
      console.error(`Error loading supplier details for ID ${supplierId}:`, err);
      // setInfo(null); // Optionally clear info on error, or let user see stale data with error message
    } finally {
      if (!isInitialLoad) {
        setLoading(false);
      }
    }
  }, []); // Empty dependency array as it doesn't rely on component scope variables that change

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      setInfo(null); // Clear previous details
      setSuppliers([]); // Clear previous list
      setAllSuppliers([]); 

      try {
        const rawSuppliersList = await getSuppliersList();
        const mappedSuppliersList = rawSuppliersList.map(s => ({
          id: s.supplier_id, // Store original ID for fetching details
          supplierName: s.supplier_name,
          supplierNumber: s.supplier_id,
          skuName: s.latest_sku_name,
          skuNumber: s.latest_sku_id,
        }));

        if (userAuth === 'supplier') {
          if (mappedSuppliersList.length > 0) {
            // For a supplier user, directly load their details.
            // Assuming the first supplier in the list is "their" supplier for this example.
            // A real app might get the supplier_name from userAuth context or another source.
            const mySupplierId = mappedSuppliersList[0].id;
            await handleSelectSupplier(mySupplierId, true); // true indicates it's part of initial page load
          } else {
            setError("No suppliers found. Your details cannot be displayed.");
          }
        } else {
          // For non-supplier users, display the list
          setAllSuppliers(mappedSuppliersList);
          setSuppliers(mappedSuppliersList);
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error("Failed to load initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userAuth, handleSelectSupplier]);


  const handleChange = (e) => {
    // This updates the 'info' object for the supplier being edited
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase().trim();
    setQuery(e.target.value);

    if (!searchQuery) {
      setSuppliers(allSuppliers); // Reset to the full list
      return;
    }

    const filtered = allSuppliers.filter((s) => {
      const searchFields = [
        s.supplierName,
        s.supplierNumber,
        s.skuName,
        s.skuNumber,
      ].map(field => (String(field) || '').toLowerCase()); // Ensure field is string before toLowerCase

      return searchFields.some(field => field.includes(searchQuery));
    });

    setSuppliers(filtered);
  };
  
  const handleSaveEdit = () => {
    // Here you would typically make an API call to save the changes in `info`
    // For now, it just toggles the editing state
    setIsEditing(false);
    // Example: await updateSupplierDetails(info.supplierNumber, info);
    console.log("Saved data (simulated):", info);
  };
  
  const handleBackToList = () => {
    setInfo(null);
    setIsEditing(false); // Reset editing state when going back
    // If a search query was active, the list will still be filtered.
    // To reset search, clear query: setQuery(''); setSuppliers(allSuppliers);
  };


  const renderSupplierInfo = (currentSupplierInfo) => ( // Renamed param to avoid conflict with 'info' state
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
         {userAuth !== 'supplier' && ( // Only show back button if not a supplier user (who sees only their detail)
          <button
            onClick={handleBackToList}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
         )}
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
            onClick={handleSaveEdit}
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
            <input className="input" name="supplierName" value={currentSupplierInfo.supplierName || ''} onChange={handleChange} />
          ) : (
            <p className="text-lg text-gray-900">{currentSupplierInfo.supplierName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-600">
            Supplier #
          </label>
          {isEditing ? (
            <input className="input" name="supplierNumber" value={currentSupplierInfo.supplierNumber || ''} onChange={handleChange} readOnly // Supplier number usually not editable
            />
          ) : (
            <p className="text-lg text-gray-900">{currentSupplierInfo.supplierNumber}</p>
          )}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="block text-base font-medium text-gray-600">
            Responsible Person Contact Info
          </label>
          {isEditing ? (
            <input className="input w-full" name="contact" value={currentSupplierInfo.contact || ''} onChange={handleChange} />
          ) : (
            <p className="text-lg text-gray-900">{currentSupplierInfo.contact}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && !info && suppliers.length === 0) { // Show full page loading only on initial load
    return <div className="p-12 text-center text-lg">Loading supplier data...</div>;
  }

  if (error && !info && suppliers.length === 0) { // Show full page error if initial load fails
    return <div className="p-12 text-center text-red-500 text-lg">Error: {error}</div>;
  }


  return (
    <div className="p-12 space-y-12 w-full">
      <div className="pb-10 mb-12 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">
          {userAuth === 'supplier' ? 'My Detail' : 'Supplier Details'}
        </h1>
      </div>

      {/* Search bar for non-supplier users when no specific supplier is selected */}
      {userAuth !== 'supplier' && !info && (
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search by supplier name, number, SKU name, or SKU number..."
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
          {loading && <p className="text-sm text-gray-500">Searching...</p>}
        </div>
      )}
      
      {/* Display error message if any, not obstructing content if content is already loaded */}
      {error && <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}


      {info ? (
        <>
          {renderSupplierInfo(info)}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-6 text-gray-900">Inbound History</h4>
              {info.inbound && info.inbound.length > 0 ? (
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
              ) : (
                <p className="text-gray-500">No inbound history available.</p>
              )}
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-6 text-gray-900">Outbound History</h4>
              {info.outbound && info.outbound.length > 0 ? (
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
              ) : (
                <p className="text-gray-500">No outbound history available.</p>
              )}
            </div>
          </div>
        </>
      ) : userAuth !== 'supplier' ? ( // Only show list if not a supplier and no specific info selected
        loading ? (
          <p className="text-center text-lg">Loading suppliers...</p>
        ) : suppliers.length > 0 ? (
          <div className="grid gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id} // Use the unique supplier ID as key
                className="bg-white p-8 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200 backdrop-blur-sm"
                onClick={() => handleSelectSupplier(supplier.id)}
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
        ) : (
          <p className="text-center text-lg">No suppliers found matching your search, or no suppliers available.</p>
        )
      ) : null /* For supplier user, if info is null (e.g. during initial load or error), don't show list */
    }

      <style jsx>{`
        .input {
          background-color: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 1.3rem; /* Consider reducing if too large, or ensure consistency */
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
        /* Minor style adjustment for better readability */
        .input:read-only {
            background-color: #f3f4f6; /* Lighter gray for read-only fields */
            cursor: not-allowed;
        }
      `}</style>
      
    </div>
  );
};

export default SupplierDetails;
