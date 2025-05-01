import React, { useContext } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import { Outlet } from 'react-router-dom';
import { UserAuthContext } from '../App'; // Import the context

const ReceivingTemplate = () => {
  const { userAuth } = useContext(UserAuthContext); // Use the context to get the username and userAuth
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#152b22] to-[#1f3d2d] px-6 py-8 text-white font-sans">
      
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Sidebar tabs={[
          { name: 'Create Receiving', href: '/receiving/create' },
          { name: 'Receiving Records', href: '/receiving/records' },
          { name: 'Supplier Details', href: '/receiving/supplier' },
          { name: 'Doc Verification', href: '/receiving/documents' },
          { name: 'Receiving Status', href: '/receiving/status' },
        ]} />
        <div className="col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ReceivingTemplate;
