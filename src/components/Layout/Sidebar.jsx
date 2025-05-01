import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { UserAuthContext } from '../../App'; // Import the context

const Sidebar = ({tabs}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentTab = tabs.find(tab => tab.href === location.pathname);
  const { userAuth } = useContext(UserAuthContext);

  // Filter out "Doc Verification" tab if username is "supplier"
  const filteredTabs = userAuth === "supplier" ? tabs.filter(tab => tab.name !== "Doc Verification") : tabs;

  return (
    <div className="w-full xl1280:w-60 relative">

      {/* Mobile View (Dropdown) */}
      <div className="block xl1280:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 px-4 bg-[#23352b] text-white font-medium rounded-xl"
        >
          <span>{currentTab?.name || 'Select Tab'}</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1d2e24] rounded-xl shadow-xl border border-lime-500/20">
            {filteredTabs.map((tab) => (
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
      <div className="hidden xl1280:block space-y-2 mt-4">

        {filteredTabs.map((tab) => (
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
