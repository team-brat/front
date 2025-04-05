import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTabs = [
    { name: 'Dashboard', href: '/warehouse' },
    { name: 'Receiving', href: '/receiving/create' },
    { name: 'TQ', href: '/tq' },
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
  };

  const handleDropdownChange = (e) => {
    const selectedTab = tabsState.find((tab) => tab.name === e.target.value);
    if (selectedTab) handleTabClick(selectedTab.name);
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <img src="/brat-logo.png" alt="brat logo" className="h-10 drop-shadow-[0_0_8px_#a3e635]" />
        <h1 className=" text-3xl font-bold tracking-tight">Hello, Vijay</h1>
      </div>

      {/* Tabs Section */}
      <div className="w-full lg:w-auto">
        {/* Mobile Dropdown */}
        <div className="grid grid-cols-1 sm:hidden relative">
          <select
            value={tabsState.find((tab) => tab.current)?.name}
            onChange={handleDropdownChange}
            aria-label="Select a tab"
            className="w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-lime-600"
          >
            {tabsState.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none -ml-8 self-center justify-self-end fill-gray-500"
          />
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
