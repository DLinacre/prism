import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';
import styles from './Select.module.css';

const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select...',
  error,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn(styles.container, containerClassName)}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={cn(styles.selectWrapper, error && styles.hasError)}>
        <select
          ref={ref}
          className={cn(styles.select, className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.icon} />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
