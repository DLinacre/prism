import { getAvatarColor, getInitials, cn } from '../../utils/helpers';
import styles from './Avatar.module.css';

const Avatar = ({
  name,
  src,
  size = 'md',
  status,
  className,
  ...props
}) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={cn(styles.avatar, styles[size], className)}
      style={{ '--avatar-color': bgColor }}
      title={name}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
      {status && (
        <span className={cn(styles.status, styles[status])} />
      )}
    </div>
  );
};

export default Avatar;
