import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

const barData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  datasets: [
    {
      label: 'CAPA',
      backgroundColor: '#4ade80',
      data: [28, 35, 31, 38, 29, 36, 34, 30, 37, 32, 35],
    },
    {
      label: 'Dispatched Package / hr',
      backgroundColor: '#facc15',
      data: [310, 340, 320, 350, 315, 330, 325, 318, 335, 328, 332],
    },
  ],
};

const pieData = {
  labels: ['Occupied', 'Vacant'],
  datasets: [
    {
      data: [96, 4],
      backgroundColor: ['#6366f1', '#22d3ee'],
      hoverOffset: 8,
    },
  ],
};

const legendLabels = ['Occupied', 'Vacant'];
const legendColors = ['#6366f1', '#22d3ee'];

const ProgressBar = ({ percentage, color }) => {
  const progressRef = useRef(null);

  useEffect(() => {
    const progressBar = progressRef.current;
    progressBar.style.width = '0%';
    
    setTimeout(() => {
      progressBar.style.transition = 'width 1s ease-in-out';
      progressBar.style.width = `${percentage}%`;
    }, 100);
  }, [percentage]);

  return (
    <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div 
        ref={progressRef}
        className={`h-full rounded-full transition-all duration-1000 ease-in-out`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

const WarehouseDashboard = () => {
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        const response = await fetch('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/inventory/stats');
        const data = await response.json();
        setInventoryStats(data);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryStats();
  }, []);

  // Calculate percentage for progress bar
  const calculatePercentage = () => {
    if (!inventoryStats) return 98; // fallback value
    const { total_max_capacity, total_remaining_qty } = inventoryStats;
    if (total_max_capacity === 0) return 0;
    return Math.round(((total_max_capacity - total_remaining_qty) / total_max_capacity) * 100);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9]  text-gray-800 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto space-y-6 sm:space-y-10 mt-20 px-4 sm:px-6 py-6 sm:py-8">
        {/* Summary Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-lime-600 font-medium">Received Today</p>
            <p className="text-4xl font-bold mt-2">88.00%</p>
            <p className="text-base mt-2 text-gray-500">+176 (Total 200)</p>
            <ProgressBar percentage={88} color="#22c55e" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-green-600 font-medium">Document Inspection</p>
            <p className="text-4xl font-bold mt-2">80.00%</p>
            <p className="text-base mt-2 text-gray-500">+160 (Total 200)</p>
            <ProgressBar percentage={80} color="#16a34a" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-blue-600 font-medium">Inspected Today</p>
            <p className="text-4xl font-bold mt-2">22.72%</p>
            <p className="text-base mt-2 text-gray-500">+40 (Total 176)</p>
            <ProgressBar percentage={22.72} color="#3b82f6" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-blue-600 font-medium">TQ Fail / Pass %</p>
            <p className="text-4xl font-bold mt-2">92.72%</p>
            <p className="text-base mt-2 text-gray-500">+163 (Total 176)</p>
            <ProgressBar percentage={92.72} color="#3b82f6" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-indigo-600 font-medium">Bin Utilization</p>
            <div className="mt-4 h-32">
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
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {legendLabels.map((label, idx) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: legendColors[idx] }} />
                  <span>{label} {label === 'Occupied' ? '96%' : '4%'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-teal-600 font-medium">Inventory Reconciliation</p>
            <p className="text-4xl font-bold mt-2">
              {loading ? '...' : `${calculatePercentage()}.00%`}
            </p>
            <p className="text-base mt-2 text-gray-500">
              {loading ? 'Loading...' : `${inventoryStats?.unique_sku_count || 0} SKU`}
            </p>
            <p className="text-base mt-1 text-gray-500">
              {loading ? 'Loading...' : `${inventoryStats?.total_max_capacity || 0} Item`}
            </p>
            <ProgressBar percentage={calculatePercentage()} color="#0d9488" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(244,63,94,0.12)] hover:scale-[1.01] transition">
            <p className="text-base text-red-500 font-medium">Scheduled Dispatch</p>
            <p className="text-4xl font-bold mt-2">5,850</p>
            <div className="mt-3 space-y-2 text-base text-gray-600">
              <p>Picking Status: <span className="text-gray-800 font-semibold">20.35%</span></p>
              <p>Packing Status: <span className="text-gray-800 font-semibold">95%</span></p>
              <p>Dispatched Package: <span className="text-gray-800 font-semibold">4,550</span></p>
            </div>
            <ProgressBar percentage={45} color="#ef4444" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(132,204,22,0.15)] hover:scale-[1.01] transition">
            <p className="text-base text-orange-600 font-medium">Processing Times</p>
            <p className="text-4xl font-bold mt-2">10.2</p>
            <p className="text-base mt-2 text-gray-500">min per package</p>
            <ProgressBar percentage={85} color="#ea580c" />
          </div>
        </section>

        {/* CAPA Worker Info Section */}
        <section className="bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">CAPA Overview</h2>
            <p className="text-4xl font-semibold text-lime-600">32.5</p>
            <p className="text-base text-gray-500 mt-2">Responsible for delivery</p>
            <p className="mt-4 text-base text-gray-700">Dispatched Package / hr: <span className="font-semibold text-gray-900">325</span></p>
            <p className="text-base text-gray-700">Total Number of Workers: <span className="font-semibold text-gray-900">10</span></p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {[32, 41, 44, 14, 64, 84, 14, 34, 48, 55].map((id, idx) => (
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
        <section className="grid grid-cols-1 gap-6 sm:gap-8 border-t border-gray-200 pt-10">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">CAPA History</h2>
            <div className="h-72">
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </section>

        {/* New Section with Today's Inventory Count and Bottleneck */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 border-t border-gray-200 pt-10">
          {/* Today's Inventory Count */}
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between min-h-[340px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Today's Inventory Count</h2>
              <p className="text-sm text-gray-400 mb-1">z1-a1-s1-b1 ~ z1-a3-s20-b19</p>
              <p className="text-xs text-gray-400 mb-4">Q2 Inventory Status</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-28 h-28 mb-2">
                <Pie
                  data={{
                    labels: ['Completed', 'Remaining'],
                    datasets: [{
                      data: [93, 7],
                      backgroundColor: ['#2563eb', '#e5e7eb'],
                      borderWidth: 0,
                    }]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    cutout: '75%',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-blue-600">93%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottleneck */}
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between min-h-[340px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Bottleneck</h2>
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Picking Status</p>
                <span className="text-3xl font-extrabold text-red-500">20.35%</span>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Optimal required personnel</p>
                <span className="text-3xl font-extrabold text-gray-800">4</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WarehouseDashboard;