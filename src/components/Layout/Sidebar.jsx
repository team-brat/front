import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { UserAuthContext } from '../../App';

const Sidebar = ({ tabs, header }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentTab = tabs.find(tab => tab.href === location.pathname);
  const { userAuth, workId } = useContext(UserAuthContext);

  const filteredTabs = userAuth === "supplier"
    ? tabs.filter(tab => tab.name !== "Doc Verification")
    : tabs;

  const modifiedTabs = filteredTabs.map(tab => {
    if (userAuth === "supplier") {
      if (tab.name === "Supplier Details") return { ...tab, name: "My Supplier Detail" };
      if (tab.name === "Receiving Status") return { ...tab, name: "My Receiving Status" };
      if (tab.name === "Receiving Records") return { ...tab, name: "My Receiving Records" };
    }
    return tab;
  });

  return (
    <aside className="w-full xl1280:w-64 px-4 py-6">

      {/* Header */}
      {header && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#1f2937]">{header}</h2>
          <div className="h-1 w-16 bg-[#00695c] mx-auto mt-2 rounded-full"></div>
        </div>
      )}

      {/* Mobile Dropdown */}
      <div className="block xl1280:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-3 px-4 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 shadow-sm"
        >
          <span>{currentTab?.name || 'Select Tab'}</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200">
            {modifiedTabs.map(tab => (
              <NavLink
                key={tab.href}
                to={tab.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block py-3 px-4 text-md text-left transition rounded-md 
                   ${isActive
                     ? 'bg-[#e0f2f1] text-[#4a7c59] font-semibold'
                     : 'hover:bg-gray-100 text-gray-800'}`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden xl1280:flex flex-col gap-3 mt-8">
        {modifiedTabs.map(tab => (
          <NavLink
            key={tab.href}
            to={tab.href}
            className={({ isActive }) =>
              `py-3 px-5 text-md font-medium rounded-xl transition text-left tracking-tight
              ${isActive
                ? 'bg-[#e0f2f1] text-[#4a7c59] font-semibold shadow-md border border-[#b2dfdb]'
                : 'bg-[#f8fafc] text-gray-600 hover:bg-[#f1f5f9] hover:text-[#4a7c59]'}`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
