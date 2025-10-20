import { useState } from 'react';
import { useGitStatus } from '../../hooks/useGitStatus';
import apiClient from '../../api/client';

export default function ChangesSection() {
  const { gitStatus, loading, refetch } = useGitStatus();
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [pushing, setPushing] = useState(false);

  const handleCommit = async () => {
    if (!commitMessage.trim() || commitMessage.trim().length < 3) {
      alert('Commit message must be at least 3 characters');
      return;
    }

    if (stagedCount === 0) {
      alert('No staged files to commit. Stage files first.');
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

  const handlePush = async () => {
    setPushing(true);
    try {
      const response = await apiClient.post('/git/push');
      alert(`Push successful: ${response.data.message}`);
      await refetch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to push to GitHub';
      if (error.response?.status === 409) {
        alert(`${errorMessage}\n\nTry pulling the latest changes first.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setPushing(false);
    }
  };

  const handleStageFile = async (filePath: string) => {
    try {
      await apiClient.post('/git/stage', { files: [filePath] });
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to stage file');
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    try {
      await apiClient.post('/git/unstage', { files: [filePath] });
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unstage file');
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-xs text-gray-500 text-center">
        Loading changes...
      </div>
    );
  }

  // Separate staged and unstaged changes for better organization
  const stagedChanges = [
    ...(gitStatus?.staged || []).map(f => ({ ...f, type: 'staged' as const })),
  ];
  
  // Get all unstaged changes and filter out any that are already staged
  const stagedPaths = new Set(gitStatus?.staged?.map(f => f.path) || []);
  
  const unstagedChanges = [
    ...(gitStatus?.modified || []).filter(f => !stagedPaths.has(f.path)).map(f => ({ ...f, type: 'modified' as const })),
    ...(gitStatus?.untracked || []).filter(f => !stagedPaths.has(f.path)).map(f => ({ ...f, type: 'untracked' as const })),
    ...(gitStatus?.deleted || []).filter(f => !stagedPaths.has(f.path)).map(f => ({ ...f, type: 'deleted' as const })),
  ];

  const allChanges = [...stagedChanges, ...unstagedChanges];

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
            className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {committing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Committing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Commit {stagedCount} file{stagedCount > 1 ? 's' : ''}
              </>
            )}
          </button>
          
          {/* Push button - only show when there are commits ahead */}
          {gitStatus?.ahead && gitStatus.ahead > 0 && (
            <button
              onClick={handlePush}
              disabled={pushing}
              className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              {pushing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Pushing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Push to origin
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {allChanges.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-500">No changes</p>
        </div>
      ) : (
        <div>
          {/* Staged Changes */}
          {stagedChanges.length > 0 && (
            <>
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Staged Changes ({stagedChanges.length})
                </h4>
              </div>
              {stagedChanges.map((change, index) => (
                <div
                  key={`staged-${change.path}-${index}`}
                  className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {change.path}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUnstageFile(change.path)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                      title="Unstage file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-medium uppercase text-blue-600">
                      S
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Unstaged Changes */}
          {unstagedChanges.length > 0 && (
            <>
              {stagedChanges.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Unstaged Changes ({unstagedChanges.length})
                  </h4>
                </div>
              )}
              {unstagedChanges.map((change, index) => (
                <div
                  key={`unstaged-${change.path}-${index}`}
                  className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {change.path}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStageFile(change.path)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                      title="Stage file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <span className={`text-xs font-medium uppercase ${
                      change.type === 'modified' ? 'text-yellow-600' :
                      change.type === 'untracked' ? 'text-gray-600' :
                      change.type === 'deleted' ? 'text-red-600' :
                      'text-gray-400'
                    }`}>
                      {change.type.charAt(0)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

