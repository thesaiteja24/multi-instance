import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Ensure it runs after page load
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // ✅ Smooth scrolling effect
      });
    }, 100); // Small delay to ensure UI updates before scrolling
  }, [pathname]);

  return null;
};

export default ScrollToTop;
