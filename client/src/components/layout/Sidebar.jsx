import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut
} from 'lucide-react';
import useAppStore from '../../stores/appStore';
import useAuthStore from '../../stores/authStore';
import { Avatar } from '../ui';
import { cn } from '../../utils/helpers';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <aside className={cn(styles.sidebar, sidebarCollapsed && styles.collapsed)}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" className={styles.logoIcon}>
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <polygon points="16,2 28,28 4,28" fill="url(#logoGrad)" />
            <polygon points="16,8 23,24 9,24" fill="#0a0a0f" />
          </svg>
          {!sidebarCollapsed && <span className={styles.logoText}>Prism</span>}
        </div>
        <button className={styles.toggle} onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(styles.navItem, isActive && styles.active)
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className={styles.navIcon} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {!sidebarCollapsed && (
          <button className={styles.newProject}>
            <Plus className={styles.newIcon} />
            <span>New Project</span>
          </button>
        )}

        <div className={styles.user}>
          <Avatar name={user?.name} size="sm" />
          {!sidebarCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
          )}
          {!sidebarCollapsed && (
            <button className={styles.logoutBtn} onClick={logout} title="Sign out">
              <LogOut />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
