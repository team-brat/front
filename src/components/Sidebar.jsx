import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { name: 'Create Receiving', href: '/receiving/create' },
    { name: 'Receiving Records', href: '/receiving/records' },
    { name: 'Supplier Details', href: '/receiving/supplier' },
    { name: 'Doc Verification', href: '/receiving/documents' },
    { name: 'Receiving Status', href: '/receiving/status' },
  ];

  const currentTab = tabs.find(tab => tab.href === location.pathname);

  return (
    <div className="w-full lg:w-60 relative">
      {/* Mobile View (Dropdown) */}
      <div className="block lg:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 px-4 bg-[#23352b] text-white font-medium rounded-xl"
        >
          <span>{currentTab?.name || 'Select Tab'}</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1d2e24] rounded-xl shadow-xl border border-lime-500/20">
            {tabs.map((tab) => (
              <NavLink
                key={tab.href}
                to={tab.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block w-full py-2 px-4 text-left font-medium text-white transition
                  ${isActive ? 'bg-[#23352b]' : 'hover:bg-[#23352b]'}`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View (Sidebar) */}
      <div className="hidden lg:block space-y-2 mt-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.href}
            to={tab.href}
            className={({ isActive }) =>
              `block w-full py-2 px-4 text-left font-medium rounded-xl text-white transition
              ${isActive ? 'bg-[#23352b]' : 'bg-[#1d2e24] hover:bg-[#23352b]'}`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
