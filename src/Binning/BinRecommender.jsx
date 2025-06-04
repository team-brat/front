import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BinRecommender = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const skuData = location.state?.skuData;

  const [recommendedBinInfo, setRecommendedBinInfo] = useState(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);

  // States for confirmation inputs and process
  const [skuBarcode, setSkuBarcode] = useState('');
  const [locBarcode, setLocBarcode] = useState('');
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalTitle, setConfirmModalTitle] = useState('');

  // Updated API_BASE_URL as per instruction [1]
  const API_BASE_URL = 'https://6l0s13fj76.execute-api.us-east-2.amazonaws.com/dev';

  useEffect(() => {
    if (skuData && skuData.sku_id) {
      setSkuBarcode(skuData.serial_or_barcode || ''); // Pre-fill SKU barcode from initial data

      const fetchBinRecommendation = async () => {
        setIsLoadingRecommendation(true);
        setRecommendationError(null);
        setRecommendedBinInfo(null);
        setLocBarcode(''); // Clear previous loc barcode before fetching new one
        try {
          // API call updated as per instruction [1]
          const response = await axios.get(`${API_BASE_URL}/bin-loc/${skuData.sku_id}`);
          setRecommendedBinInfo(response.data);
          if (response.data) {
            // Set locBarcode from API response fields: assigned_loc_id or loc_id
            setLocBarcode(response.data.assigned_loc_id || response.data.loc_id || '');
          }
        } catch (err) {
          console.error("Failed to fetch bin recommendation:", err);
          setRecommendationError(err.response?.data?.message || err.message || 'Failed to fetch bin recommendation');
        } finally {
          setIsLoadingRecommendation(false);
        }
      };
      fetchBinRecommendation();
    } else {
      // If no skuData or sku_id, reset relevant states
      setSkuBarcode('');
      setLocBarcode('');
      setRecommendedBinInfo(null);
      setRecommendationError(null);
    }
  }, [skuData]);

  // Updated displayValue function for consistency and to handle 0 correctly (similar to BinningRequest.jsx)
  const displayValue = (value) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
        if (typeof value === 'boolean') {
            return '-'; // Booleans are represented as '-'
        }
        return value; // Display actual value (including 0)
    }
    return '-';
  };

  const handleConfirmPlacement = async () => {
    // Quantity check removed as it's not part of the new API payload for confirm
    if (!skuBarcode.trim() || !locBarcode.trim()) {
      setConfirmModalTitle('Error');
      setConfirmModalMessage('SKU Barcode and LOC Barcode are required.');
      setShowConfirmModal(true);
      return;
    }

    setIsLoadingConfirm(true);

    try {
      // Payload updated as per instruction [2]
      const payload = {
        serial_or_barcode: skuBarcode,
        loc_id: locBarcode,
      };
      // API call URL is correct as per instruction [2]
      const response = await axios.post(`${API_BASE_URL}/bin-loc/confirm`, payload);
      
      setConfirmModalTitle('Success');
      setConfirmModalMessage(`${response.data.sku_id} has been successfully stored in ${response.data.loc_id}.`);
      setShowConfirmModal(true);
    } catch (err) {
      console.error("Failed to confirm bin placement:", err);
      setConfirmModalTitle('Error');
      setConfirmModalMessage(err.response?.data?.message || err.message || 'Failed to confirm bin placement.');
      setShowConfirmModal(true);
    } finally {
      setIsLoadingConfirm(false);
    }
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSkuBarcode('');
    setLocBarcode('');
    setRecommendedBinInfo(null);
    setRecommendationError(null);
    setConfirmModalMessage('');
    setConfirmModalTitle('');
  };

  // Basic Modal Component
  const Modal = ({ title, message, onClose }) => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative p-8 border w-full max-w-md m-auto flex-col flex bg-white rounded-lg shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
          <h3 className={`text-2xl font-semibold mb-4 ${title === 'Error' ? 'text-red-600' : 'text-green-600'}`}>{title}</h3>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-12 space-y-12 w-full">
      <Modal title={confirmModalTitle} message={confirmModalMessage} onClose={closeModal} />
      {/* Page Title Block */}
      <div className="pb-10 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Bin Recommender</h1>
      </div>

      {/* Selected Request Block - Data source remains skuData, hardcoded LOC remains */}
      <div>
        <div className="text-lg font-semibold mb-4 text-gray-800">Selected Request</div>
        {!skuData ? (
          <div className="text-gray-600 text-center py-4 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            No SKU selected from Binning Requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-base text-gray-800"><span className="font-semibold">LOC:</span> z1-a1-s1-b1</div> {/* This is still hardcoded as per original - assuming it's current location not covered by this API */}
            <div className="text-base text-gray-800"><span className="font-semibold">Supplier Name:</span> {displayValue(skuData.supplier_name)}</div>
            <div className="text-base text-gray-800"><span className="font-semibold">SKU Name:</span> {displayValue(skuData.sku_name)}</div>
            <div className="text-base text-gray-800"><span className="font-semibold">SKU ID:</span> {displayValue(skuData.sku_id)}</div>
            <div className="text-base text-gray-800"><span className="font-semibold">Serial / Barcode:</span> {displayValue(skuData.serial_or_barcode)}</div>
            <div className="text-base text-gray-800"><span className="font-semibold">Quantity:</span> {displayValue(skuData.quantity)}</div>
          </div>
        )}
      </div>

      {/* Bin Recommender Block */}
      {skuData && (
        <div>
          <div className="text-lg font-semibold mb-4 text-gray-800">Bin Recommender</div>
          {isLoadingRecommendation && (
            <div className="text-gray-600 py-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              Loading recommendation...
            </div>
          )}
          {recommendationError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              Error: {recommendationError}
            </div>
          )}
          {!isLoadingRecommendation && !recommendationError && recommendedBinInfo && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-base text-gray-800">
                {/* Display recommended LOC from API response (assigned_loc_id or loc_id) */}
                <span className="font-semibold">Recommended LOC:</span> {displayValue(recommendedBinInfo.assigned_loc_id || recommendedBinInfo.loc_id)}
              </div>
              {/* Display message from API response (previously details) */}
              {recommendedBinInfo.message && (
                 <div className="text-sm text-gray-600 mt-2">
                   <span className="font-semibold">Details:</span> {displayValue(recommendedBinInfo.message)}
                 </div>
              )}
            </div>
          )}
          {!isLoadingRecommendation && !recommendationError && !recommendedBinInfo && skuData.sku_id && (
            <div className="text-gray-500 py-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              No specific bin recommendation available for this SKU.
            </div>
          )}
        </div>
      )}

      {/* Confirm Bin Placement Block */}
      {skuData && (
        <div>
          <div className="text-lg font-semibold mb-4 text-gray-800">Confirm Bin Placement</div>
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Enter SKU Barcode"
              className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 shadow-sm"
              value={skuBarcode}
              onChange={(e) => setSkuBarcode(e.target.value)}
              disabled={isLoadingConfirm}
            />
            <input
              type="text"
              placeholder="Enter LOC Barcode"
              className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 shadow-sm"
              value={locBarcode}
              onChange={(e) => setLocBarcode(e.target.value)}
              disabled={isLoadingConfirm}
            />
            <button
              onClick={handleConfirmPlacement}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition disabled:opacity-50"
              // Updated disabled condition, removed quantity check
              disabled={isLoadingConfirm || !skuBarcode.trim() || !locBarcode.trim()}
            >
              {isLoadingConfirm ? 'Confirming...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinRecommender;
