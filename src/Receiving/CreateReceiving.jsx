import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { XCircleIcon } from '@heroicons/react/20/solid';

const CreateReceiving = () => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [attachments, setAttachments] = useState({
    invoice: null,
    bill_of_entry: null,
    airway_bill: null
  });
  const [ocrTexts, setOcrTexts] = useState({
    invoice: '',
    bill_of_entry: '',
    airway_bill: ''
  });
  const [uploadingStatus, setUploadingStatus] = useState({
    invoice: false,
    bill_of_entry: false,
    airway_bill: false
  });
  const [ocrErrors, setOcrErrors] = useState({});
  const [alertErrors, setAlertErrors] = useState([]);

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
  
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        setUploadingStatus(prev => ({ ...prev, [documentType]: true }));
  
        let extractedText = '';
        try {
          const ocrResult = await Tesseract.recognize(file, 'eng', {
            // logger: m => console.log(`[OCR ${documentType}]`, m.status, m.progress),
          });
          extractedText = ocrResult.data.text;
          setOcrTexts(prev => ({
            ...prev,
            [documentType]: extractedText || '[EMPTY]'
          }));
          console.log(`[OCR ${documentType}]`, extractedText);
        } catch (err) {
          console.error(`❌ OCR failed for ${documentType}:`, err);
        } finally {
          setUploadingStatus(prev => ({ ...prev, [documentType]: false }));
        }
  
        setAttachments(prev => ({
          ...prev,
          [documentType]: {
            file_name: file.name,
            content_type: file.type,
            file_content: base64Content,
            extracted_text: extractedText || '[EMPTY]'
          }
        }));
      };
  
      reader.readAsDataURL(file);
    }
  };

  const validateOcrTexts = () => {
    const errors = {};
    const resetOcrText = (key) => {
      setOcrTexts(prev => ({
        ...prev,
        [key]: ''
      }));
    };

    if (!/INV-\d+/.test(ocrTexts.invoice)) {
      errors.invoice = 'Please upload a valid Invoice document...';
    }
    if (!/BOE-\d+/.test(ocrTexts.bill_of_entry)) {
      errors.bill_of_entry = 'Please upload a valid Bill of Entry document...';
    }
    if (!/AWB-\d+/.test(ocrTexts.airway_bill)) {
      errors.airway_bill = 'Please upload a valid Airway Bill document...';
    }
    return errors;
  };

  const validateMatchingTexts = () => {
    const errors = [];
  
    const invoiceMatch = ocrTexts.invoice?.match(/INV-\d{4}-\d{4}/i);  // ex: INV-2024-0001
    const billOfEntryMatch = ocrTexts.bill_of_entry?.match(/INV-\d{4}-\d{4}/i);
  
    const invoiceAwbMatch = ocrTexts.invoice?.match(/AWB-\d{6,}/i);    // ex: AWB-789456123
    const airwayBillMatch = ocrTexts.airway_bill?.match(/AWB-\d{6,}/i);
  
    if (!invoiceMatch || !billOfEntryMatch || invoiceMatch[0] !== billOfEntryMatch[0]) {
      errors.push('INV number in the Bill of Entry must match the one in the Invoice.');
      setOcrErrors(prev => ({
        ...prev,
        bill_of_entry: 'Resubmit required',
        invoice: 'Resubmit required'
      }));
    }
  
    if (!invoiceAwbMatch || !airwayBillMatch || invoiceAwbMatch[0] !== airwayBillMatch[0]) {
      errors.push('AWB number in the Invoice must match the one in the Airway Bill.');
      setOcrErrors(prev => ({
        ...prev,
        airway_bill: 'Resubmit required',
        invoice: 'Resubmit required'
      }));
    }
    console.log('>>> Extracted INV:', invoiceMatch?.[0]);
    console.log('>>> Extracted AWB:', invoiceAwbMatch?.[0]);

  
    return errors;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Current formData:', formData);
    console.log('Current attachments:', attachments);
  
    const requiredFields = [
      'ScheduledDate', 'SupplierName', 'SupplierNumber',
      'SKUName', 'SKUNumber', 'Barcode',
      'Length', 'Width', 'Height', 'Depth', 'Volume', 'Weight',
      'ShipmentNumber', 'TruckNumber', 'DriverContact'
    ];
  
    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = 'Required';
      }
    });

    const ocrErrors = validateOcrTexts();
    if (Object.keys(ocrErrors).length > 0) {
      setOcrErrors(ocrErrors);
      return;
    }

    const matchingErrors = validateMatchingTexts();
    if (matchingErrors.length > 0) {
      setAlertErrors(matchingErrors);
      return;
    }
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      setFormErrors({});
    }
  
    const API_URL = "https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev";
    const RECEIVING_ORDERS_ENDPOINT = `${API_URL}/receiving-orders`;
  
    const documentsArray = [
      {
        document_type: "INVOICE",
        ...attachments.invoice
      },
      {
        document_type: "BILL_OF_ENTRY",
        ...attachments.bill_of_entry
      },
      {
        document_type: "AIRWAY_BILL",
        ...attachments.airway_bill
      }
    ];
  
    const payload = {
      request_details: {
        scheduled_date: formData.scheduledDate,
        supplier_name: formData.supplierName,
        supplier_number: formData.supplierNumber,
        sku_name: formData.skuName,
        sku_number: formData.skuNumber,
        barcode: formData.barcode,
        notes: formData.notes || "자동 생성 요청입니다."
      },
      sku_information: {
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
        driver_contact: formData.driverContact
      },
      documents: documentsArray,
      user_id: "brat"
    };
  
    console.log('📦 Final payload being sent:', JSON.stringify(payload, null, 2));
  
    try {
      const response = await fetch(RECEIVING_ORDERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": "rszGEii3Wf99zN1SXqTs0aq4Q7loKTrxa8gd7Zdg"
        },
        body: JSON.stringify(payload)
      });
  
      console.log('Response status:', response.status);
  
      if (response.status === 201) {
        const responseData = await response.json();
        console.log('✅ Success! Order created:', responseData);
        
        console.log("Invoice에서 추출된 텍스트:", ocrTexts.invoice);

      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create order:', errorData);
      }
  
    } catch (error) {
      console.error('🔥 Error creating receiving order:', error);
    }
  };

  const handleAlertClose = () => {
    setAlertErrors([]);
  };
  

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-10 w-full">
      <div>
        <div className="pb-8 mb-10 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Creating Receiving</h1>
        </div>
        <div className="pb-8 mb-10 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Request Details</h2>
          
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <input className={`input ${formErrors['scheduledDate'] ? 'border-red-500' : ''}`} type="date" name="scheduledDate" onChange={handleChange} />
            {formErrors['scheduledDate'] && <p className="text-red-400 text-base">Required</p>}
          </div>
          {['SupplierName', 'SupplierNumber', 'SkuName', 'SkuNumber', 'Barcode'].map((field) => (
            <div key={field} className="space-y-2">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-base">Required</p>}
            </div>
          ))}
        </div>
        </div>
      </div>

      <div>
      <div className="pb-8 mb-10 border-b border-gray-200">

        <h2 className="text-xl font-semibold mb-6 text-[#374151]">SKU Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Length', 'Width', 'Height', 'Depth', 'Volume', 'Weight'].map((field) => (
            <div key={field} className="space-y-2">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                type="number"
                step="0.1"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-base">Required</p>}
            </div>
          ))}
        </div>
        </div>
      </div>

      <div>
      <div className="pb-8 mb-10 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-[#374151]">Shipment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['ShipmentNumber', 'TruckNumber', 'DriverContact'].map((field) => (
            <div key={field} className="space-y-2">
              <input
                className={`input ${formErrors[field] ? 'border-red-500' : ''}`}
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                onChange={handleChange}
              />
              {formErrors[field] && <p className="text-red-400 text-base">Required</p>}
            </div>
          ))}
        </div>
        </div>
      </div>

      <div>
      <div className="pb-8 mb-10 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-[#374151]">Document Attachment</h2>
        <div className="space-y-6">
          {[{ label: 'Invoice', key: 'invoice', emoji: '' }, { label: 'Bill of Entry', key: 'bill_of_entry', emoji: '' }, { label: 'Airway Bill', key: 'airway_bill', emoji: '' }].map(({ label, key, emoji }) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <span className={`text-xl font-dm md:w-40 ${attachments[key] ? (ocrErrors[key] ? 'text-red-400' : 'text-lime-400') : 'text-gray-400'}`}>
                {uploadingStatus[key] ? <span className="text-blue-400">{`${emoji} ${label} Uploading...`}</span> : (attachments[key] ? (ocrErrors[key] ? `🚨 ${label} Resubmit required` : `✅ ${label} Submitted`) : `${emoji} ${label}`)}
              </span>
              {ocrErrors[key] && <p className="text-red-400 text-base md:w-40 ml-48 mt-2"><i>{ocrErrors[key]}...</i></p>}
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => handleFileChange(e, key)}
                className="block w-full md:w-auto text-base text-white file:mr-3 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-gray-400 file:text-white hover:file:bg-gray-600"
                lang="en"
              />
            </div>
          ))}
        </div>
        </div>
      </div>

      {alertErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-6 mb-6 relative">
          <div className="flex">
            <div className="shrink-0">
              <XCircleIcon aria-hidden="true" className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-700">There were errors with your submission</h3>
              <div className="mt-3 text-lg text-red-700">
                <ul role="list" className="list-disc space-y-2 pl-6">
                  {alertErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <button onClick={handleAlertClose} className="block w-full md:w-auto text-lg text-gray-700 file:mr-3 file:py-2 file:px-5 file:rounded-lg file:border file:border-gray-300 file:text-lg file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9.293l4.646-4.647a.5.5 0 01.708.708L10.707 10l4.647 4.646a.5.5 0 01-.708.708L10 10.707l-4.646 4.647a.5.5 0 01-.708-.708L9.293 10 4.646 5.354a.5.5 0 11.708-.708L10 9.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="pt-6 text-right">
        <button
          type="submit"
          className="bg-gray-400 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition text-lg"
        >
          Submit
        </button>
      </div>

      <style jsx>{`
  .input {
    background-color: #ffffff;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    color: #111827;
    font-size: 1rem;
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

    </form>
  );
};

export default CreateReceiving;
