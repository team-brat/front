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
import Header from './Header';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const lineData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  datasets: [
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

const legendLabels = ['Available', 'Occupied', 'Scheduled Dispatch'];
const legendColors = ['#22d3ee', '#6366f1', '#facc15'];

const WarehouseDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#152b22] to-[#1f3d2d] px-6 py-8 text-white font-sans">
      <Header />
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="col-span-1 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-cyan-300">Received Today</p>
          <p className="text-3xl font-bold mt-1">88.00%</p>
          <p className="text-sm mt-1 text-lime-400 font-dm">
            +176 <span className="text-xs">(Total 200)</span>
          </p>
        </div>

        <div className="col-span-1 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-green-300">Inspected Today</p>
          <p className="text-3xl font-bold mt-1">22.72%</p>
          <p className="text-sm mt-1 text-lime-400 font-dm">
            +40 <span className="text-xs">(Total 176)</span>
          </p>
        </div>

        <div className="col-span-1 bg-[#3a1a1a] p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <p className="text-sm text-red-300">Scheduled Dispatch</p>
            <p className="text-3xl font-bold mt-2">1000</p>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2 text-sm space-y-1">
            <p className="text-red-300 font-dm">Picking Status: 40.35%</p>
            <p className="text-yellow-200 font-dm">Packing Status: 20.5%</p>
            <p className="text-lime-300 font-dm">Dispatched Package: 450</p>
          </div>
        </div>

        <div className="col-span-2 bg-[#1d2e24] p-4 rounded-2xl shadow-md">
          <p className="text-sm text-yellow-300 mb-2">CAPA</p>
          <div className="space-y-2">
            <div>
              <p className="text-3xl font-semibold">0.22</p>
              <p className="text-sm text-white/70 font-dm">Responsible for delivery</p>
            </div>
            <div className="flex -space-x-2">
              {/* Sample user avatars */}
              {[32, 41, 44, 44, 14, 64, 84, 14, 34, 48, 29].map((id, idx) => (
                <img
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'men' : 'women'}/${id}.jpg`}
                  alt="User"
                />
              ))}
            </div>
            <div className="text-sm text-white/70">
              <p className="font-dm">Total Number of Workers: <span className="text-white">10</span></p>
              <p className="font-dm">Dispatched Package / hr: <span className="text-white">2.22</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1d2e24] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bin Utilization</h2>
          <div className="w-[90%] mx-auto">
            <Pie
              data={pieData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-1">
            {legendLabels.map((label, idx) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full font-dm"
                  style={{ backgroundColor: legendColors[idx] }}
                />
                <span>{label}</span>
              </div>
            ))}
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