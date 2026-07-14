import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const savedOrderIds = JSON.parse(localStorage.getItem('myOrders') || '[]');
        if (savedOrderIds.length > 0) {
          const res = await axios.post(`${API_URL}/orders/history`, { orderIds: savedOrderIds });
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock className="w-4 h-4 mr-1" />;
      case 'Processing': return <Package className="w-4 h-4 mr-1" />;
      case 'Out for Delivery': return <Truck className="w-4 h-4 mr-1" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500">Track and view your recent online orders.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">You haven't placed any online orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
                
                <div className="flex flex-wrap gap-4 justify-between items-start mb-6 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono font-medium text-gray-900">{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-black text-gray-900 text-lg">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Items Ordered</h4>
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex gap-4 items-center p-4 hover:bg-gray-100/50 transition-colors">
                        <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-100 shadow-sm">
                          {item.product?.image ? (
                            <img src={item.product.image} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} • ${item.price?.toFixed(2)} each</p>
                        </div>
                        <div className="font-black text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-4 text-sm bg-gray-50/50 p-4 rounded-2xl">
                  <div>
                    <span className="text-gray-500 block mb-1">Deliver to:</span>
                    <strong className="text-gray-900 block">{order.customerName}</strong>
                    <span className="text-gray-600 block">{order.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Contact:</span>
                    <strong className="text-gray-900">{order.mobileNo}</strong>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
