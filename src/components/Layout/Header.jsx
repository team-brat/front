import React, { useState, useContext, useMemo, useEffect } from 'react';
import { UserAuthContext } from '../../App';
import { useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, userAuth, workId } = useContext(UserAuthContext);

  // Memoize the base list of tabs (without 'current' state) based on userAuth.
  // This ensures the list of tabs is stable unless userAuth changes.
  const baseTabs = useMemo(() => {
    const operatorTabs = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Receiving', href: '/receiving/create' },
      { name: 'TQ', href: '/tq/inspection-records' },
      { name: 'Binning', href: '/binning/request' },
      { name: 'Dispatch', href: '/dispatch/requests' },
      { name: 'SKU', href: '/sku' },
    ];
    const nonOperatorTabs = [
      { name: 'Receiving', href: '/receiving/create' },
      { name: 'TQ', href: '/tq/inspection-records' },
      { name: 'Binning', href: '/binning/request' },
      { name: 'Dispatch', href: '/dispatch/requests' },
      { name: 'SKU', href: '/sku' },
    ];

    let currentTabs = userAuth === 'operator' ? operatorTabs : nonOperatorTabs;

    if (userAuth === 'supplier') {
      // If user is a supplier, filter out 'Dashboard' from their tab list.
      // This assumes nonOperatorTabs might include 'Dashboard', or handles it defensively.
      // Based on the provided nonOperatorTabs, 'Dashboard' is already excluded.
      currentTabs = currentTabs.filter((tab) => tab.name !== 'Dashboard');
    }
    
    return currentTabs;
  }, [userAuth]);

  // State for tabs, including their 'current' status.
  // Initialized based on baseTabs and the current location.
  const [tabsState, setTabsState] = useState(() =>
    baseTabs.map((tab) => ({
      ...tab,
      current: location.pathname.startsWith(tab.href),
    }))
  );

  // Effect to update tabsState when baseTabs (due to userAuth change) or location.pathname changes.
  // This ensures tabsState is always correctly reflecting the available tabs and the active route.
  useEffect(() => {
    setTabsState(
      baseTabs.map((tab) => ({
        ...tab,
        current: location.pathname.startsWith(tab.href),
      }))
    );
  }, [baseTabs, location.pathname]);


  const handleTabClick = (tabName) => {
    const selectedTab = tabsState.find((tab) => tab.name === tabName);
    if (!selectedTab) return;

    // Optimistically update the UI for tab selection for better perceived responsiveness.
    // The useEffect above will then re-evaluate and confirm this state once navigation completes.
    setTabsState((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        current: tab.name === tabName,
      }))
    );
    navigate(selectedTab.href); // Perform navigation
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
    navigate('/login');
  };

  return (
    <header className="w-full bg-gradient-to-b from-white to-[#f8f9fb] px-6 lg:px-10 xl:px-16 py-8 shadow-sm rounded-b-2xl">
      {/* 
        Main layout container for header elements.
        Default (<lg, approx <992px): Stacks Logo/Hello and RightContent vertically, aligns items to start.
        lg+ (approx >=992px): Logo/Hello and RightContent in a row, space-between, items centered vertically.
        xl+ (approx >=1324px): Behaves like lg for this container's direct children.
      */}
      <div className="max-w-screen-2xl mx-auto flex flex-col items-start gap-y-6 lg:flex-row lg:flex-wrap lg:justify-between lg:items-center">
        
        {/* 좌측 고정: 로고 + 인사말 */}
        <div className="flex items-center gap-4 min-w-[300px] h-[80px]">
          <img
            src="/brat-logo.png"
            alt="brat logo"
            className="h-16 md:h-20 cursor-pointer drop-shadow-[0_0_6px_#4a7c59]"
            onClick={() => navigate('/')}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Hello, {username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User'}
          </h1>
        </div>

        {/* 
          Right content block (Navigator + Login Status).
          Default (<lg, approx <992px): Full width, Nav and LoginInfo stacked vertically, items aligned left.
          lg (approx 992px - 1323px): Auto width, Nav and LoginInfo in a row, items centered vertically, Nav left & LoginInfo right (justify-between).
          xl (approx >=1324px): Auto width, Nav and LoginInfo in a row, items centered vertically, both grouped to the right (justify-end).
        */}
        <div className="w-full flex flex-col items-start gap-4 
                        lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-between 
                        xl:justify-end">
          {/* Added overflow-x-auto for cases where tabs might exceed available width */}
          <nav className="flex gap-x-6 px-8 h-[56px] items-center rounded-xl shadow border border-gray-200 bg-white/90 backdrop-blur-md overflow-x-auto">
            {tabsState.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                className={classNames(
                  tab.current
                    ? 'text-[#4a7c59] font-semibold border-b-2 border-[#4a7c59]'
                    : 'text-gray-600 hover:text-[#4a7c59]',
                  'text-lg pb-1 transition whitespace-nowrap' // Added whitespace-nowrap
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-[#f1f5f9] px-4 h-[56px] flex items-center rounded-xl border border-[#e2e8f0]">
              <p className="text-base text-gray-700 font-medium whitespace-nowrap">
                Logged in as <span className="font-semibold">{userAuth} #{workId}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="h-[56px] flex items-center px-4 border border-transparent text-[#d9534f] hover:text-[#c9302c] underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;