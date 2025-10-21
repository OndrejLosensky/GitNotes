import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import { useAppContext } from '../../contexts/AppContext';
import { type CommitInfo } from '../../types';

interface RecentCommitsProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function RecentCommits({ isCollapsed, onToggle }: RecentCommitsProps) {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { registerRefreshCallback } = useAppContext();

  const fetchCommits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/git/history?limit=10');
      setCommits(response.data.commits || []);
    } catch (error) {
      console.error('Failed to fetch commits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommits();
    
    // Register refresh callback for commits
    registerRefreshCallback('commits', fetchCommits);
  }, [registerRefreshCallback, fetchCommits]); 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col">
      {/* Collapsible header */}
      <button
        onClick={onToggle}
        className="px-4 py-2 transition-colors border-b flex items-center justify-between cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          History
        </h3>
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Loading commits...
            </div>
          ) : commits.length === 0 ? (
            <div className="p-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              No commits found
            </div>
          ) : (
            <div className="space-y-2 px-4 py-2">
              {commits.map((commit) => (
                <div key={commit.hash} className="text-xs py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code 
                      className="text-[10px] px-1 rounded font-mono"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {commit.hash.substring(0, 7)}
                    </code>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(commit.date)}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{commit.message}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{commit.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

