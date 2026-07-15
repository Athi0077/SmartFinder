import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, ShoppingBag, Menu, X, Package, Grid, Map, HomeIcon, Moon, Sun } from 'lucide-react';

const Navbar = ({ onNotesClick, isDarkMode, setIsDarkMode }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin123');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const activeAdminTab = queryParams.get('tab') || 'products';

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm border-b border-white/50 dark:border-white/10 sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-primary-500 p-2 rounded-lg animate-float shadow-md">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block transition-colors">
                SmartFinder
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAdmin && (
              <>
              <Link 
                  to="/" 
                  className={`font-medium transition-all duration-300 hover:-translate-y-0.5 ${location.pathname === '/' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/purchases" 
                  className={`font-medium transition-all duration-300 hover:-translate-y-0.5 ${location.pathname === '/purchases' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  All Products
                </Link>
                <Link 
                  to="/shop" 
                  className={`font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1 ${location.pathname === '/shop' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  <ShoppingBag className="w-4 h-4" /> Shop Online
                </Link>
                <Link 
                  to="/orders" 
                  className={`font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1 ${location.pathname === '/orders' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                >
                   My Orders
                </Link>
                <button 
                  onClick={onNotesClick}
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-90 shadow-sm bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-white/10"
                >
                  <ShoppingCart className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-90 shadow-sm bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-white/10 ml-2"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
              className="text-gray-500 hover:text-primary-600 p-2 rounded-md tour-hamburger-menu"
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
