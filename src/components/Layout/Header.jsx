import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const initialTabs = [
    { name: 'Dashboard', href: '/warehouse' },
    { name: 'Receiving', href: '/receiving/create' },
    { name: 'TQ', href: '/tq/inspection-request' },
    { name: 'Binning', href: '/binning' },
    { name: 'Dispatch', href: '/dispatch' },
    { name: 'SKU', href: '/sku' },
  ];

  const [tabsState, setTabsState] = React.useState(() =>
    initialTabs.map((tab) => ({
      ...tab,
      current: location.pathname === tab.href,
    }))
  );

  const handleTabClick = (tabName) => {
    const selected = tabsState.find((tab) => tab.name === tabName);
    if (!selected) return;

    setTabsState((prev) =>
      prev.map((tab) => ({
        ...tab,
        current: tab.name === tabName,
      }))
    );

    navigate(selected.href);
    setIsOpen(false);
  };

  const currentTab = tabsState.find(tab => tab.current);

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <img src="/brat-logo.png" alt="brat logo" className="h-10 drop-shadow-[0_0_8px_#a3e635]" />
        <h1 className=" text-3xl font-bold tracking-tight">Hello, Vijay</h1>
      </div>

      {/* Tabs Section */}
      <div className="w-full lg:w-auto">
        {/* Mobile Current Tab */}
        <div className="sm:hidden relative">
          <div className="bg-[#23352b] p-1 rounded-full shadow-inner border border-lime-500/20">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-lime-300 text-gray-900 shadow-lg rounded-full px-8 py-2.5 text-sm font-semibold"
            >
              {currentTab?.name}
              <ChevronDownIcon 
                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#23352b] rounded-xl overflow-hidden z-50 shadow-lg border border-lime-500/20">
              {tabsState.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  className={classNames(
                    tab.current
                      ? 'bg-lime-300 text-gray-900'
                      : 'text-lime-100 hover:bg-lime-400/20 hover:text-lime-300',
                    'w-full text-left px-6 py-3 text-sm font-semibold transition-all duration-200 ease-in-out'
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex gap-2 bg-[#23352b] p-1 rounded-full shadow-inner border border-lime-500/20">
          {tabsState.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={classNames(
                tab.current
                  ? 'bg-lime-300 text-gray-900 shadow-lg'
                  : 'text-lime-100 hover:bg-lime-400/20 hover:text-lime-300',
                'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ease-in-out'
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
