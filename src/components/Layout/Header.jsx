import React, { useState, useContext } from 'react';
import { UserAuthContext } from '../../App';
import { useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, userAuth, workId } = useContext(UserAuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const initialTabs = [
    { name: 'Receiving', href: '/receiving/create' },
    { name: 'TQ', href: '/tq/inspection-request' },
    { name: 'Binning', href: '/binning' },
    { name: 'Dispatch', href: '/dispatch' },
    { name: 'SKU', href: '/sku' },
  ];

  const filteredTabs =
    userAuth === 'supplier'
      ? initialTabs.filter((tab) => tab.name !== 'Dashboard')
      : initialTabs;

  const [tabsState, setTabsState] = useState(() =>
    filteredTabs.map((tab) => ({
      ...tab,
      current: location.pathname.startsWith(tab.href),
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

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-8 py-10 bg-gradient-to-b from-white to-[#f8f9fb] shadow-sm rounded-b-2xl mb-10">
      {/* 좌측 사용자 정보 */}
      <div className="flex items-center gap-5">
        <img
          src="/brat-logo.png"
          alt="brat logo"
          className="h-28 mt-2.5 ml-1 drop-shadow-[0_0_6px_#4a7c59] cursor-pointer"
          onClick={() => navigate('/')}
        />
        <div>
          <h1 className="text-[36px] leading-[1.2] font-bold tracking-tight text-gray-900">
            Hello, {username.charAt(0).toUpperCase() + username.slice(1)}
          </h1>
        </div>
      </div>

      {/* 우측 탭 메뉴 */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center gap-6">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow border border-gray-200 flex flex-wrap gap-6 items-center">
          {tabsState.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={classNames(
                tab.current
                  ? 'text-[#4a7c59] font-semibold border-b-2 border-[#4a7c59]'
                  : 'text-gray-600 hover:text-[#4a7c59]',
                'text-lg px-1 pb-1 transition duration-150 ease-in-out'
              )}
            >
              {tab.name}
            </button>
          ))}
          {/* 사용자 역할 및 ID 표시 */}
          <div className="flex items-center bg-[#f1f5f9] px-4 py-3 rounded-xl shadow border border-[#e2e8f0]">
            <p className="text-lg text-gray-700 font-medium">
              Logged in as <span className="font-semibold">{userAuth} #{workId}</span> 
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
