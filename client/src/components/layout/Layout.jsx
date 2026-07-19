import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from '../ui/Toast';
import useAppStore from '../../stores/appStore';
import { cn } from '../../utils/helpers';
import styles from './Layout.module.css';

const Layout = () => {
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={cn(styles.main, sidebarCollapsed && styles.collapsed)}>
        <Outlet />
      </main>
      <Toast />
    </div>
  );
};

export default Layout;
