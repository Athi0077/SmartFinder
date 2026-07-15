import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

const OnboardingTour = () => {
  const [run, setRun] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    if (location.pathname === '/') {
      // Temporarily removed localStorage check so you can test it easily
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    } else if (location.pathname === '/purchases') {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setRun(false);
    }
  }, [location.pathname]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      if (location.pathname === '/') {
        localStorage.setItem('hasSeenHomeTour', 'true');
      } else if (location.pathname === '/purchases') {
        localStorage.setItem('hasSeenPurchasesTour', 'true');
      }
      setRun(false);
    }
  };

  const homeSteps = [
    {
      target: '.tour-search-bar',
      content: 'Use this search bar to quickly find products and see their exact location in the 3D map.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.tour-hamburger-menu',
      content: 'Tap the menu to navigate to All Products and view the full catalog.',
      placement: 'left',
    }
  ];

  const purchasesSteps = [
    {
      target: '.tour-location-btn',
      content: 'Click "Location" to instantly see exactly where this item is placed in the supermarket map!',
      disableBeacon: true,
      placement: 'top',
    }
  ];

  const steps = location.pathname === '/purchases' ? purchasesSteps : homeSteps;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress={steps.length > 1}
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#0ea5e9',
          textColor: '#1f2937',
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
        },
      }}
    />
  );
};

export default OnboardingTour;
