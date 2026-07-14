import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShoppingBag, Menu, X, Package, Grid, Map, HomeIcon } from 'lucide-react';

const Navbar = ({ onNotesClick }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin123');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const activeAdminTab = queryParams.get('tab') || 'products';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                SmartFinder
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAdmin && (
              <>
                <Link 
                  to="/purchases" 
                  className={`font-medium transition-colors ${location.pathname === '/purchases' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  All Products
                </Link>
                <Link 
                  to="/shop" 
                  className={`font-medium transition-colors flex items-center gap-1 ${location.pathname === '/shop' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <ShoppingBag className="w-4 h-4" /> Shop Online
                </Link>
                <Link 
                  to="/orders" 
                  className={`font-medium transition-colors flex items-center gap-1 ${location.pathname === '/orders' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                   My Orders
                </Link>
                <button 
                  onClick={onNotesClick}
                  className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                </button>
              </>
            )}
            {isAdmin && (
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                Admin Mode
              </span>
            )}
          </div>

          {/* Mobile Cart & Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {!isAdmin && (
              <button 
                onClick={onNotesClick}
                className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-500 hover:text-primary-600 p-2 rounded-md"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {!isAdmin && (
              <>
              <Link to="/"
              onClick={() => setIsMobileMenuOpen(false)}
               className="block px-3 py-3 rounded-md font-medium flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Home
              </Link>
                <Link 
                  to="/purchases" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium ${location.pathname === '/purchases' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Products
                </Link>
                <Link 
                  to="/shop" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium flex items-center gap-2 ${location.pathname === '/shop' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ShoppingBag className="w-5 h-5" /> Shop Online
                </Link>
                <Link 
                  to="/orders" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium ${location.pathname === '/orders' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                   My Orders
                </Link>
              </>
            )}
            {isAdmin && (
              <div className="px-3 py-3 space-y-1">
                <div className="mb-4">
                  <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                    Admin Mode
                  </span>
                </div>
                <Link 
                  to="/admin123?tab=products" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium flex items-center gap-2 ${activeAdminTab === 'products' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Package className="w-5 h-5" /> Products
                </Link>
                <Link 
                  to="/admin123?tab=categories" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium flex items-center gap-2 ${activeAdminTab === 'categories' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" /> Categories
                </Link>
                <Link 
                  to="/admin123?tab=layout" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium flex items-center gap-2 ${activeAdminTab === 'layout' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Map className="w-5 h-5" /> Store Layout
                </Link>
                <Link 
                  to="/admin123?tab=orders" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md font-medium flex items-center gap-2 ${activeAdminTab === 'orders' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ShoppingCart className="w-5 h-5" /> Online Orders
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
