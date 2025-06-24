import React, { useEffect, useState } from 'react';

const TrackDelivery = () => {
  const [deliveryList, setDeliveryList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/track-delivery')
      .then(res => res.json())
      .then(data => {
        setDeliveryList(data.deliveries || []);
        setFilteredList(data.deliveries || []);
      })
      .catch(err => console.error('Delivery API Error:', err));
  }, []);

  const handleSearch = () => {
    const filtered = deliveryList.filter(item =>
      item.order_id.includes(searchTerm) ||
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
  };

  return (
    <div className="p-12">
      <div className="pb-10 border-b border-gray-300 mb-8">
        <h1 className="text-4xl font-bold">Track Delivery</h1>
      </div>

      {/* Search */}
      <div className="flex items-center mb-6 space-x-4">
        <input
          type="text"
          placeholder="Search by Order ID / Recipient / Address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-96"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="p-3">Order #</th>
              <th className="p-3">Shipping Label #</th>
              <th className="p-3">Shipper</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((delivery, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{delivery.order_id}</td>
                <td className="p-3">{delivery.shipping_label_number || '-'}</td>
                <td className="p-3">{delivery.shipper || '-'}</td>
                <td className="p-3">{delivery.recipient}</td>
                <td className="p-3">{delivery.address}</td>
                <td className="p-3">
                  <span
                    className={`font-semibold ${
                      delivery.status === 'Delivered' ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    {delivery.status}
                  </span>
                </td>
                <td className="p-3">
                  <button className="bg-green-500 hover:bg-green-400 text-white text-sm px-3 py-1 rounded">
                    Track my Order
                  </button>
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No matching delivery records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackDelivery;
