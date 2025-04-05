import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const tabs = [
    { name: 'Create Receiving', href: '/receiving/create' },
    { name: 'Receiving Records', href: '/receiving/records' },
    { name: 'Documents', href: '/receiving/documents' },
  ];

  return (
    <div className="col-span-1 space-y-4">
      {tabs.map((tab) => (
        <NavLink
          key={tab.href}
          to={tab.href}
          className={({ isActive }) =>
            `w-full block py-2 px-4 text-left rounded-xl text-white font-medium transition
            ${isActive ? 'bg-[#23352b]' : 'bg-[#1d2e24] hover:bg-[#23352b]'}`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
