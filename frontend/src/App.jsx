import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerView from './pages/CustomerView';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import ShoppingNotes from './components/ShoppingNotes';
import OnboardingTour from './components/OnboardingTour';
import { useState, useEffect } from 'react';
import bgImage from './assets/bg.jpeg';

import Purchases from './pages/Purchases';
import OnlineShopping from './pages/OnlineShopping';
import OrderHistory from './pages/OrderHistory';

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOpen = () => setIsNotesOpen(true);
    window.addEventListener('openShoppingNotes', handleOpen);
    return () => window.removeEventListener('openShoppingNotes', handleOpen);
  }, []);
  return (
    <Router>
      <div className={`min-h-screen flex flex-col relative bg-gradient-to-br from-indigo-50 via-teal-50 to-emerald-100 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 dark:text-gray-100 transition-colors duration-500`}>
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-10"
          style={{ 
            backgroundImage: `url(${bgImage})`, 
            backgroundSize: 'auto', 
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="relative z-10 flex flex-col flex-1">
          <OnboardingTour />
          <Navbar onNotesClick={() => setIsNotesOpen(true)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <ShoppingNotes isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
          <main className="flex-1 w-full flex flex-col">
            <Routes>
              <Route path="/" element={<CustomerView />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/shop" element={<OnlineShopping />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/admin123" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
