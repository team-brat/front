import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  // 현재 경로와 링크 경로가 일치하는지 확인
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // 활성 링크 스타일
  const activeLinkClass = "bg-blue-700 text-white";
  const normalLinkClass = "text-gray-300 hover:bg-blue-600 hover:text-white";
  
  return (
    <aside className="hidden md:block bg-gray-800 text-white w-64 min-h-screen p-5 shadow-lg">
    <div className="mb-10 border-b border-gray-700 pb-6">
      <h2 className="text-xl font-bold text-blue-400">창고 관리 시스템</h2>
      <p className="text-sm text-gray-400 mt-1">Warehouse Management</p>
    </div>
    
    <nav>
      <div className="mb-2 text-xs uppercase tracking-wider text-gray-500 font-bold">
        관리 메뉴
      </div>
      <ul className="space-y-3 mb-8">
        {/* 내비게이션 아이템 스타일 개선 */}
      </ul>
    </nav>
  </aside>
  );
};

export default Sidebar;