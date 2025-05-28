import React, { useState, useContext, useEffect } from 'react';
import { UserAuthContext } from '../App';
import mockStatus from '../sample-data/mock-receiving-status.json';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const statusColors = {
  'In progress': 'text-yellow-300',
  'Completed': 'text-green-400',
  'Rejected': 'text-red-500',
};

const ReceivingStatus = () => {
  const { userAuth } = useContext(UserAuthContext);
  const initialResults = userAuth === 'supplier' 
    ? mockStatus.filter((row) => row.supplierNumber === 'SUP123') 
    : mockStatus;
  const [results, setResults] = useState(initialResults);
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState(null);

  const handleSearch = () => {
    if (date === '') {
      setResults(mockStatus);
    } else {
      setResults(mockStatus.filter((row) => row.date === date));
    }
  };

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Receiving Status</h1>
        </div>

        <div className="w-full mb-8">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Enter date (e.g. 2025-01-28)"
              className="w-full pl-12 pr-12 py-3 text-base rounded-2xl border border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-300 transition"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="mt-1 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                customInput={
                  <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </button>
                }
              />
              <button
                onClick={handleSearch}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="min-w-full text-base text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 font-medium text-gray-700">Date</th>
                <th className="px-8 py-4 font-medium text-gray-700">Supplier #</th>
                <th className="px-8 py-4 font-medium text-gray-700">SKU #</th>
                <th className="px-8 py-4 font-medium text-gray-700">Quantity</th>
                <th className="px-8 py-4 font-medium text-gray-700 pr-12">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((row, idx) => (
                <tr key={idx} className="bg-white hover:bg-gray-50 transition duration-150">
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.date}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.supplierNumber}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.skuNumber}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">{row.quantity}</td>
                  <td className={`px-8 py-4 whitespace-nowrap font-semibold ${statusColors[row.status]}`}>{row.status}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-8">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .input {
          background-color: #ffffff;
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          color: #111827;
          font-size: 1.125rem;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .input::placeholder {
          color: #6b7280;
          font-size: 1.3rem; 
        }
      `}</style>
    </div>
  );
};

export default ReceivingStatus;
