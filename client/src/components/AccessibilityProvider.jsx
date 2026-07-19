import { useEffect, useState, createContext, useContext } from 'react';

/**
 * Accessibility Context for managing a11y preferences
 */
const AccessibilityContext = createContext({
  reducedMotion: false,
  highContrast: false,
  announcements: []
});

/**
 * Hook to use accessibility context
 */
export const useAccessibility = () => useContext(AccessibilityContext);

/**
 * Accessibility Provider Component
 * Handles:
 * - Reduced motion preferences
 * - High contrast mode
 * - Screen reader announcements
 * - Keyboard navigation detection
 */
export const AccessibilityProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Check high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e) => setHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Detect keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboard(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboard(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Store keyboard state on body for CSS
    const updateBody = () => {
      document.body.setAttribute('data-keyboard', isKeyboard);
    };
    
    updateBody();

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isKeyboard]);

  // Announce to screen readers
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  const value = {
    reducedMotion,
    highContrast,
    isKeyboard,
    announce,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Live Region for Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => a.message)
          .join('. ')}
      </div>
      
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => a.message)
          .join('. ')}
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
