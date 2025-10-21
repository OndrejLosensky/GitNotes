import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { type CommitInfo } from '../../types';

interface RecentCommitsProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function RecentCommits({ isCollapsed, onToggle }: RecentCommitsProps) {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await apiClient.get('/git/history?limit=10');
        setCommits(response.data.commits || []);
      } catch (error) {
        console.error('Failed to fetch commits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []); 

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
        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          History
        </h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-xs text-gray-500 text-center">
              Loading commits...
            </div>
          ) : commits.length === 0 ? (
            <div className="p-4 text-xs text-gray-500 text-center">
              No commits found
            </div>
          ) : (
            <div className="space-y-2 px-4 py-2">
              {commits.map((commit) => (
                <div key={commit.hash} className="text-xs py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[10px] bg-gray-100 px-1 rounded font-mono text-gray-600">
                      {commit.hash.substring(0, 7)}
                    </code>
                    <span className="text-gray-500 text-[10px]">
                      {formatDate(commit.date)}
                    </span>
                  </div>
                  <p className="text-gray-700 truncate text-sm font-medium">{commit.message}</p>
                  <p className="text-gray-400 text-[10px]">{commit.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

