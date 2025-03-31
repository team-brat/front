import { fetchApi } from './api';

/**
 * 모든 빈 목록 조회
 */
export const getBins = async (params = {}) => {
  // 쿼리 문자열 생성
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetchApi(`/bins${queryString}`, { method: 'GET' });
  return response.bins || [];
};

/**
 * 특정 빈 조회
 */
export const getBin = async (binId) => {
  const response = await fetchApi(`/bins/${binId}`, { method: 'GET' });
  return response;
};

/**
 * 새 빈 생성
 */
export const createBin = async (binData) => {
  const response = await fetchApi('/bins', {
    method: 'POST',
    body: JSON.stringify(binData),
  });
  return response.bin || response;
};

/**
 * 빈 정보 업데이트
 */
export const updateBin = async (binId, binData) => {
  const response = await fetchApi(`/bins/${binId}`, {
    method: 'PUT',
    body: JSON.stringify(binData),
  });
  return response.bin || response;
};

/**
 * 빈 삭제
 */
export const deleteBin = async (binId) => {
  const response = await fetchApi(`/bins/${binId}`, { method: 'DELETE' });
  return response;
};