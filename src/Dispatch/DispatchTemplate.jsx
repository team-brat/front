import React, { useContext } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import { Outlet } from 'react-router-dom';
import { UserAuthContext } from '../App';

const DispatchTemplate = () => {
  const { userAuth } = useContext(UserAuthContext);
  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Sidebar
          header="Dispatch"
          tabs={[
            { name: 'Dispatch Requests', href: '/dispatch/requests' },
            { name: 'Picking', href: '/dispatch/picking' },
            { name: 'Packing', href: '/dispatch/packing' },
            { name: 'Track Delivery', href: '/dispatch/track' },
          ]} />
        <div className="col-span-4 bg-white shadow-md rounded-xl p-10 mr-7 mb-20 mt-5">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DispatchTemplate; 