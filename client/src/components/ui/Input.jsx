import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className,
  containerClassName,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const isSearch = type === 'search';

  return (
    <div className={cn(styles.container, containerClassName)}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={cn(styles.inputWrapper, error && styles.hasError)}>
        {(Icon || isSearch) && (
          <span className={styles.iconLeft}>
            {Icon || <Search />}
          </span>
        )}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            styles.input,
            (Icon || isSearch) && styles.hasIconLeft,
            isPassword && styles.hasIconRight,
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      {error && (
        <span className={styles.error}>
          <AlertCircle />
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
