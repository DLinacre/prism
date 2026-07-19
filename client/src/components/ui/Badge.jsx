import { cn } from '../../utils/helpers';
import styles from './Badge.module.css';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(styles.badge, styles[variant], styles[size], className)}
      {...props}
    >
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
};

export default Badge;
