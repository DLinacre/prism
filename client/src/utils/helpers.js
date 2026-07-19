import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  
  return format(d, 'MMM d, yyyy');
};

// Format relative time
export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Generate avatar color from name
export const getAvatarColor = (name) => {
  if (!name) return '#6366f1';
  
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Priority colors
export const priorityColors = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)'
};

// Status colors
export const statusColors = {
  backlog: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' },
  'in-progress': { bg: 'var(--info-muted)', text: 'var(--info)' },
  review: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
  completed: { bg: 'var(--success-muted)', text: 'var(--success)' }
};

// Status display names
export const statusNames = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'In Review',
  completed: 'Completed'
};

// Debounce function
export const debounce = (fn, ms) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

// Throttle function
export const throttle = (fn, ms) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
};

// Class name helper
export const cn = (...classes) => classes.filter(Boolean).join(' ');

// Generate random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Parse JSON safely
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};
