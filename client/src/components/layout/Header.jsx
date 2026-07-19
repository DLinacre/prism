import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, X } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { Avatar, Badge } from '../ui';
import { cn } from '../../utils/helpers';
import styles from './Header.module.css';

const Header = ({ title, subtitle, actions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const { notifications, unreadCount, markAllNotificationsRead } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleSection}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.right}>
        <div className={cn(styles.search, showSearch && styles.active)}>
          <Search className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {showSearch && (
            <button
              className={styles.searchClose}
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <X />
            </button>
          )}
          {!showSearch && (
            <button
              className={styles.searchToggle}
              onClick={() => setShowSearch(true)}
            >
              <Search />
            </button>
          )}
        </div>

        <button className={styles.iconBtn} title="Notifications">
          <Bell />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {actions}

        <button className={styles.quickAdd} onClick={() => navigate('/projects/new')}>
          <Plus />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
