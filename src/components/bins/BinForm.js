import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBin, createBin, updateBin } from '../../services/binService';

const BinForm = () => {
  const { binId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!binId;

  const [formData, setFormData] = useState({
    zone: '',
    aisle: '',
    rack: '',
    level: '',
    status: 'EMPTY',
    product_id: '',
    quantity: 0,
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchBinData = async () => {
        try {
          setLoading(true);
          const data = await getBin(binId);
          setFormData({
            zone: data.zone || '',
            aisle: data.aisle || '',
            rack: data.rack || '',
            level: data.level || '',
            status: data.status || 'EMPTY',
            product_id: data.product_id || '',
            quantity: data.quantity || 0,
          });
        } catch (err) {
          setError('빈 정보를 불러오는 중 오류가 발생했습니다.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchBinData();
    }
  }, [binId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 상태에 따른 제품 정보 유효성 검사
      if (formData.status === 'OCCUPIED' && (!formData.product_id || formData.quantity <= 0)) {
        setError('사용 중 상태에는 제품 ID와 수량이 필요합니다.');
        setLoading(false);
        return;
      }
      
      if (isEditMode) {
        await updateBin(binId, formData);
      } else {
        await createBin(formData);
      }
      
      navigate('/bins');
    } catch (err) {
      setError(`빈 ${isEditMode ? '수정' : '생성'} 중 오류가 발생했습니다.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? '빈 수정' : '새 빈 생성'}</h1>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#1d2e24] p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 구역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                구역 *
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* 선반 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                선반 *
              </label>
              <input
                type="text"
                name="aisle"
                value={formData.aisle}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* 랙 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                랙 *
              </label>
              <input
                type="text"
                name="rack"
                value={formData.rack}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* 레벨 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                레벨 *
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태 *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="EMPTY">비어 있음</option>
                <option value="OCCUPIED">사용 중</option>
              </select>
            </div>

            {/* 제품 ID (사용 중 상태인 경우만) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제품 ID {formData.status === 'OCCUPIED' && '*'}
              </label>
              <input
                type="text"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required={formData.status === 'OCCUPIED'}
                disabled={formData.status === 'EMPTY'}
              />
            </div>

            {/* 수량 (사용 중 상태인 경우만) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 {formData.status === 'OCCUPIED' && '*'}
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="0"
                required={formData.status === 'OCCUPIED'}
                disabled={formData.status === 'EMPTY'}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/bins')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 mr-4 px-4 py-2 rounded"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? '처리 중...' : isEditMode ? '빈 업데이트' : '빈 생성'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BinForm;