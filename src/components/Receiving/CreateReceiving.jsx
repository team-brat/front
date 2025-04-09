import React, { useState } from 'react';

const CreateReceiving = () => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [attachments, setAttachments] = useState({
    invoice: null,
    bill_of_entry: null,
    airway_bill: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e, documentType) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Content = reader.result.split(',')[1];
        setAttachments(prev => ({
          ...prev,
          [documentType]: {
            file_name: file.name,
            content_type: file.type,
            file_content: base64Content
          }
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'scheduledDate', 'supplierName', 'supplierNumber',
      'skuName', 'skuNumber', 'barcode',
      'length', 'width', 'height', 'depth', 'volume', 'weight',
      'shipmentNumber', 'truckNumber', 'driverContact'
    ];

    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = 'Required';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      setFormErrors({});
    }

    const API_URL = "https://zf42ytba0m.execute-api.us-east-2.amazonaws.com/dev";
    const RECEIVING_ORDERS_ENDPOINT = `${API_URL}/receiving-orders`;

    const payload = {
      request_details: {
        scheduled_date: formData.scheduledDate,
        supplier_name: formData.supplierName,
        supplier_number: formData.supplierNumber,
        sku_name: formData.skuName,
        sku_number: formData.skuNumber,
        serial_or_barcode: formData.barcode
      },
      sku_information: {
        sku_name: formData.skuName,
        sku_number: formData.skuNumber,
        serial_or_barcode: formData.barcode,
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        depth: parseFloat(formData.depth),
        volume: parseFloat(formData.volume),
        weight: parseFloat(formData.weight)
      },
      shipment_information: {
        shipment_number: formData.shipmentNumber,
        truck_number: formData.truckNumber,
        driver_contact_info: formData.driverContact
      },
      documents: attachments,
      user_id: "brat"
    };

    console.log('Sending payload:', payload);

    try {
      const response = await fetch(RECEIVING_ORDERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.status === 201) {
        const responseData = await response.json();
        console.log('Success! Order created:', responseData);
      } else {
        const errorData = await response.json();
        console.error('Failed to create order:', errorData);
      }

    } catch (error) {
      console.error('Error creating receiving order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1d2e24] p-8 rounded-2xl space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold mb-8 tracking-tight font-grotesk">Creating Receiving</h1>
        <h2 className="text-xl font-semibold mb-4">Request Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <input className={`input ${formErrors['scheduledDate'] ? 'border-red-500' : ''}`} type="date" name="scheduledDate" onChange={handleChange} />
            {formErrors['scheduledDate'] && <p className="text-red-400 text-xs">Required</p>}
          </div>
          {['supplierName', 'supplierNumber', 'skuName', 'skuNumber', 'barcode'].map((field) => (
            <div key={field} className="space-y-1">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-xs">Required</p>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">SKU Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['length', 'width', 'height', 'depth', 'volume', 'weight'].map((field) => (
            <div key={field} className="space-y-1">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                type="number"
                step="0.1"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-xs">Required</p>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Shipment Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['shipmentNumber', 'truckNumber', 'driverContact'].map((field) => (
            <div key={field} className="space-y-1">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-xs">Required</p>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Document Attachment</h2>
        <div className="space-y-4">
          {[{ label: 'Invoice', key: 'invoice' }, { label: 'Bill of Entry', key: 'bill_of_entry' }, { label: 'Airway Bill', key: 'airway_bill' }].map(({ label, key }) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-6">
              <span className={`text-sm font-dm md:w-40 ${attachments[key] ? 'text-lime-400' : 'text-gray-400'}`}>
                {attachments[key] ? `✅ ${label} Submitted` : label}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, key)}
                className="block w-full md:w-auto text-sm text-white file:mr-3 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#365c46] file:text-white hover:file:bg-[#3e6e53]"
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
          width: 100%;
        }
        .input::placeholder {
          color: #9ca3af;
        }
        input::file-selector-button {
          content: 'Upload File';
        }
        input[type="date"] {
          color-scheme: dark;
        }
      `}</style>
    </form>
  );
};

export default CreateReceiving;
