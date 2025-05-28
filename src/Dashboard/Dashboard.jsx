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
import Header from '../components/Layout/Header';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const lineData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  datasets: [
    {
      label: 'CAPA',
      borderColor: '#4ade80',
      backgroundColor: '#bbf7d0',
      data: [50, 40, 30, 60, 70, 85, 100, 90, 95, 80, 100],
      tension: 0.4,
    },
    {
      label: 'Dispatched Package / hr',
      borderColor: '#facc15',
      backgroundColor: '#fef9c3',
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
    <div className="min-h-screen bg-[#f5f7f9] px-4 sm:px-6 py-6 sm:py-8 text-gray-800 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        {/* Summary Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-lime-600 font-medium">Received Today</p>
            <p className="text-4xl font-bold mt-2">88.00%</p>
            <p className="text-base mt-2 text-gray-500">+176 (Total 200)</p>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-500 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-blue-600 font-medium">Inspected Today</p>
            <p className="text-4xl font-bold mt-2">22.72%</p>
            <p className="text-base mt-2 text-gray-500">+40 (Total 176)</p>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '22.72%' }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(244,63,94,0.12)] hover:scale-[1.01] transition">
            <p className="text-base text-red-500 font-medium">Scheduled Dispatch</p>
            <p className="text-4xl font-bold mt-2">1000</p>
            <div className="mt-3 space-y-2 text-base text-gray-600">
              <p>Picking Status: <span className="text-gray-800 font-semibold">40.35%</span></p>
              <p>Packing Status: <span className="text-gray-800 font-semibold">20.5%</span></p>
              <p>Dispatched Package: <span className="text-gray-800 font-semibold">450</span></p>
            </div>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </section>

        {/* CAPA Worker Info Section */}
        <section className="bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 border-t border-gray-200 pt-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">CAPA Overview</h2>
            <p className="text-4xl font-semibold text-lime-600">0.22</p>
            <p className="text-base text-gray-500 mt-2">Responsible for delivery</p>
            <p className="mt-4 text-base text-gray-700">Dispatched Package / hr: <span className="font-semibold text-gray-900">2.22</span></p>
            <p className="text-base text-gray-700">Total Number of Workers: <span className="font-semibold text-gray-900">10</span></p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {[32, 41, 44, 14, 64, 84, 14, 34, 48, 29].map((id, idx) => (
              <img
                key={idx}
                className="w-12 h-12 rounded-full border-2 border-white shadow"
                src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'men' : 'women'}/${id}.jpg`}
                alt="User"
                title={`Worker ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 border-t border-gray-200 pt-10">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Bin Utilization</h2>
            <div className="w-[90%] mx-auto h-72">
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
            <div className="mt-4 space-y-2 text-base text-gray-600">
              {legendLabels.map((label, idx) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: legendColors[idx] }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">CAPA History</h2>
            <div className="h-72">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WarehouseDashboard;