import React, { useState, useEffect } from 'react';
import { Search, MapPin, Package, ShoppingCart, Receipt, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThreeDMap from '../components/ThreeDMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerView = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = ["Search 'Apple'", "Search 'Chocolate'", "Search 'Wheat'", "Search 'Salt'"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [layout, setLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data (layout and all products)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [layoutRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/layout`),
          axios.get(`${API_URL}/products`)
        ]);
        setLayout(layoutRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const [isMapOnlyMode, setIsMapOnlyMode] = useState(false);

  const handleAction = (product, status) => {
    try {
      const storedNotes = localStorage.getItem('shoppingNotes');
      let notes = storedNotes ? JSON.parse(storedNotes) : [];
      
      if (notes.length > 0 && notes[0].product === undefined && notes[0].text !== undefined) {
        notes = []; 
      }
      
      const existingIndex = notes.findIndex(note => note.product._id === product._id && note.status === status);
      
      if (existingIndex > -1) {
        notes[existingIndex].quantity = (notes[existingIndex].quantity || 1) + 1;
      } else {
        const newNote = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          product: product,
          status: status,
          quantity: 1
        };
        notes.push(newNote);
      }
      
      localStorage.setItem('shoppingNotes', JSON.stringify(notes));
      window.dispatchEvent(new Event('shoppingNotesUpdated'));
      
      alert(`${product.name} added to ${status === 'cart' ? 'Shopping List' : 'Bill'}!`);
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  // Handle incoming selected product from location state (from Purchases page)
  useEffect(() => {
    if (routerLocation.state?.selectedProduct) {
      setSelectedProduct(routerLocation.state.selectedProduct);
      setSearchQuery(''); // Clear search when coming from external link
      setIsMapOnlyMode(true); // Enable full-screen map mode
    } else {
      setIsMapOnlyMode(false);
    }
  }, [routerLocation.state]);

  // Filter products based on search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">

      {/* Left Column: Search & Product Details */}
      {!isMapOnlyMode && (
        <div className="w-full lg:w-1/3 flex flex-col space-y-6 lg:h-[calc(100vh-8rem)] h-auto">

          {/* Search Bar */}
          <div className="relative flex-shrink-0 tour-search-bar">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            {/* Custom Scrolling Placeholder */}
            {!searchQuery && (
              <div className="absolute top-0 bottom-0 left-10 right-3 pointer-events-none overflow-hidden z-10">
                <div 
                  className="transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateY(-${placeholderIndex * 100}%)` }}
                >
                  {placeholders.map((text, i) => (
                    <div key={i} className="h-full flex items-center text-gray-500 dark:text-gray-400 sm:text-lg">
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="search"
              className="block w-full pl-10 pr-3 py-4 border border-white/50 dark:border-white/10 rounded-2xl leading-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-lg shadow-sm text-gray-900 dark:text-white transition-all duration-500 relative z-0"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProduct(null); // Clear selected product when typing
              }}
            />
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading map...</div>
            ) : selectedProduct ? (
              // Single Product Details Card
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-white/10 overflow-hidden transition-all duration-300 relative animate-pop-in">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 bg-white/50 dark:bg-gray-700/50 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10 border border-transparent hover:border-red-100 dark:hover:border-red-900 shadow-sm backdrop-blur-md"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="w-full h-24 sm:h-32 bg-white/40 dark:bg-gray-800/40 flex items-center justify-center p-4 border-b border-white/30 dark:border-white/10">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="max-w-[120px] max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="h-10 w-10 text-gray-300 dark:text-gray-600" /></div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${selectedProduct.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{selectedProduct.description}</p>

                  <div className="bg-primary-50/50 dark:bg-gray-800/50 backdrop-blur-sm border border-primary-100/50 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-primary-800 dark:text-primary-300 mb-3 font-semibold">
                      <MapPin className="h-5 w-5" />
                      <span>Exact Location</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Row</span>
                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{selectedProduct.location?.row}</span>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Col</span>
                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{selectedProduct.location?.column}</span>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Shelf</span>
                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{selectedProduct.location?.shelf}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleAction(selectedProduct, 'cart')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/50 dark:border-white/10 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-gray-600 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Cart</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedProduct, 'bill')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-900/90 dark:bg-primary-600/90 backdrop-blur-md text-white hover:bg-gray-900 dark:hover:bg-primary-600 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md"
                    >
                      <Receipt className="h-5 w-5" />
                      <span>Bill</span>
                    </button>
                  </div>

                </div>
              </div>
            ) : searchQuery.trim() !== '' ? (
              // Search Results
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">No products found for "{searchQuery}".</div>
                ) : (
                  filteredProducts.map((p, index) => (
                    <div
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className="flex items-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/50 dark:border-white/10 shadow-sm cursor-pointer hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-md transition-all animate-slide-in-right opacity-0"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-gray-300 dark:text-gray-500" /></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.category?.name || 'General'}</p>
                      </div>
                      <div className="text-primary-600 dark:text-primary-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Default Empty State
              <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search for a product to view its location</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Column: 3D Map */}
      <div className={`w-full flex flex-col lg:h-[calc(100vh-8rem)] h-[500px] ${isMapOnlyMode ? 'h-[calc(100vh-8rem)]' : 'lg:w-2/3'}`}>
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-white/10 flex-1 overflow-hidden min-h-[500px] flex items-center justify-center relative">

          {isMapOnlyMode && selectedProduct && (
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
              <button
                onClick={() => {
                  if (routerLocation.state?.fromCart) {
                    window.dispatchEvent(new Event('openShoppingNotes'));
                  }

                  if (routerLocation.state?.returnTo) {
                    navigate(routerLocation.state.returnTo);
                  } else {
                    navigate('/purchases');
                  }
                }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center space-x-2"
              >
                <span>{routerLocation.state?.fromCart ? '← Back to Cart' : '← Back to Purchases'}</span>
              </button>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-3 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 max-w-xs">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{selectedProduct.name}</h3>
                <div className="flex items-center text-primary-700 dark:text-primary-400 font-semibold text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Row {selectedProduct.location?.row} • Col {selectedProduct.location?.column} • Shelf {selectedProduct.location?.shelf}</span>
                </div>
              </div>
            </div>
          )}

          <ThreeDMap
            location={selectedProduct ? selectedProduct.location : null}
            layout={layout}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
