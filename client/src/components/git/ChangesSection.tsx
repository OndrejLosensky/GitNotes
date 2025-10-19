import { useState } from 'react';
import { useGitStatus } from '../../hooks/useGitStatus';
import StatusDot from '../common/StatusDot.tsx';
import apiClient from '../../api/client';

export default function ChangesSection() {
  const { gitStatus, loading, refetch } = useGitStatus();
  const [showCommit, setShowCommit] = useState(false);
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
      setShowCommit(false);
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
    <div className="py-2">
      <div className="px-4 py-1 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-500">
          Changes ({allChanges.length})
        </h3>
        {stagedCount > 0 && (
          <button
            onClick={() => setShowCommit(!showCommit)}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            {showCommit ? 'Cancel' : 'Commit'}
          </button>
        )}
      </div>

      {showCommit && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="space-y-2">
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message..."
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleCommit}
              disabled={committing}
              className="w-full px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {committing ? 'Committing...' : `Commit ${stagedCount} file${stagedCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {allChanges.length === 0 ? (
        <div className="px-4 py-4 text-xs text-gray-500 text-center">
          No changes
        </div>
      ) : (
        <div className="space-y-1">
          {allChanges.map((change, index) => (
            <div
              key={`${change.path}-${index}`}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
            >
              <StatusDot status={change.type} size="sm" />
              <span className="flex-1 text-xs text-gray-700 truncate">
                {change.path}
              </span>
              <span className="text-xs text-gray-400 uppercase">
                {change.type.charAt(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

