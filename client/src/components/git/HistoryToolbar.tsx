import { useState } from 'react';
import { useGitBranches } from '../../hooks/useGitBranches';
import { useGitStatus } from '../../hooks/useGitStatus';
import BranchModal from './BranchModal';
import apiClient from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';

interface HistoryToolbarProps {
  onRefreshCommits: () => void;
  onRefreshNotes: () => void;
}

export default function HistoryToolbar({ onRefreshCommits, onRefreshNotes }: HistoryToolbarProps) {
  const { branches, currentBranch, checkoutBranch, loading: branchesLoading } = useGitBranches(false);
  const { gitStatus, refetch: refetchGitStatus } = useGitStatus();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);

  const handleBranchSwitch = async (branchName: string) => {
    if (branchName === currentBranch) return;
    
    const success = await checkoutBranch(branchName);
    if (success) {
      setShowBranchDropdown(false);
      // Trigger refresh for both notes and commits
      onRefreshCommits();
      onRefreshNotes();
    }
  };

  const handlePull = async () => {
    setPulling(true);
    try {
      const response = await apiClient.post('/git/pull');
      showSuccess(`Pull successful: ${response.data.message}`);
      // Refresh everything after pull
      await refetchGitStatus();
      onRefreshCommits();
      onRefreshNotes();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to pull from GitHub');
    } finally {
      setPulling(false);
    }
  };

  const handlePush = async () => {
    setPushing(true);
    try {
      const response = await apiClient.post('/git/push');
      showSuccess(`Push successful: ${response.data.message}`);
      // Refresh everything after push
      await refetchGitStatus();
      onRefreshCommits();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to push to GitHub';
      if (error.response?.status === 409) {
        showError(`${errorMessage}. Try pulling the latest changes first.`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setPushing(false);
    }
  };

  const handleBranchModalSuccess = () => {
    setShowBranchModal(false);
    onRefreshCommits();
    onRefreshNotes();
  };

  const aheadCount = gitStatus?.ahead || 0;
  const behindCount = gitStatus?.behind || 0;

  return (
    <>
      <div 
        className="px-4 py-[8px] border-b flex items-center justify-between"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Left side - Branch info and switcher */}
        <div className="flex items-center gap-4">
          {/* Current branch indicator */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
              {currentBranch}
            </span>
            {aheadCount > 0 && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                +{aheadCount}
              </span>
            )}
            {behindCount > 0 && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-warning)',
                  color: 'white',
                }}
              >
                -{behindCount}
              </span>
            )}
          </div>

          {/* Branch switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              disabled={branchesLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md transition-colors whitespace-nowrap"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!branchesLoading) {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!branchesLoading) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs">Switch Branch</span>
            </button>

            {showBranchDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg border z-50"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="py-1">
                  {/* Create Branch button at the top */}
                  <button
                    onClick={() => {
                      setShowBranchDropdown(false);
                      setShowBranchModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Branch</span>
                  </button>
                  
                  {/* Separator */}
                  <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }}></div>
                  
                  {/* Branch list */}
                  {branches.map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => handleBranchSwitch(branch.name)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-opacity-10"
                      style={{
                        color: branch.current ? 'var(--color-primary)' : 'var(--text-primary)',
                        backgroundColor: branch.current ? 'var(--sidebar-active)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!branch.current) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!branch.current) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{branch.name}</span>
                      {branch.current && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Pull button */}
          <button
            onClick={handlePull}
            disabled={pulling}
            className="flex items-center gap-1 px-2 py-1 text-xs border rounded transition-colors whitespace-nowrap"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!pulling) {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!pulling) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            {pulling ? (
              <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            <span className="text-xs">{pulling ? 'Pulling...' : 'Pull'}</span>
          </button>

          {/* Push button */}
          <button
            onClick={handlePush}
            disabled={pushing || aheadCount === 0}
            className="flex items-center gap-1 px-2 py-1 text-xs border rounded transition-colors whitespace-nowrap"
            style={{
              backgroundColor: aheadCount > 0 ? 'var(--color-primary)' : 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: aheadCount > 0 ? 'white' : 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              if (!pushing && aheadCount > 0) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!pushing && aheadCount > 0) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {pushing ? (
              <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span className="text-xs">{pushing ? 'Pushing...' : 'Push'}</span>
          </button>
        </div>
      </div>

      {/* Branch Modal */}
      <BranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSuccess={handleBranchModalSuccess}
        branches={branches}
        currentBranch={currentBranch}
      />

      {/* Click outside to close dropdown */}
      {showBranchDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowBranchDropdown(false)}
        />
      )}
    </>
  );
}
