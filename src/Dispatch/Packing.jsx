import React, { useState } from 'react';
import { getScannerData, getBoxesByToteId, getPickBox, checkPickingDone, postPickDone } from '../services/api';
import ModalSuccess from '../components/Modals/Modal-Success';

const Packing = () => {
  const [toteRfid, setToteRfid] = useState('');
  const [itemRfid, setItemRfid] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [packedItems, setPackedItems] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [itemConfirmed, setItemConfirmed] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    toteSearch: false,
    toteConfirm: false,
    itemSearch: false,
    itemConfirm: false,
    done: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Tote RFID Search 버튼 클릭
  const handleToteSearch = async () => {
    setLoadingStates(prev => ({ ...prev, toteSearch: true }));
    try {
      const scannerData = await getScannerData();
      if (scannerData && scannerData.id && scannerData.id.length > 0) {
        // 가장 최근 스캔된 RFID 사용 (배열의 첫 번째 요소)
        setToteRfid(scannerData.id[0]);
      } else {
        alert('No RFID data found from scanner');
      }
    } catch (error) {
      console.error('Scanner API 오류:', error);
      alert('Failed to get scanner data');
    } finally {
      setLoadingStates(prev => ({ ...prev, toteSearch: false }));
    }
  };

  // Tote Confirm 버튼 클릭
  const handleToteConfirm = async () => {
    if (!toteRfid.trim()) {
      alert('Please enter or search for Tote RFID first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, toteConfirm: true }));
    try {
      // 항상 tote_id를 1로 설정
      const boxData = await getBoxesByToteId(1);
      if (boxData && boxData.box_list) {
        const boxObjects = boxData.box_list.map((size, index) => ({
          id: index + 1,
          size: size
        }));
        setBoxes(boxObjects);
        setConfirmed(true);
      } else {
        alert('No box data found for this tote');
      }
    } catch (error) {
      console.error('Box API 오류:', error);
      alert('Failed to get box data');
    } finally {
      setLoadingStates(prev => ({ ...prev, toteConfirm: false }));
    }
  };

  // Item RFID Search 버튼 클릭
  const handleItemSearch = async () => {
    setLoadingStates(prev => ({ ...prev, itemSearch: true }));
    try {
      const scannerData = await getScannerData();
      if (scannerData && scannerData.id && scannerData.id.length > 0) {
        // 가장 최근 스캔된 RFID 사용 (배열의 첫 번째 요소)
        setItemRfid(scannerData.id[0]);
      } else {
        alert('No RFID data found from scanner');
      }
    } catch (error) {
      console.error('Scanner API 오류:', error);
      alert('Failed to get scanner data');
    } finally {
      setLoadingStates(prev => ({ ...prev, itemSearch: false }));
    }
  };

  // Item Confirm 버튼 클릭
  const handleItemConfirm = async () => {
    if (!itemRfid.trim()) {
      alert('Please enter or search for Item RFID first');
      return;
    }

    if (!toteRfid.trim()) {
      alert('Please confirm Tote RFID first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, itemConfirm: true }));
    try {
      // 항상 tote_id를 1로 설정
      const pickBoxData = await getPickBox(itemRfid, 1);
      if (pickBoxData && pickBoxData.box_id) {
        setPackedItems([{ rfid: itemRfid, boxId: pickBoxData.box_id }]);
        setItemRfid('');
        setItemConfirmed(true);
      } else if (pickBoxData.error) {
        alert(pickBoxData.error);
      } else {
        alert('Failed to get box assignment for this item');
      }
    } catch (error) {
      console.error('Pick Box API 오류:', error);
      alert('Failed to get box assignment');
    } finally {
      setLoadingStates(prev => ({ ...prev, itemConfirm: false }));
    }
  };

  // Done 버튼 클릭
  const handleDone = async () => {
    if (!toteRfid.trim()) {
      alert('Please confirm Tote RFID first');
      return;
    }

    // packedItems에 값이 없으면 동작하지 않음
    if (!packedItems.length) {
      alert('Please confirm an item first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, done: true }));
    try {
      // packedItems의 첫 번째 값 사용 (항상 1개만 있음)
      const { rfid: itemRfid, boxId } = packedItems[0];
      console.log('postPickDone query:', { item_rfid: itemRfid, tote_id: 1, box_id: boxId });
      const doneData = await postPickDone(itemRfid, 1, boxId);
      if (doneData) {
        if (doneData.box_id_match && !doneData.all_picking_complete) {
          setSuccessMessage('Box matched, but picking is not complete yet.');
          setShowSuccessModal(true);
        } else if (doneData.box_id_match && doneData.all_picking_complete) {
          setSuccessMessage('Picking is complete!');
          setShowSuccessModal(true);
          // Reset the form
          setToteRfid('');
          setItemRfid('');
          setBoxes([]);
          setPackedItems([]);
          setConfirmed(false);
          setItemConfirmed(false);
        } else if (!doneData.box_id_match) {
          setSuccessMessage('Box does not match. Please try again.');
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      console.error('Pick Done API 오류:', error);
      alert('Failed to check picking status');
    } finally {
      setLoadingStates(prev => ({ ...prev, done: false }));
    }
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
              <button
                onClick={handleToteSearch}
                disabled={loadingStates.toteSearch}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 disabled:bg-gray-300 text-white font-semibold rounded-lg min-w-[120px]"
              >
                {loadingStates.toteSearch ? 'Searching' : 'Search'}
              </button>
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={toteRfid}
                onChange={(e) => setToteRfid(e.target.value)}
                placeholder="Enter or search Tote RFID"
              />
              <button
                onClick={handleToteConfirm}
                disabled={loadingStates.toteConfirm || !toteRfid.trim()}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 disabled:bg-gray-300 text-white font-semibold rounded-lg min-w-[120px]"
              >
                {loadingStates.toteConfirm ? 'Confirming' : 'Confirm'}
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
                    <div className={`${box.size === 'S' ? 'text-2xl' : box.size === 'M' ? 'text-3xl' : 'text-4xl'}`}>
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
                onClick={handleItemSearch}
                disabled={loadingStates.itemSearch}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 disabled:bg-gray-300 text-white font-semibold rounded-lg min-w-[120px]"
              >
                {loadingStates.itemSearch ? 'Searching' : 'Search'}
              </button>
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={itemRfid}
                onChange={(e) => setItemRfid(e.target.value)}
                placeholder="Enter or search Item RFID"
              />
              <button
                onClick={handleItemConfirm}
                disabled={loadingStates.itemConfirm || !itemRfid.trim() || !toteRfid.trim()}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 disabled:bg-gray-300 text-white font-semibold rounded-lg min-w-[120px]"
              >
                {loadingStates.itemConfirm ? 'Confirming' : 'Confirm'}
              </button>
            </div>

            {/* ITEM RFID 확인 시 표시되는 박스들 */}
            {/* {itemConfirmed && (
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-3xl">📦</div>
                  <div className="text-sm text-gray-700">M</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl">📦</div>
                  <div className="text-sm text-gray-700">S</div>
                </div>
              </div>
            )} */}

            {/* 포장된 아이템 표시 - 실제 박스만 박스 아이콘으로 보여주기 */}
            <div className="flex flex-wrap gap-6 pt-4">
              {packedItems.map((item, idx) => (
                <div
                  key={`${item.rfid}-${idx}`}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className={
                    item.boxId === 'S' ? 'text-2xl' : item.boxId === 'M' ? 'text-3xl' : 'text-4xl'
                  }>
                    📦
                  </div>
                  <div className="text-sm text-gray-700">{item.boxId}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DONE 버튼 */}
          <div className="flex justify-end">
            <button 
              onClick={handleDone}
              disabled={loadingStates.done || !toteRfid.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-300 text-white font-bold rounded-xl min-w-[140px]"
            >
              {loadingStates.done ? 'Processing...' : 'DONE'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ModalSuccess
        message={successMessage}
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default Packing;
