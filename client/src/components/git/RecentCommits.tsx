import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { type CommitInfo } from '../../types';

export default function RecentCommits() {
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

  if (loading) {
    return (
      <div className="p-4 text-xs text-gray-500 text-center">
        Loading commits...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-500 text-center">
        No commits found
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-4 py-1">
        <h3 className="text-xs font-medium text-gray-500">
          Recent Commits
        </h3>
      </div>
      <div className="space-y-2 px-4 py-2">
        {commits.map((commit) => (
          <div key={commit.hash} className="text-xs">
            <div className="flex items-center gap-2">
              <code className="text-[10px] bg-gray-100 px-1 rounded font-mono">
                {commit.hash.substring(0, 7)}
              </code>
              <span className="text-gray-500 text-[10px]">
                {formatDate(commit.date)}
              </span>
            </div>
            <p className="text-gray-700 truncate mt-1">{commit.message}</p>
            <p className="text-gray-400 text-[10px]">{commit.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

