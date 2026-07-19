import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { cn } from '../../utils/helpers';
import styles from './Toast.module.css';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const Toast = ({ id, type = 'info', message }) => {
  const removeToast = useAppStore(state => state.removeToast);
  const Icon = icons[type];

  return (
    <div className={cn(styles.toast, styles[type])}>
      <Icon className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={() => removeToast(id)}>
        <X />
      </button>
      <div className={styles.progress} />
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useAppStore(state => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
