import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';
import styles from './Button.module.css';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className={styles.spinner} />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={styles.icon} />
      )}
      <span className={styles.content}>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={styles.icon} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
