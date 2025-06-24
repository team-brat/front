import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getScannerData, getPickRocData, updatePickedQty } from '../services/api';

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-500'
        };
      case 'error':
        return {
          icon: '✗',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-500'
        };
      case 'info':
        return {
          icon: 'ℹ',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-500'
        };
      default:
        return {
          icon: '✓',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-500'
        };
    }
  };

  const { icon, bgColor, textColor, buttonColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
              <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${buttonColor} sm:ml-3 sm:w-auto`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Picking = () => {
  const [toteBarcode, setToteBarcode] = useState('');
  const [pickingList, setPickingList] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [currentStage, setCurrentStage] = useState(1);
  const [loadingStates, setLoadingStates] = useState({
    scanBarcode: false,
    confirmTote: false,
    scanItems: false,
    confirmPick: null, // index를 저장
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const printRef = useRef();

  const showModal = (title, message, type = 'success') => {
    setModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'success'
    });
  };

  // Stage 1.2: 바코드 조회 버튼 클릭 (SR160Scans DB에서 최근 스캔 데이터 조회)
  const handleScanBarcode = async () => {
    setLoadingStates(prev => ({ ...prev, scanBarcode: true }));
    try {
      const scannerData = await getScannerData();
      // Scanner API 응답: {"type": "zone_id", "id": "E20047024350602682180111"}
      const scannedBarcode = scannerData.id || '';
      setToteBarcode(scannedBarcode);
      showModal('Barcode Scan Completed', `Barcode: ${scannedBarcode}`, 'success');
    } catch (error) {
      console.error('Barcode scan error:', error);
      showModal('Scan Error', 'Error occurred while scanning barcode.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, scanBarcode: false }));
    }
  };

  // Stage 2.1: Confirm 버튼 클릭 (Pick ROC API 호출)
  const handleConfirmTote = async () => {
    if (!toteBarcode) {
      showModal('Input Required', 'Please scan barcode first.', 'error');
      return;
    }

    setLoadingStates(prev => ({ ...prev, confirmTote: true }));
    try {
      // Hardcoded API call to the specified URL
      const response = await fetch('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/pick-roc/1');
      const pickRocData = await response.json();
      
      // API 응답에서 picking list 생성
      const rocList = pickRocData.roc_list || [];
      const formattedPickingList = rocList.map(item => ({
        loc: item.bin_loc,
        requiredQty: item.allocated_qty,
        pickedQty: 0,
        skuId: item.sku_id,
        skuName: item.sku_name,
        pickingCount: item.picking_count || 0,
        status: 'pending',
      }));

      setPickingList(formattedPickingList);
      setCurrentStage(2);
      showModal('Tote Confirmed', `Tote: ${toteBarcode} confirmed. Starting picking work.`, 'success');
    } catch (error) {
      console.error('Pick ROC API error:', error);
      showModal('Confirmation Error', 'Error occurred while confirming tote.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, confirmTote: false }));
    }
  };

  // Stage 3.2: 아이템 스캔 후 바코드 조회 (SR160Scans DB에서 스캔된 아이템 정보 조회)
  const handleScanItems = async () => {
    setLoadingStates(prev => ({ ...prev, scanItems: true }));
    try {
      const scannerData = await getScannerData();
      console.log('Scanner API Response (SR160Scans DB):', scannerData); // 디버깅용 로그
      
      // 새로운 API 응답 형식: {"type": "zone_id", "id": ["E20047024350602682180111"]}
      // 또는 멀티 스캔: {"type": "zone_id", "id": ["E20047024350602682180111", "E20047024350602682180112"]}
      const scannedItemIds = scannerData.id || [];
      console.log('Extracted Item IDs:', scannedItemIds); // 디버깅용 로그
      
      if (scannedItemIds.length > 0) {
        let processedCount = 0;
        const updatedPickingList = [...pickingList];
        
        // 각 스캔된 아이템 ID에 대해 처리
        scannedItemIds.forEach(scannedItemId => {
          const itemIndex = updatedPickingList.findIndex(item => 
            item.skuId === scannedItemId
          );
          
          if (itemIndex !== -1) {
            updatedPickingList[itemIndex].pickedQty += 1;
            processedCount++;
          }
        });
        
        if (processedCount > 0) {
          setPickingList(updatedPickingList);
          setScannedItems(prev => [...prev, ...scannedItemIds]);
          showModal('Item Scan Completed', `${processedCount} items scanned: ${scannedItemIds.join(', ')}`, 'success');
        } else {
          showModal('Item Not Found', `Scanned items ${scannedItemIds.join(', ')} are not in the picking list.`, 'error');
        }
      } else {
        showModal('No Data', 'No scanned item information found in SR160Scans DB.', 'error');
      }
    } catch (error) {
      console.error('Item scan query error:', error);
      showModal('Scan Error', 'Error occurred while scanning items.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, scanItems: false }));
    }
  };

  // Stage 3.3: 확인 버튼 클릭 (Picked Qty API 호출)
  const handleConfirmPick = async (index) => {
    const item = pickingList[index];
    
    if (item.pickedQty === 0) {
      showModal('No Items Scanned', 'Please scan items first.', 'error');
      return;
    }

    setLoadingStates(prev => ({ ...prev, confirmPick: index }));
    try {
      const result = await updatePickedQty(item.skuId, item.pickedQty);
      
      if (result === true) {
        showModal('Picking Completed', `${item.skuName} (${item.pickedQty} pcs) picking completed!`, 'success');
        // 성공적으로 처리된 아이템은 상태 업데이트
        setPickingList(prev => 
          prev.map((pItem, pIndex) => 
            pIndex === index 
              ? { ...pItem, status: 'completed' }
              : pItem
          )
        );
      } else {
        showModal('Confirmation Error', 'Error occurred while confirming picking.', 'error');
      }
    } catch (error) {
      console.error('Picked Qty API error:', error);
      showModal('API Error', 'Error occurred while confirming picking.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, confirmPick: null }));
    }
  };

  const handlePrintPickSlip = async () => {
    if (printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `pick-slip-${toteBarcode || 'tote'}.png`;
        link.href = pngUrl;
        link.click();
        showModal('Print Success', 'Pick slip has been downloaded successfully.', 'success');
      } catch (error) {
        console.error('Print error:', error);
        showModal('Print Error', 'Error occurred while printing.', 'error');
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
        {/* Stage 1: Tote 바코드 조회 */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-green-700">TOTE 1</h2>
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">TOTE Barcode</label>
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded-md"
              value={toteBarcode}
              onChange={(e) => setToteBarcode(e.target.value)}
              placeholder="Scanned barcode will appear here"
              readOnly
            />
            <button
              onClick={handleScanBarcode}
              disabled={loadingStates.scanBarcode}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
            >
              {loadingStates.scanBarcode ? 'Scanning...' : 'Scan Barcode'}
            </button>
            <button
              onClick={handleConfirmTote}
              disabled={loadingStates.confirmTote || !toteBarcode}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
            >
              {loadingStates.confirmTote ? 'Confirming...' : 'Confirm'}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            * Scan tote barcode in the app, then click "Scan Barcode" button.
          </div>
        </div>

        {/* Stage 2 & 3: Picking List */}
        {pickingList.length > 0 && (
          <div className="space-y-6">
            {/* 아이템 스캔 조회 버튼 */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Item Scanning</h3>
                  <p className="text-sm text-green-600">Scan items in the app, then click the button below to query scanned items.</p>
                </div>
                <button
                  onClick={handleScanItems}
                  disabled={loadingStates.scanItems}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  {loadingStates.scanItems ? 'Scanning...' : 'Scan Items'}
                </button>
              </div>
            </div>

            {pickingList.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border space-y-4 ${
                  item.status === 'completed' 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between space-x-6">
                  <div className="text-gray-800">
                    <div className="mb-2 font-medium">
                      <strong>LOC:</strong>{' '}
                      <span className="bg-yellow-200 px-2 py-1 rounded">{item.loc}</span>
                    </div>
                    <div className="mb-1">
                      <strong>SKU:</strong>{' '}
                      <span className="bg-green-100 px-2 py-1 rounded">{item.skuName} ({item.skuId})</span>
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

                {item.status !== 'completed' && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-600">
                      {item.pickedQty > 0 ? `${item.pickedQty} items scanned` : 'Not scanned yet'}
                    </div>
                    <button
                      onClick={() => handleConfirmPick(index)}
                      disabled={loadingStates.confirmPick === index || item.pickedQty === 0}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
                    >
                      {loadingStates.confirmPick === index ? 'Confirming...' : 'Confirm'}
                    </button>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="text-green-600 font-semibold">
                    ✓ Picking Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 스캔된 아이템 목록 */}
        {scannedItems.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Scanned Items ({scannedItems.length})</h3>
            <div className="flex flex-wrap gap-2">
              {scannedItems.map((item, index) => (
                <span key={index} className="bg-green-200 px-2 py-1 rounded text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button 
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-md"
            onClick={() => showModal('Work Completed', 'Picking work completed.', 'success')}
          >
            DONE
          </button>
        </div>
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Picking;
