import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that detects if an element is in the viewport
 * @param {Object} options - Intersection Observer options
 * @param {number} [options.threshold=0.1] - The percentage of the element that needs to be visible to trigger
 * @param {string} [options.rootMargin='0px'] - Margin around the root
 * @returns {[React.RefObject<HTMLElement>, boolean]} - A ref to attach to the target element and a boolean indicating if it's in viewport
 */
const useInViewport = (options = {}) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const [isInViewport, setIsInViewport] = useState(false);
  const targetRef = useRef(null);
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsInViewport(true);
      // Disconnect after first intersection to avoid unnecessary checks
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    }
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;

    const observerOptions = {
      root: null,
      rootMargin,
      threshold,
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  return [targetRef, isInViewport];
};

export default useInViewport;
