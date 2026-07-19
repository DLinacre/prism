import { cn } from '../../utils/helpers';
import styles from './Card.module.css';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      className={cn(
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        interactive && styles.interactive,
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }) => (
  <div className={cn(styles.header, className)}>{children}</div>
);

const CardBody = ({ children, className }) => (
  <div className={cn(styles.body, className)}>{children}</div>
);

const CardFooter = ({ children, className }) => (
  <div className={cn(styles.footer, className)}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
