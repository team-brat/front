import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const lineData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  datasets: [
    // {
    //   label: 'Binning',
    //   borderColor: '#3b82f6',
    //   backgroundColor: '#3b82f6',
    //   data: [30, 60, 50, 40, 80, 90, 100, 80, 60, 110, 120],
    //   tension: 0.4,
    // },
    {
      label: 'CAPA',
      borderColor: '#22c55e',
      backgroundColor: '#22c55e',
      data: [50, 40, 30, 60, 70, 85, 100, 90, 95, 80, 100],
      tension: 0.4,
    },
    {
      label: 'Dispatched Package / hr',
      borderColor: '#eab308',
      backgroundColor: '#eab308',
      data: [10, 20, 35, 30, 60, 40, 55, 70, 90, 85, 110],
      tension: 0.4,
    },
  ],
};

const pieData = {
  labels: ['Available', 'Occupied', 'Scheduled Dispatch'],
  datasets: [
    {
      data: [25, 45, 30],
      backgroundColor: ['#22d3ee', '#6366f1', '#facc15'],
      hoverOffset: 8,
    },
  ],
};

const tabs = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Receiving', href: '#', current: false },
  { name: 'TQ', href: '#', current: false },
  { name: 'Binning', href: '#', current: false },
  { name: 'Dispatch', href: '#', current: false },
  { name: 'SKU', href: '#', current: false },
];
const legendLabels = ['Available', 'Occupied', 'Scheduled Dispatch'];
const legendColors = ['#22d3ee', '#6366f1', '#facc15'];


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const WarehouseDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#152b22] to-[#1f3d2d] px-6 py-8 text-white font-sans">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <img src="/brat-logo.png" alt="brat logo" className="h-10 drop-shadow-[0_0_8px_#a3e635]" />
          <h1 className="text-3xl font-bold tracking-tight">Hello, Sana</h1>
        </div>
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-1 sm:hidden">
            <select
              defaultValue={tabs.find((tab) => tab.current).name}
              aria-label="Select a tab"
              className="w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-lime-600"
            >
              {tabs.map((tab) => (
                <option key={tab.name}>{tab.name}</option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none -ml-8 self-center justify-self-end fill-gray-500"
            />
          </div>
          <div className="hidden sm:flex gap-2 bg-[#23352b] p-1 rounded-full shadow-inner border border-lime-500/20">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'bg-lime-300 text-gray-900 shadow-lg'
                    : 'text-lime-100 hover:bg-lime-400/20 hover:text-lime-300',
                  'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ease-in-out'
                )}
              >
                {tab.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="col-span-1 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-cyan-300">Received Today</p>
          <p className="text-3xl font-bold mt-1">88.00%</p>
          <p className="text-sm mt-1 text-lime-400">
            +176 <span className="text-xs">(Total 200)</span>
          </p>
        </div>

        <div className="col-span-1 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-green-300">Inspected Today</p>
          <p className="text-3xl font-bold mt-1">22.72%</p>
          <p className="text-sm mt-1 text-lime-400">
            +40 <span className="text-xs">(Total 176)</span>
          </p>
        </div>

        <div className="col-span-1 bg-[#3a1a1a] p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <p className="text-sm text-red-300">Scheduled Dispatch</p>
            <p className="text-3xl font-bold mt-2">1000</p>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2 text-sm space-y-1">
            <p className="text-red-300">Picking Status: 40.35%</p>
            <p className="text-yellow-200">Packing Status: 20.5%</p>
            <p className="text-lime-300">Dispatched Package: 450</p>
          </div>
        </div>

        <div className="col-span-2 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-yellow-300 mb-2">CAPA</p>
          <div className="space-y-2">
            <div>
              <p className="text-3xl font-semibold">0.22</p>
              <p className="text-sm text-white/70">Responsible for delivery</p>
            </div>
            <div className="flex -space-x-2">
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/41.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/men/44.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/14.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/men/64.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/men/84.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/14.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/34.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/women/48.jpg"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://randomuser.me/api/portraits/men/29.jpg"
                alt="User"
              />
            </div>
            <div className="text-sm text-white/70">
              <p>Total Number of Workers: <span className="text-white">10</span></p>
              <p> Dispatched Package / hr: <span className="text-white">2.22</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1d2e24] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bin Utilization</h2>

<div >
  
  {/* 차트만 작게 */}
  <div className="w-[90%] mx-auto">
    <Pie
      data={pieData}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  </div>

  {/* legend는 따로 크게! */}
  <div className="mt-4 space-y-1">
    {legendLabels.map((label, idx) => (
      <div key={label} className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: legendColors[idx] }} />
        <span>{label}</span>
      </div>
    ))}
  </div>
</div>

        </div>

        <div className="bg-[#1d2e24] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">CAPA History</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;