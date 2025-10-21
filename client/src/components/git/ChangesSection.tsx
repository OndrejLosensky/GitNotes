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

  const handleStageAll = async () => {
    if (unstagedChanges.length === 0) return;
    
    try {
      const filesToStage = unstagedChanges.map(change => change.path);
      await apiClient.post('/git/stage', { files: filesToStage });
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to stage all files');
    }
  };

  const handleUnstageAll = async () => {
    if (stagedChanges.length === 0) return;
    
    try {
      const filesToUnstage = stagedChanges.map(change => change.path);
      await apiClient.post('/git/unstage', { files: filesToUnstage });
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unstage all files');
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
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
    <div className="flex flex-col h-full">
      <div 
        className="px-4 py-2 border-b sticky top-0 z-10"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Changes ({allChanges.length})
        </h3>
      </div>

      {/* Always visible commit section */}
      <div className="px-4 py-3">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Commit Message
            </label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 resize-none"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = `0 0 0 2px var(--color-primary)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
              rows={2}
            />
          </div>
          <button
            onClick={handleCommit}
            disabled={committing || stagedCount === 0}
            className="w-full px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: committing || stagedCount === 0 ? 'var(--text-tertiary)' : 'var(--color-primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!committing && stagedCount > 0) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!committing && stagedCount > 0) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }
            }}
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
          {(gitStatus?.ahead ?? 0) > 0 && (
            <button
              onClick={handlePush}
              disabled={pushing}
              className="w-full px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: pushing ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!pushing) {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!pushing) {
                  e.currentTarget.style.backgroundColor = 'var(--text-secondary)';
                }
              }}
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
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No changes</p>
        </div>
      ) : (
        <div>
          {/* Staged Changes */}
          {stagedChanges.length > 0 && (
            <>
              <div 
                className="px-4 py-2 border-b sticky top-0 z-10"
                style={{
                  backgroundColor: 'var(--sidebar-active)',
                  borderColor: 'var(--color-primary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                    Staged Changes ({stagedChanges.length})
                  </h4>
                  {stagedChanges.length > 0 && (
                    <button
                      onClick={handleUnstageAll}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Unstage all files"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {stagedChanges.map((change, index) => (
                <div
                  key={`staged-${change.path}-${index}`}
                  className="px-4 py-2 flex items-center gap-2 border-b"
                  style={{ borderColor: 'var(--border-light)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {change.path}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUnstageFile(change.path)}
                      className="p-1 rounded"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--sidebar-active)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-tertiary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Unstage file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-medium uppercase" style={{ color: 'var(--color-primary)' }}>
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
              <div 
                className="px-4 py-2 border-b sticky top-0 z-10"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Unstaged Changes ({unstagedChanges.length})
                  </h4>
                  <button
                    onClick={handleStageAll}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Stage all files"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              {unstagedChanges.map((change, index) => (
                <div
                  key={`unstaged-${change.path}-${index}`}
                  className="px-4 py-2 flex items-center gap-2 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-light)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {change.path}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStageFile(change.path)}
                      className="p-1 rounded"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--sidebar-active)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-tertiary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Stage file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <span 
                      className="text-xs font-medium uppercase"
                      style={{
                        color: change.type === 'modified' ? 'var(--git-modified)' :
                               change.type === 'untracked' ? 'var(--text-secondary)' :
                               change.type === 'deleted' ? 'var(--git-deleted)' :
                               'var(--text-tertiary)'
                      }}
                    >
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

