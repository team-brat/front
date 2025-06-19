import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const samplePickingList = [
  {
    loc: 'A01-001-01',
    requiredQty: 10,
    pickedQty: 0,
    itemRfid: '',
  },
  {
    loc: 'A01-001-02',
    requiredQty: 5,
    pickedQty: 0,
    itemRfid: '',
  },
];

const Picking = () => {
  const [toteBarcode, setToteBarcode] = useState('');
  const [pickingList, setPickingList] = useState(samplePickingList);
  const [rfidScan, setRfidScan] = useState('');
  const printRef = useRef();

  const handleConfirmTote = () => {
    // TODO: API 연결 후 pickingList를 불러오는 로직으로 확장
    alert(`Tote: ${toteBarcode} confirmed.`);
  };

  const handleConfirmPick = (index) => {
    setPickingList((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              pickedQty: item.pickedQty + 1,
            }
          : item
      )
    );
  };

  const handlePrintPickSlip = async () => {
    if (printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        
        // PNG로 다운로드
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `pick-slip-${toteBarcode || 'tote'}.png`;
        link.href = pngUrl;
        link.click();
      } catch (error) {
        console.error('Print error:', error);
        alert('프린트 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="p-12 space-y-10 w-full" ref={printRef}>
      <div className="pb-10 mb-10 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">Picking</h1>
          <button 
            onClick={handlePrintPickSlip}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
          >
            Print Pick Slip
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-green-700">TOTE 1</h2>
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">TOTE Barcode</label>
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded-md"
              value={toteBarcode}
              onChange={(e) => setToteBarcode(e.target.value)}
              placeholder="Enter RFID"
            />
            <button
              onClick={handleConfirmTote}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              Confirm
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {pickingList.map((item, index) => (
            <div
              key={index}
              className="bg-green-50 p-6 rounded-xl border border-green-200 space-y-4"
            >
              <div className="flex items-center justify-between space-x-6">
                <div className="text-gray-800">
                  <div className="mb-2 font-medium">
                    <strong>LOC:</strong>{' '}
                    <span className="bg-yellow-200 px-2 py-1 rounded">{item.loc}</span>
                  </div>
                  <div>
                    <strong>Picking Qty:</strong>{' '}
                    <span className="bg-yellow-100 px-2 py-1 rounded">{item.requiredQty} pcs</span>
                  </div>
                </div>

                <div className="text-green-900">
                  <strong>Picked Qty:</strong> {item.pickedQty} pcs
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="text-gray-700 font-medium">ITEM RFID</label>
                <input
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded-md w-60"
                  value={rfidScan}
                  onChange={(e) => setRfidScan(e.target.value)}
                  placeholder="Enter RFID"
                />
                <button
                  onClick={() => handleConfirmPick(index)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-md">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Picking;
