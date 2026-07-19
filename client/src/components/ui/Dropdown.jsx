import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';
import styles from './Dropdown.module.css';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      let left = rect.left + scrollLeft;
      if (align === 'right') {
        left = rect.right + scrollLeft;
      }

      setPosition({
        top: rect.bottom + scrollTop + 4,
        left
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} className={styles.trigger}>
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={cn(styles.menu, styles[align], className)}
          style={{ top: position.top, left: align === 'right' ? 'auto' : position.left, right: align === 'right' ? window.innerWidth - position.left : 'auto' }}
          onClick={() => setIsOpen(false)}
        >
          {typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children}
        </div>,
        document.body
      )}
    </>
  );
};

const DropdownItem = ({ children, icon: Icon, onClick, danger, disabled, ...props }) => (
  <button
    className={cn(styles.item, danger && styles.danger, disabled && styles.disabled)}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {Icon && <Icon className={styles.itemIcon} />}
    <span>{children}</span>
  </button>
);

const DropdownDivider = () => <div className={styles.divider} />;

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export default Dropdown;
