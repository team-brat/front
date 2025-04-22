import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBins, deleteBin } from '../../services/binService';

const BinList = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ zone: '', status: '' });

  useEffect(() => {
    const fetchBins = async () => {
      try {
        setLoading(true);
        const data = await getBins(filters);
        setBins(data);
      } catch (err) {
        setError('빈 목록을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [filters.zone, filters.status]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (binId) => {
    if (window.confirm('정말로 이 빈을 삭제하시겠습니까?')) {
      try {
        await deleteBin(binId);
        setBins(bins.filter(bin => bin.bin_id !== binId));
      } catch (err) {
        setError('빈 삭제 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  // 상태별 색상 클래스
  const getStatusClass = (status) => {
    switch (status) {
      case 'EMPTY':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">빈 관리</h1>
        <Link
          to="/bins/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          새 빈 생성
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-[#1d2e24] p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구역
            </label>
            <select
              name="zone"
              value={filters.zone}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">모든 구역</option>
              <option value="A">A 구역</option>
              <option value="B">B 구역</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">모든 상태</option>
              <option value="EMPTY">비어 있음</option>
              <option value="OCCUPIED">사용 중</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 데이터 테이블 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      ) : bins.length === 0 ? (
        <div className="bg-[#1d2e24] p-8 rounded shadow text-center">
          <p className="text-gray-500">빈 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-[#1d2e24] rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  빈 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  위치
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1d2e24] divide-y divide-gray-200">
              {bins.map((bin) => (
                <tr key={bin.bin_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bin.bin_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bin.zone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {`${bin.aisle || '-'}-${bin.rack || '-'}-${bin.level || '-'}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(bin.status)}`}>
                      {bin.status === 'EMPTY' ? '비어 있음' :
                       bin.status === 'OCCUPIED' ? '사용 중' : bin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link
                      to={`/bins/${bin.bin_id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      상세
                    </Link>
                    <Link
                      to={`/bins/${bin.bin_id}/edit`}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(bin.bin_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BinList;