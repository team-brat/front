// CreateReceiving.jsx
import React, { useState } from 'react';

const CreateReceiving = () => {
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
    <form onSubmit={handleSubmit} className="bg-[#1d2e24] p-6 rounded-2xl space-y-8 w-full">
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
    </form>
  );
};

export default CreateReceiving;
