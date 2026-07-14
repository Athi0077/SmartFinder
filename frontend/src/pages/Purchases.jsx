import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ShoppingCart, Package, Receipt } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Purchases = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search,setSearch] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/categories`)
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLocationClick = (product) => {
    navigate('/', { state: { selectedProduct: product, returnTo: '/purchases' } });
  };

  const handleAction = (product, status) => {
    try {
      const storedNotes = localStorage.getItem('shoppingNotes');
      let notes = storedNotes ? JSON.parse(storedNotes) : [];
      
      // If we are resetting the schema from the old checklist style, wipe it
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
          status: status, // 'cart' or 'bill'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-xl text-gray-500 font-medium animate-pulse">Loading Products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-2">Browse all available products in the supermarket.</p>
      </div>

      <div className='flex gap-2 mb-2'>
        <input type="search" placeholder='search products...' value={search} onChange={(e) => setSearch(e.target.value)}
         className=' w-full border border-gray-300 rounded-md p-2 mb-2 focus:border-primary-500 focus:ring-primary-500 focus:outline-none'
          />
          {/* dropdown */}
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
               className=' w-full border border-gray-300 rounded-md p-2 mb-2 focus:border-primary-500 focus:ring-primary-500 focus:outline-none'>
                <option value=''>All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                                (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
          const matchesCategory = categoryFilter ? (product.category && product.category._id === categoryFilter) : true;
          return matchesSearch && matchesCategory;
        }).map((product) => (
          <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-32 sm:h-40 w-full bg-white relative group border-b border-gray-50 flex items-center justify-center p-2">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-gray-300"/></div>
              )}
              {/* Category Badge */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-gray-100">
                {product.category?.name || 'General'}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <span className="text-lg font-bold text-primary-600">${product.price?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Row {product.location?.row} • Col {product.location?.column} • Shelf {product.location?.shelf}</span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
              
              <div className="flex flex-col space-y-2 mt-auto">
                <button 
                  onClick={() => handleLocationClick(product)}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAction(product, 'cart')}
                    className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-2 rounded-xl font-semibold transition-colors text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                  </button>
                  <button 
                    onClick={() => handleAction(product, 'bill')}
                    className="flex-1 flex items-center justify-center space-x-1 bg-gray-900 text-white hover:bg-gray-800 px-2 py-2 rounded-xl font-semibold transition-colors text-sm"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Bill</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products available.</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;
