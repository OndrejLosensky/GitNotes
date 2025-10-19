interface StatusDotProps {
  status?: 'unmodified' | 'modified' | 'untracked' | 'staged' | 'deleted';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  if (!status || status === 'unmodified') return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    modified: 'bg-yellow-400',
    untracked: 'bg-gray-400',
    staged: 'bg-blue-400',
    deleted: 'bg-red-400',
    unmodified: 'bg-green-400',
  };

  return (
    <div
      className={`rounded-full ${sizeClasses[size]} ${colorClasses[status]}`}
      title={status}
    />
  );
}

