import { useEffect, useCallback } from 'react';

/**
 * Custom hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return prefersReducedMotion;
};

/**
 * Announce messages to screen readers
 */
export const useAnnounce = () => {
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  return announce;
};

/**
 * Focus management utilities
 */
export const useFocusManagement = () => {
  const trapFocus = useCallback((containerRef) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements?.length) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    containerRef.current?.addEventListener('keydown', handleKeyDown);
    
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const focusFirst = useCallback((containerRef) => {
    const firstFocusable = containerRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, []);
  
  return { trapFocus, focusFirst };
};

/**
 * Keyboard navigation helper
 */
export const useKeyboardNavigation = (handlers, deps = []) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (handlers[key]) {
        handlers[key](e);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, deps);
};
