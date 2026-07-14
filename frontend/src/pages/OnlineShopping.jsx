import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Plus, Minus, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OnlineShopping = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/categories`)
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, name: product.name, price: product.price }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      const orderData = {
        customerName,
        mobileNo,
        address,
        totalAmount: cartTotal,
        items: cart.map(c => ({
          product: c.product._id,
          name: c.name,
          price: c.price,
          quantity: c.quantity
        }))
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);
      
      // Save order to local storage history
      const savedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      savedOrders.push(res.data._id);
      localStorage.setItem('myOrders', JSON.stringify(savedOrders));
      
      alert('Order Placed Successfully!');
      setCart([]);
      setCustomerName('');
      setMobileNo('');
      setAddress('');
      navigate('/orders');
      
    } catch (err) {
      console.error('Error placing order', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter ? p.category?._id === categoryFilter : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 bg-gray-50 flex flex-col md:flex-row md:overflow-hidden md:h-full">
      {/* Left Main Content */}
      <div className="flex-1 md:overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Explore Products</h1>
            <p className="text-gray-500 mb-6">Fresh items delivered right to your door.</p>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search for a specific product..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium shadow-inner"
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCategoryFilter('')} 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === '' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat._id}
                  onClick={() => setCategoryFilter(cat._id)} 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === cat._id ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all">
                <div className="h-28 md:h-40 w-full bg-gray-50 rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden flex items-center justify-center p-2 md:p-4">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-gray-300" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1 flex-col sm:flex-row gap-1 sm:gap-0">
                    <h3 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-1">{product.name}</h3>
                    <span className="hidden sm:flex text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full items-center gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Available
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 truncate">{product.category?.name || 'General'}</p>
                  
                  <div className="mt-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
                    <span className="text-base md:text-xl font-black text-gray-900">${product.price?.toFixed(2) || '0.00'}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full xl:w-auto bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold transition-colors flex justify-center items-center gap-1 text-sm"
                    >
                      Add <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right Sidebar - Cart & Checkout */}
      <div className="w-full md:w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] border-t md:border-t-0 md:border-l border-gray-100 flex flex-col z-10 md:h-full">
        <div className="p-4 md:p-5 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Your order</h2>
            <span className="text-xl font-black text-primary-600">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-5 space-y-3 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 pt-10">
                <div className="p-4 bg-gray-50 rounded-full">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <p className="font-medium text-center">Cart is empty<br/><span className="text-sm font-normal text-gray-500">Select items from the menu to continue.</span></p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map(item => (
                  <li key={item.product._id} className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-gray-100 flex-shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      <span className="text-sm font-black text-primary-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus className="w-3 h-3 text-gray-600" /></button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus className="w-3 h-3 text-gray-600" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 md:p-5 bg-gray-50 border-t border-gray-100">
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name *</label>
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile No *</label>
                <input required type="tel" value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address *</label>
                <textarea required rows="2" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium resize-none text-sm" placeholder="123 Main St, Apt 4B..."></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isPlacingOrder ? 'Processing...' : `Place Order • $${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineShopping;
