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
      errors.push('❌ INV number in the Bill of Entry must match the one in the Invoice.');
      setOcrErrors(prev => ({
        ...prev,
        bill_of_entry: 'Resubmit required',
        invoice: 'Resubmit required'
      }));
    }
  
    if (!invoiceAwbMatch || !airwayBillMatch || invoiceAwbMatch[0] !== airwayBillMatch[0]) {
      errors.push('❌ AWB number in the Invoice must match the one in the Airway Bill.');
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
          {[{ label: 'Invoice', key: 'invoice', emoji: '📄' }, { label: 'Bill of Entry', key: 'bill_of_entry', emoji: '📄' }, { label: 'Airway Bill', key: 'airway_bill', emoji: '📄' }].map(({ label, key, emoji }) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-2">
              <span className={`text-lg font-dm md:w-40 ${attachments[key] ? (ocrErrors[key] ? 'text-red-400' : 'text-lime-400') : 'text-gray-400'}`}>
                {uploadingStatus[key] ? <span className="text-blue-400">{`${emoji} ${label} Uploading...`}</span> : (attachments[key] ? (ocrErrors[key] ? `🚨 ${label} Resubmit required` : `✅ ${label} Submitted`) : `${emoji} ${label}`)}
              </span>
              {ocrErrors[key] && <p className="text-red-400 text-sm md:w-40 ml-48 mt-2"><i>{ocrErrors[key]}...</i></p>}
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => handleFileChange(e, key)}
                className="block w-full md:w-auto text-sm text-white file:mr-3 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#365c46] file:text-white hover:file:bg-[#3e6e53]"
                lang="en"
              />
            </div>
          ))}
        </div>
      </div>

      {alertErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4 mb-4 relative">
          <div className="flex">
            <div className="shrink-0">
              <XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">There were errors with your submission</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {alertErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <button onClick={handleAlertClose} className="absolute top-2 right-2 text-black hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9.293l4.646-4.647a.5.5 0 01.708.708L10.707 10l4.647 4.646a.5.5 0 01-.708.708L10 10.707l-4.646 4.647a.5.5 0 01-.708-.708L9.293 10 4.646 5.354a.5.5 0 11.708-.708L10 9.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

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
          font-size: 1.125rem;
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
