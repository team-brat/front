import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto"> {/* 이 부분이 중요: 최대 너비 설정 및 가운데 정렬 */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;