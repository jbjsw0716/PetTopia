import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
function RouteScroll() {
  const location = useLocation();
  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => { window.history.scrollRestoration = previous; };
  }, [location.key]);
  return null;
}

export { RouteScroll };
