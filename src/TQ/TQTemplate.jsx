import React from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import { Outlet } from 'react-router-dom';

const TQTemplate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#152b22] to-[#1f3d2d] px-6 py-8 text-white font-sans">
      
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Sidebar />
        <div className="col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TQTemplate;
