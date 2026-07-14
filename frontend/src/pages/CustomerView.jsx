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
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">

      {/* Left Column: Search & Product Details */}
      {!isMapOnlyMode && (
        <div className="w-full lg:w-1/3 flex flex-col space-y-6 lg:h-[calc(100vh-8rem)] h-auto">

          {/* Search Bar */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-lg shadow-sm"
              placeholder="Search for a specific product..."
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
              <div className="text-center py-10 text-gray-500">Loading map...</div>
            ) : selectedProduct ? (
              // Single Product Details Card
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 bg-gray-50 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10 border border-transparent hover:border-red-100 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="w-full h-24 sm:h-32 bg-white flex items-center justify-center p-4 border-b border-gray-50">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="max-w-[120px] max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="h-10 w-10 text-gray-300" /></div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <span className="text-2xl font-bold text-primary-600">${selectedProduct.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <p className="text-gray-500 mb-6">{selectedProduct.description}</p>

                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-primary-800 mb-3 font-semibold">
                      <MapPin className="h-5 w-5" />
                      <span>Exact Location</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 font-medium uppercase">Row</span>
                        <span className="block text-lg font-bold text-gray-900">{selectedProduct.location?.row}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 font-medium uppercase">Col</span>
                        <span className="block text-lg font-bold text-gray-900">{selectedProduct.location?.column}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 font-medium uppercase">Shelf</span>
                        <span className="block text-lg font-bold text-gray-900">{selectedProduct.location?.shelf}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleAction(selectedProduct, 'cart')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-xl font-bold transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Cart</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedProduct, 'bill')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 text-white hover:bg-gray-800 px-4 py-3 rounded-xl font-bold transition-colors"
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
                  <div className="text-center py-10 text-gray-500">No products found for "{searchQuery}".</div>
                ) : (
                  filteredProducts.map(p => (
                    <div
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{p.category?.name || 'General'}</p>
                      </div>
                      <div className="text-primary-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Default Empty State
              <div className="text-center py-20 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search for a product to view its location</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Column: 3D Map */}
      <div className={`w-full flex flex-col lg:h-[calc(100vh-8rem)] h-[500px] ${isMapOnlyMode ? 'h-[calc(100vh-8rem)]' : 'lg:w-2/3'}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden min-h-[500px] flex items-center justify-center relative">

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
                className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md text-sm font-bold text-gray-700 hover:text-primary-600 hover:bg-white transition-all flex items-center space-x-2"
              >
                <span>{routerLocation.state?.fromCart ? '← Back to Cart' : '← Back to Purchases'}</span>
              </button>
              <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-lg shadow-md border border-gray-100 max-w-xs">
                <h3 className="font-bold text-gray-900 mb-1">{selectedProduct.name}</h3>
                <div className="flex items-center text-primary-700 font-semibold text-sm">
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
