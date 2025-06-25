const API_BASE_URL = 'https://vxl6odjqg7.execute-api.us-east-2.amazonaws.com/dev';
const PICKING_API_BASE_URL = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev';

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

/**
 * Picking 관련 API 함수들
 */

// Scanner API 호출 (바코드 조회)
export const getScannerData = async () => {
  const url = `${PICKING_API_BASE_URL}/scanner/latest`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Scanner API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Scanner API 호출 중 오류:', error);
    throw error;
  }
};

// Pick ROC API 호출
export const getPickRocData = async (toteId) => {
  const url = `${PICKING_API_BASE_URL}/pick-roc/${toteId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Pick ROC API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Pick ROC API 호출 중 오류:', error);
    throw error;
  }
};

// Picked Qty API 호출
export const updatePickedQty = async (skuId, pickedQty) => {
  const url = `${PICKING_API_BASE_URL}/picked-qty`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sku_id: skuId,
        picked_qty: pickedQty,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Picked Qty API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Picked Qty API 호출 중 오류:', error);
    throw error;
  }
};

/**
 * Packing 관련 API 함수들
 */

// Box API 호출 (tote_id로 박스 리스트 조회)
export const getBoxesByToteId = async (toteId) => {
  const url = `${PICKING_API_BASE_URL}/boxes/${toteId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Box API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Box API 호출 중 오류:', error);
    throw error;
  }
};

// Pick Box API 호출 (item_rfid와 tote_id로 박스 할당)
export const getPickBox = async (itemRfid, toteId) => {
  const url = `${PICKING_API_BASE_URL}/pick-box`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_rfid: itemRfid,
        tote_id: toteId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Pick Box API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Pick Box API 호출 중 오류:', error);
    throw error;
  }
};

// Done API 호출 (picking 완료 여부 확인)
export const checkPickingDone = async (toteId) => {
  const url = `${PICKING_API_BASE_URL}/picking-done/${toteId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Picking Done API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Picking Done API 호출 중 오류:', error);
    throw error;
  }
};

// Pick Done API 호출 (item_rfid, tote_id, box_id로 box 매칭 및 picking 완료 여부 확인)
export const postPickDone = async (itemRfid, toteId, boxId) => {
  const url = `${PICKING_API_BASE_URL}/pick-done`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_rfid: itemRfid,
        tote_id: toteId,
        box_id: boxId,
      }),
    });
    if (!response.ok) {
      throw new Error(`Pick Done API 오류: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Pick Done API 호출 중 오류:', error);
    throw error;
  }
};