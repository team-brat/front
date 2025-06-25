import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ORDERS_API = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/orders';
const WARNINGS_API = 'https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/warning-orders';

const DispatchRequests = () => {
  const [orders, setOrders] = useState([]);
  const [warningOrders, setWarningOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const [ordersRes, warningsRes] = await Promise.all([
          axios.get(ORDERS_API),
          axios.get(WARNINGS_API),
        ]);

        const fullOrders = ordersRes.data?.orders || [];
        const warningList = warningsRes.data?.warning_orders || [];

        // warning order ID set
        const warningIds = new Set(warningList.map((w) => w.order_id));

        const normalOrders = fullOrders.filter((o) => !warningIds.has(o.order_id));
        setOrders(normalOrders);
        setWarningOrders(warningList);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dispatch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const renderRow = (item, isWarning = false) => (
    <tr key={item.order_id} className={isWarning ? 'bg-red-50 text-red-800' : 'bg-white'}>
      <td className="px-4 py-3">{item.order_id}</td>
      <td className="px-4 py-3">{item.sku_name}</td>
      <td className="px-4 py-3">{item.sku_id}</td>
      <td className="px-4 py-3">{item.serial_or_barcode}</td>
      <td className="px-4 py-3">{item.quantity}</td>
      <td className="px-4 py-3">{item.allocated_qty}</td>
      <td className="px-4 py-3">{item.shipping_label_number || '-'}</td>
      <td className="px-4 py-3">{item.status}</td>
      <td className="px-4 py-3">{item.destination_code}</td>
      <td className="px-4 py-3">{item.tote_number || '-'}</td>
    </tr>
  );

  return (
    <div className="p-12 space-y-12 w-full">
      <div className="pb-10 mb-12 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Dispatch Requests</h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading orders...</p>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-300 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          {/* ✅ 정상 주문 리스트 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Valid Orders</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">SKU Name</th>
                    <th className="px-4 py-3">SKU #</th>
                    <th className="px-4 py-3">Barcode</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Allocated Qty</th>
                    <th className="px-4 py-3">Shipping Label</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Dest Code</th>
                    <th className="px-4 py-3">Tote #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => renderRow(order))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-center text-gray-500 py-6">
                        No valid dispatch orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ⚠️ 할당 부족 주문 */}
          <div>
            <h2 className="text-xl font-semibold text-red-600 mt-12 mb-4"> Allocation Shortage Orders</h2>
            <div className="overflow-x-auto rounded-xl border border-red-200 shadow">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-red-100 text-red-800">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">SKU Name</th>
                    <th className="px-4 py-3">SKU #</th>
                    <th className="px-4 py-3">Barcode</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Allocated Qty</th>
                    <th className="px-4 py-3">Shipping Label</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Dest Code</th>
                    <th className="px-4 py-3">Tote #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {warningOrders.map((order) => renderRow(order, true))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DispatchRequests; 