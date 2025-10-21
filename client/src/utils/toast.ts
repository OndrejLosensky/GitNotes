import toast from 'react-hot-toast';

/**
 * Toast notification utilities with theme-aware styling
 */

const baseStyle = {
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  padding: '12px 16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

export const showSuccess = (message: string) => {
  return toast.success(message, {
    style: {
      ...baseStyle,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--color-success)',
    },
    iconTheme: {
      primary: 'var(--color-success)',
      secondary: 'var(--bg-secondary)',
    },
    duration: 3000,
  });
};

export const showError = (message: string) => {
  return toast.error(message, {
    style: {
      ...baseStyle,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--color-error)',
    },
    iconTheme: {
      primary: 'var(--color-error)',
      secondary: 'var(--bg-secondary)',
    },
    duration: 4000,
  });
};

export const showInfo = (message: string) => {
  return toast(message, {
    icon: 'ℹ️',
    style: {
      ...baseStyle,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--color-info)',
    },
    duration: 3000,
  });
};

export const showWarning = (message: string) => {
  return toast(message, {
    icon: '⚠️',
    style: {
      ...baseStyle,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--color-warning)',
    },
    duration: 3500,
  });
};

