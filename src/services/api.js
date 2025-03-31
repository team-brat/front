const API_BASE_URL = 'https://vxl6odjqg7.execute-api.us-east-2.amazonaws.com/dev';

/**
 * 기본 API 호출 함수
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // API 응답 형식이 { statusCode, body } 형태일 경우 처리
      if (data.body && typeof data.body === 'string') {
        try {
          return JSON.parse(data.body);
        } catch (e) {
          return data;
        }
      }
      
      return data;
    }
    
    return response.text();
  } catch (error) {
    console.error('API 호출 중 오류:', error);
    throw error;
  }
};