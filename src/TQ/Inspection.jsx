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
    <div className="bg-[#1d2e24] min-h-screen p-8 text-white font-sans">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Inspection</h2>

      <div className="grid gap-6 bg-[#152b22] border border-lime-400/20 p-6 rounded-xl">
        <div>
          <label className="block text-sm text-lime-300 mb-1">Worker ID</label>
          <input disabled value={workerId} className="input w-full opacity-60" />
        </div>

        <div>
          <label className="block text-sm text-lime-300 mb-1">SKU Barcode</label>
          <input
            className="input w-full"
            placeholder="Scan barcode or enter serial number"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleApproved}
            className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold px-6 py-2 rounded-xl"
          >
            Approved
          </button>
          <button
            onClick={handleReportDefect}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl"
          >
            Report Defect
          </button>
        </div>
      </div>

      {/* Defect Info */}
      <div className="mt-8 bg-[#152b22] border border-red-400/20 p-6 rounded-xl">
        <h3 className="text-red-400 font-semibold text-lg mb-3">Report Defect</h3>
        <label className="block text-sm mb-1 text-gray-300">Defect Reason</label>
        <select
          className="input w-full mb-4"
          value={defectReason}
          onChange={(e) => setDefectReason(e.target.value)}
        >
          <option value="">-- Select reason --</option>
          <option value="파손">파손</option>
          <option value="개수 불일치">개수 불일치</option>
          <option value="바코드 불일치">바코드 불일치</option>
        </select>

        <label className="block text-sm mb-1 text-gray-300">Proof of Defect (image)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#334d3d] file:text-lime-300 hover:file:bg-lime-400/20 text-sm"
        />
      </div>

      {/* Result */}
      {resultMessage && (
        <div className="mt-10 bg-[#0f1f17] border border-white/10 rounded-xl p-6 text-center">
          <p
            className={`text-lg whitespace-pre-wrap font-bold ${
              resultType === 'approved'
                ? 'text-blue-400'
                : resultType === 'declined'
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {resultMessage}
          </p>
        </div>
      )}

      <style jsx>{`
        .input {
          background-color: #0f1f17;
          padding: 0.6rem 1rem;
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

export default Inspection;
