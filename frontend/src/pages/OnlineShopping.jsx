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
    <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden md:h-full bg-transparent">
      {/* Left Main Content */}
      <div className="flex-1 md:overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-md border border-white/50 dark:border-white/10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Explore Products</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Fresh items delivered right to your door.</p>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search for a specific product..." 
                value={searchQuery}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium shadow-inner text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCategoryFilter('')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${categoryFilter === '' ? 'bg-primary-600 text-white shadow-md' : 'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-600'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat._id}
                  onClick={() => setCategoryFilter(cat._id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${categoryFilter === cat._id ? 'bg-primary-600 text-white shadow-md' : 'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product, index) => (
              <div 
                key={product._id} 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm border border-white/50 dark:border-white/10 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-28 md:h-40 w-full bg-white/40 dark:bg-gray-700/40 border border-white/30 dark:border-white/10 rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden flex items-center justify-center p-2 md:p-4">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-gray-300 dark:text-gray-500" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1 flex-col sm:flex-row gap-1 sm:gap-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg line-clamp-1">{product.name}</h3>
                    <span className="hidden sm:flex text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full items-center gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Available
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4 truncate">{product.category?.name || 'General'}</p>
                  
                  <div className="mt-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
                    <span className="text-base md:text-xl font-black text-gray-900 dark:text-white">${product.price?.toFixed(2) || '0.00'}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full xl:w-auto bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold transition-all active:scale-90 flex justify-center items-center gap-1 text-sm group-hover:shadow-md"
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
      <div className="w-full md:w-96 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t md:border-t-0 md:border-l border-white/50 dark:border-white/10 flex flex-col z-10 md:h-full">
        <div className="p-4 md:p-5 border-b border-white/50 dark:border-white/10 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Your order</h2>
            <span className="text-xl font-black text-primary-600 dark:text-primary-400">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-5 space-y-3 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 space-y-4 pt-10">
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/50 dark:border-white/10 rounded-full">
                  <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                </div>
                <p className="font-medium text-center">Cart is empty<br/><span className="text-sm font-normal text-gray-500 dark:text-gray-400">Select items from the menu to continue.</span></p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item, index) => (
                  <li 
                    key={item.product._id} 
                    className="flex gap-4 items-center animate-slide-in-right opacity-0"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="h-16 w-16 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden flex items-center justify-center p-2 border border-white/50 dark:border-white/10 flex-shrink-0 shadow-sm">
                      {item.product.image ? (
                        <img src={item.product.image} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h4>
                      <span className="text-sm font-black text-primary-600 dark:text-primary-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center bg-white/60 dark:bg-gray-700/60 backdrop-blur-md rounded-lg p-1 shadow-sm border border-white/40 dark:border-white/10">
                        <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 hover:bg-white/80 dark:hover:bg-gray-600 rounded-md transition-colors"><Minus className="w-3 h-3 text-gray-700 dark:text-gray-300" /></button>
                        <span className="w-6 text-center text-sm font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 hover:bg-white/80 dark:hover:bg-gray-600 rounded-md transition-colors"><Plus className="w-3 h-3 text-gray-700 dark:text-gray-300" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 md:p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-white/50 dark:border-white/10">
            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customer Name *</label>
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm shadow-inner" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Mobile No *</label>
                <input required type="tel" value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm shadow-inner" placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Delivery Address *</label>
                <textarea required rows="2" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium resize-none text-sm shadow-inner" placeholder="123 Main St, Apt 4B..."></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full mt-2 bg-gray-900/90 dark:bg-primary-600/90 backdrop-blur-md hover:bg-gray-900 dark:hover:bg-primary-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm"
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
