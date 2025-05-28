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

  const initialTabs = [
    { name: 'Receiving', href: '/receiving/create' },
    { name: 'TQ', href: '/tq/inspection-request' },
    { name: 'Binning', href: '/binning' },
    { name: 'Dispatch', href: '/dispatch' },
    { name: 'SKU', href: '/sku' },
  ];

  const filteredTabs = userAuth === 'supplier'
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
  };

  return (
    <header className="w-full bg-gradient-to-b from-white to-[#f8f9fb] px-6 lg:px-10 xl:px-16 py-4 shadow-sm rounded-b-2xl">
      <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-center gap-y-4">
        
        {/* 좌측 고정: 로고 + 인사말 */}
        <div className="flex items-center gap-4 min-w-[300px] h-[64px]">
          <img
            src="/brat-logo.png"
            alt="brat logo"
            className="h-14 md:h-16 cursor-pointer drop-shadow-[0_0_6px_#4a7c59]"
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Hello, {username.charAt(0).toUpperCase() + username.slice(1)}
          </h1>
        </div>

        {/* 우측: 탭 + 로그인 상태 */}
        <div className="flex flex-wrap items-center gap-4 justify-end">
          <nav className="flex gap-5 px-6 h-[48px] items-center rounded-xl shadow border border-gray-200 bg-white/90 backdrop-blur-md">
            {tabsState.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                className={classNames(
                  tab.current
                    ? 'text-[#4a7c59] font-semibold border-b-2 border-[#4a7c59]'
                    : 'text-gray-600 hover:text-[#4a7c59]',
                  'text-base pb-1 transition'
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>

          <div className="bg-[#f1f5f9] px-4 h-[48px] flex items-center rounded-xl shadow border border-[#e2e8f0]">
            <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
              Logged in as <span className="font-semibold">{userAuth} #{workId}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;