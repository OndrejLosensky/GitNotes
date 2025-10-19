import { useState } from 'react';
import { useGitStatus } from '../../hooks/useGitStatus';
import StatusDot from '../common/StatusDot.tsx';
import apiClient from '../../api/client';

export default function ChangesSection() {
  const { gitStatus, loading, refetch } = useGitStatus();
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);

  const handleCommit = async () => {
    if (!commitMessage.trim() || commitMessage.trim().length < 3) {
      alert('Commit message must be at least 3 characters');
      return;
    }

    setCommitting(true);
    try {
      const response = await apiClient.post('/git/commit', { message: commitMessage });
      alert(`Committed: ${response.data.hash.substring(0, 7)}`);
      setCommitMessage('');
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to commit');
    } finally {
      setCommitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-xs text-gray-500 text-center">
        Loading changes...
      </div>
    );
  }

  const allChanges = [
    ...(gitStatus?.modified || []).map(f => ({ ...f, type: 'modified' as const })),
    ...(gitStatus?.staged || []).map(f => ({ ...f, type: 'staged' as const })),
    ...(gitStatus?.untracked || []).map(f => ({ ...f, type: 'untracked' as const })),
    ...(gitStatus?.deleted || []).map(f => ({ ...f, type: 'deleted' as const })),
  ];

  const stagedCount = gitStatus?.staged.length || 0;

  return (
    <div>
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Changes ({allChanges.length})
        </h3>
      </div>

      {/* Always visible commit section */}
      <div className="px-4 py-3">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Commit Message
            </label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={handleCommit}
            disabled={committing || stagedCount === 0}
            className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {committing ? 'Committing...' : `Commit ${stagedCount} file${stagedCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {allChanges.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-500">No changes</p>
        </div>
      ) : (
        <div>
          {allChanges.map((change, index) => (
            <div
              key={`${change.path}-${index}`}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="flex-1 text-sm text-gray-700 truncate">
                {change.path}
              </span>
              <span className={`text-xs font-medium uppercase ${
                change.type === 'staged' ? 'text-blue-600' :
                change.type === 'modified' ? 'text-orange-600' :
                change.type === 'untracked' ? 'text-gray-600' :
                change.type === 'deleted' ? 'text-red-600' :
                'text-gray-400'
              }`}>
                {change.type.charAt(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

