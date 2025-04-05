import React, { useState } from 'react';
import Header from './Header';

const ReceivingPage = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#152b22] to-[#1f3d2d] px-6 py-8 text-white font-sans">
      <Header />
      {/* <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, Sana</h1>
          <p className="text-lime-400 mt-1">Feb 01, 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <img src="/brat-logo.png" alt="Sana Kang" className="w-10 h-10 rounded-full border-2 border-lime-400" />
          <div>
            <p className="text-sm font-medium">Sana Kang</p>
            <p className="text-xs text-lime-300">Warehouse Operator</p>
          </div>
        </div>
      </header> */}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <button className="w-full py-2 px-4 bg-[#1d2e24] hover:bg-[#23352b] text-left rounded-xl text-white font-medium">Create Receiving</button>
          <button className="w-full py-2 px-4 bg-[#1d2e24] hover:bg-[#23352b] text-left rounded-xl text-white font-medium">Receiving Records</button>
          <button className="w-full py-2 px-4 bg-[#1d2e24] hover:bg-[#23352b] text-left rounded-xl text-white font-medium">Documents</button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="col-span-4 bg-[#1d2e24] p-6 rounded-2xl space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Request Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input className="input" name="scheduledDate" placeholder="Scheduled Date" onChange={handleChange} />
              <input className="input" name="supplierName" placeholder="Supplier Name" onChange={handleChange} />
              <input className="input" name="supplierNumber" placeholder="Supplier #" onChange={handleChange} />
              <input className="input" name="skuName" placeholder="SKU Name" onChange={handleChange} />
              <input className="input" name="skuNumber" placeholder="SKU #" onChange={handleChange} />
              <input className="input" name="barcode" placeholder="Serial or Barcode #" onChange={handleChange} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">SKU Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input className="input" name="length" placeholder="Length" onChange={handleChange} />
              <input className="input" name="width" placeholder="Width" onChange={handleChange} />
              <input className="input" name="height" placeholder="Height" onChange={handleChange} />
              <input className="input" name="depth" placeholder="Depth" onChange={handleChange} />
              <input className="input" name="volume" placeholder="Volume" onChange={handleChange} />
              <input className="input" name="weight" placeholder="Weight" onChange={handleChange} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Shipment Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input className="input" name="shipmentNumber" placeholder="Shipment #" onChange={handleChange} />
              <input className="input" name="truckNumber" placeholder="Truck #" onChange={handleChange} />
              <input className="input" name="driverContact" placeholder="Driver Contact Info" onChange={handleChange} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Document Attachment</h2>
            <input
              type="file"
              multiple
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-gray-900 hover:file:bg-lime-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-lime-500 hover:bg-lime-400 text-gray-900 font-semibold px-6 py-2 rounded-full shadow-md transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          background-color: #152b22;
          padding: 0.75rem 1rem;
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

export default ReceivingPage;
