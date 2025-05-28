import React, { useContext } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import { Outlet } from 'react-router-dom';
import { UserAuthContext } from '../App'; // Import the context

const TQTemplate = () => {
  const { userAuth } = useContext(UserAuthContext); // Use the context to get the username and userAuth
  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Sidebar
          header="TQ"
          tabs={[
            { name: 'Inspection Request', href: '/tq/inspection-request' },
            { name: 'Inspection', href: '/tq/inspection' },
            { name: 'RFID Scan', href: '/tq/rfid-scan' },
            { name: 'GRN', href: '/tq/grn' },
          ]} />
        <div className="col-span-4 bg-white shadow-md rounded-xl p-10 mr-7">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TQTemplate;
