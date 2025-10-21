import { type CommitInfo } from '../../types';

interface CommitListProps {
  commits: CommitInfo[];
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  loading: boolean;
}

export default function CommitList({ commits, selectedHash, onSelect, loading }: CommitListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading commits...</p>
        </div>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No commits found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {commits.map((commit) => (
        <button
          key={commit.hash}
          onClick={() => onSelect(commit.hash)}
          className="w-full text-left px-4 py-3 border-b transition-colors"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: selectedHash === commit.hash ? 'var(--sidebar-active)' : 'transparent',
            borderLeft: selectedHash === commit.hash ? '4px solid var(--color-primary)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedHash !== commit.hash) {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedHash !== commit.hash) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div className="flex items-start gap-2 mb-1">
            <code 
              className="text-xs px-2 py-0.5 rounded font-mono flex-shrink-0"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              {commit.hash.substring(0, 7)}
            </code>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              {formatDate(commit.date)}
            </span>
          </div>
          <p className="text-sm font-medium line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            {commit.message}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
            {commit.author}
          </p>
        </button>
      ))}
    </div>
  );
}

