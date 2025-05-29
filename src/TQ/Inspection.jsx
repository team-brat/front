import React, { useState } from 'react';
import axios from 'axios';

const Inspection = () => {
  const [workerId] = useState('W1003'); // 계정 연동값
  const [barcode, setBarcode] = useState('');
  const [defectReason, setDefectReason] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [resultType, setResultType] = useState(null);

  const BASE_URL = 'https://tf9s4afzsh.execute-api.us-east-2.amazonaws.com/dev';

  const handleApproved = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/inspection/${barcode}/approved`, {
        worker_id: workerId,
        barcode,
      });
      setResultMessage(`GRN 생성이 완료되었습니다.\nGRN: ${res.data.grn}`);
      setResultType('approved');
    } catch (err) {
      console.error(err);
      setResultMessage('에러 발생: 승인 실패');
      setResultType('error');
    }
  };

  const handleReportDefect = async () => {
    try {
      const base64Image = imageFile ? await toBase64(imageFile) : '';
      const body = {
        worker_id: workerId,
        barcode,
        defect_reason: defectReason,
        defect_image: base64Image,
      };
      const res = await axios.post(`${BASE_URL}/inspection/${barcode}/declined`, body);
      setResultMessage(`Defection 접수가 완료되었습니다.\ndefect_id: ${res.data.defect_id}`);
      setResultType('declined');
    } catch (err) {
      console.error(err);
      setResultMessage('에러 발생: 리포트 실패');
      setResultType('error');
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="pb-8 mb-10 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Inspection</h1>
        </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Worker ID</label>
            <input 
              disabled 
              value={workerId} 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm opacity-60" 
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">SKU Barcode</label>
            <input
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm"
              placeholder="Scan barcode or enter serial number"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleApproved}
              className="bg-lime-500 hover:bg-lime-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base"
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Report Defect</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Defect Reason</label>
            <select
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 text-base shadow-sm"
              value={defectReason}
              onChange={(e) => setDefectReason(e.target.value)}
            >
              <option value="">-- Select reason --</option>
              <option value="Damaged">Damaged</option>
              <option value="Quantity Mismatch">Quantity Mismatch</option>
              <option value="Barcode Mismatch">Barcode Mismatch</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Proof of Defect (image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-base file:font-semibold file:bg-lime-100 file:text-lime-800 hover:file:bg-lime-200 text-base"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleReportDefect}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base"
            >
              Report Defect
            </button>
          </div>
        </div>
      </div>

      {resultMessage && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p
            className={`text-xl font-bold text-center ${
              resultType === 'approved'
                ? 'text-lime-600'
                : resultType === 'declined'
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}
          >
            {resultMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default Inspection;
