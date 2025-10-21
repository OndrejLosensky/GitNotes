interface StatusDotProps {
  status?: 'unmodified' | 'modified' | 'untracked' | 'staged' | 'deleted' | 'added';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  if (!status || status === 'unmodified') return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'modified':
        return 'var(--git-modified)';
      case 'untracked':
      case 'staged':
      case 'unmodified':
        return 'var(--text-tertiary)';
      case 'added':
        return 'var(--git-added)';
      case 'deleted':
        return 'var(--git-deleted)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <div
      className={`rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: getStatusColor(status) }}
      title={status}
    />
  );
}

