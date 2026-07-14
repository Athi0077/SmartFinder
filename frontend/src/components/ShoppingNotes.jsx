import React, { useState, useEffect } from 'react';
import { Trash2, X, ShoppingCart, Receipt, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ShoppingNotes = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
 const navigate = useNavigate();
  const loadItems = () => {
    try {
      const saved = localStorage.getItem('shoppingNotes');
      const parsed = saved ? JSON.parse(saved) : [];
      // Wipe old schema data
      if (parsed.length > 0 && parsed[0].product === undefined) {
        setItems([]);
        localStorage.setItem('shoppingNotes', JSON.stringify([]));
      } else {
        setItems(parsed);
      }
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
    window.addEventListener('shoppingNotesUpdated', loadItems);
    return () => window.removeEventListener('shoppingNotesUpdated', loadItems);
  }, []);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('shoppingNotes', JSON.stringify(newItems));
  };

  //open Your Cart & Bill products button
  const handleLocationClick = (product) => {
    navigate('/', { state: { selectedProduct: product, fromCart: true, returnTo: window.location.pathname } });
    onClose(); // Close the drawer
  };

  const updateQuantity = (id, delta) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newQuantity = (item.quantity || 1) + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    });
    saveItems(updated);
  };

  const moveToBill = (id) => {
    const itemToMove = items.find(i => i.id === id);
    if (!itemToMove) return;
    
    // Check if it already exists in the bill
    const existingInBill = items.find(i => i.status === 'bill' && i.product._id === itemToMove.product._id);
    let updated;
    if (existingInBill) {
        // Merge quantities and remove the old cart item
        updated = items.filter(i => i.id !== id).map(i => 
            i.id === existingInBill.id ? { ...i, quantity: (i.quantity || 1) + (itemToMove.quantity || 1) } : i
        );
    } else {
        updated = items.map(item => item.id === id ? { ...item, status: 'bill' } : item);
    }
    saveItems(updated);
  };

  const deleteItem = (id) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  const clearCart = () => {
    const updated = items.filter(item => item.status !== 'cart');
    saveItems(updated);
  };

  const clearBill = () => {
    const updated = items.filter(item => item.status !== 'bill');
    saveItems(updated);
  };

  const cartItems = items.filter(i => i.status === 'cart');
  const billItems = items.filter(i => i.status === 'bill');

  const billTotal = billItems.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 1)), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-white/50 dark:border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/40 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Cart & Bill</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60 shadow-sm">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {/* SHOPPING CART SECTION */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="p-3 bg-primary-50/50 dark:bg-gray-800/50 border-b border-primary-100/50 dark:border-gray-700/50 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-primary-800 dark:text-primary-300 font-bold">
              <ShoppingCart className="h-5 w-5" />
              <span>Shopping Cart ({cartItems.length})</span>
            </div>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-800 dark:hover:text-primary-300">Clear</button>
            )}
          </div>

          <div className="p-2">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Your cart is empty.</p>
            ) : (
              <ul className="space-y-2">
                {cartItems.map(item => (
                  <li key={item.id} className="flex flex-col p-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg border border-white/60 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">{item.product?.name}</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-l">-</button>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-4 text-center">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-r">+</button>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">${item.product?.price?.toFixed(2) || '0.00'} each</span>
                    </div>

                    <div className="flex justify-between items-center mt-1 space-x-2">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Remove from Cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex space-x-2 flex-1 justify-end">
                        <button
                          onClick={() => handleLocationClick(item.product)}
                          className="flex items-center space-x-1 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/50 px-2 py-1.5 rounded-lg font-medium transition-colors text-xs"
                        >
                          <MapPin className="h-3 w-3" />
                          <span>Location</span>
                        </button>
                        <button
                          onClick={() => moveToBill(item.id)}
                          className="flex items-center space-x-1 bg-primary-600 dark:bg-primary-500 text-white text-xs px-2 py-1.5 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 font-medium shadow-sm transition-colors"
                        >
                          <span>To Bill</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* BILL SECTION */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="p-3 bg-gray-900/80 dark:bg-primary-700/80 backdrop-blur-md border-b border-gray-800/50 dark:border-primary-800/50 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white font-bold">
              <Receipt className="h-5 w-5" />
              <span>My Bill ({billItems.length})</span>
            </div>
            {billItems.length > 0 && (
              <button onClick={clearBill} className="text-xs text-gray-300 hover:text-white font-semibold">Clear</button>
            )}
          </div>

          <div className="p-2">
            {billItems.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No items added to bill yet.</p>
            ) : (
              <ul className="space-y-2">
                {billItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg border border-white/60 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">{item.product?.name} <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">x{item.quantity || 1}</span></span>
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 text-left hover:underline mt-1">Remove</button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* TOTAL AMOUNT */}
          <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t border-white/60 dark:border-white/10 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Amount</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">${billTotal.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShoppingNotes;
