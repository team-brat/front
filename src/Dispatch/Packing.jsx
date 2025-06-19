import React, { useState } from 'react';

const Packing = () => {
  const [toteRfid, setToteRfid] = useState('');
  const [itemRfid, setItemRfid] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [packedItems, setPackedItems] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [itemConfirmed, setItemConfirmed] = useState(false);

  const handleToteConfirm = () => {
    // 추천된 박스 결과 (하드코딩된 예시)
    const recommendedBoxes = [
      { id: 1, size: 'S' },
      { id: 2, size: 'S' },
      { id: 3, size: 'M' },
      { id: 4, size: 'L' },
      { id: 5, size: 'L' },
    ];
    setBoxes(recommendedBoxes);
    setConfirmed(true);
  };

  const handleItemConfirm = () => {
    // 예시: RFID 끝자리에 따라 박스 할당 (임의)
    const boxId = itemRfid.trim() !== '' ? ((itemRfid.charCodeAt(itemRfid.length - 1) % 5) + 1) : 1;
    if (itemRfid.trim() !== '') {
      setPackedItems([...packedItems, { rfid: itemRfid, boxId }]);
      setItemRfid('');
    }
    setItemConfirmed(true);
  };

  return (
    <div className="p-12 space-y-12 w-full">
      <div>
        <div className="pb-10 mb-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Packing</h1>
        </div>

        <div className="space-y-10">
          {/* TOTE RFID 입력 */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-800">TOTE RFID</label>
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={toteRfid}
                onChange={(e) => setToteRfid(e.target.value)}
              />
              <button
                onClick={handleToteConfirm}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-white font-semibold rounded-lg"
              >
                Confirm
              </button>
            </div>

            {/* 추천된 박스 */}
            {confirmed && (
              <div className="flex items-center space-x-6 pt-4">
                {boxes.map((box) => (
                  <div
                    key={box.id}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className={`tossface ${box.size === 'S' ? 'text-2xl' : box.size === 'M' ? 'text-3xl' : 'text-4xl'}`}>
                      📦
                    </div>
                    <div className="text-sm text-gray-700">{box.size}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ITEM RFID 입력 */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-800">ITEM RFID</label>
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white font-semibold rounded-lg"
              >
                Search
              </button>
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={itemRfid}
                onChange={(e) => setItemRfid(e.target.value)}
              />
              <button
                onClick={handleItemConfirm}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-white font-semibold rounded-lg"
              >
                Confirm
              </button>
            </div>

            {/* ITEM RFID 확인 시 표시되는 박스들 */}
            {itemConfirmed && (
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="tossface text-3xl">📦</div>
                  <div className="text-sm text-gray-700">M</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="tossface text-2xl">📦</div>
                  <div className="text-sm text-gray-700">S</div>
                </div>
              </div>
            )}

            {/* 포장된 아이템 표시 */}
            <div className="flex flex-wrap gap-2 pt-4">
              {packedItems.map((item, idx) => (
                <div
                  key={`${item.rfid}-${idx}`}
                  className="flex items-center bg-pink-500 text-white rounded-full px-3 py-1 text-sm font-medium"
                >
                  Box {item.boxId}
                </div>
              ))}
            </div>
          </div>

          {/* DONE 버튼 */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl">
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packing;
