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

  const colorClasses = {
    modified: 'bg-yellow-400',  // Yellow for modified files
    untracked: 'bg-gray-400',   // Gray for untracked files
    added: 'bg-green-400',      // Green for new added files
    staged: 'bg-gray-400',      // Gray for staged files
    deleted: 'bg-red-400',
    unmodified: 'bg-gray-400',  // Gray for unchanged files
  };

  return (
    <div
      className={`rounded-full ${sizeClasses[size]} ${colorClasses[status]}`}
      title={status}
    />
  );
}

