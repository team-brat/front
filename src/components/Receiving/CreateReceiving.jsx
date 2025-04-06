import React, { useState } from 'react';

const CreateReceiving = () => {
  const [formData, setFormData] = useState({});
  const [attachments, setAttachments] = useState({
    invoice: false,
    billOfEntry: false,
    airwayBill: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, documentType) => {
    if (e.target.files.length > 0) {
      setAttachments(prev => ({
        ...prev,
        [documentType]: true
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1d2e24] p-8 rounded-2xl space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold mb-8 tracking-tight font-grotesk">Creating Receiving</h1>
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
          <input className="input" name="SKU Name" placeholder="SKU Name" onChange={handleChange} />
          <input className="input" name="SKU #" placeholder="SKU #" onChange={handleChange} />
          <input className="input" name="Serial/Barcode # " placeholder="Serial/Barcode #" onChange={handleChange} />
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
        <div className="space-y-4">
          {[{ label: 'Invoice', key: 'invoice' }, { label: 'Bill of Entry', key: 'billOfEntry' }, { label: 'Airway Bill', key: 'airwayBill' }].map(({ label, key }) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-6">
              <span className={`text-sm font-dm md:w-40 ${attachments[key] ? 'text-lime-400' : 'text-gray-400'}`}>
                {attachments[key] ? `✅ ${label} Submitted` : label}
              </span>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, key)}
                className="block w-full md:w-auto text-sm text-white file:mr-3 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#365c46] file:text-white hover:file:bg-[#3e6e53] file:content-['Upload_File']"
                lang="en"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 text-right">
        <button
          type="submit"
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2 rounded-xl shadow transition text-sm"
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
        input::file-selector-button {
          content: 'Upload File';
        }
      `}</style>
    </form>
  );
};

export default CreateReceiving;
