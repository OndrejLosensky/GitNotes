import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import { type CommitInfo } from '../../types';
import CommitList from '../../components/git/CommitList';
import CommitDetail from '../../components/git/CommitDetail';
import HistoryToolbar from '../../components/git/HistoryToolbar';
import { useCommitDetails } from '../../hooks/useCommitDetails';
import { useAppContext } from '../../contexts/AppContext';

export default function HistoryPage() {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  
  const { commitDetails, loading: detailsLoading, error: detailsError } = useCommitDetails(selectedHash);
  const { registerRefreshCallback } = useAppContext();

  const fetchCommits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/git/history?limit=50');
      setCommits(response.data.commits || []);
    } catch (error) {
      console.error('Failed to fetch commits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommits();
    
    // Register this component's refresh callback
    registerRefreshCallback('commits', fetchCommits);
  }, [registerRefreshCallback, fetchCommits]);

  return (
    <div className="h-full flex">
      {/* Left Panel - Commit List */}
      <div 
        className="w-80 border-r flex flex-col"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div 
          className="px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Commit History
          </h2>
          {!loading && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {commits.length} commit{commits.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <CommitList 
            commits={commits}
            selectedHash={selectedHash}
            onSelect={setSelectedHash}
            loading={loading}
          />
        </div>
      </div>

      {/* Right Panel - Commit Details */}
      <div className="flex-1" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <CommitDetail 
          commitDetails={commitDetails}
          loading={detailsLoading}
          error={detailsError}
        />
      </div>
    </div>
  );
}

// Export the toolbar component separately so App.tsx can use it
export function HistoryToolbarWrapper() {
  const { triggerRefresh } = useAppContext();

  const handleRefreshCommits = () => {
    // This will be handled by the HistoryPage component
    triggerRefresh('commits');
  };

  const handleRefreshNotes = () => {
    triggerRefresh('notes');
  };

  return (
    <HistoryToolbar 
      onRefreshCommits={handleRefreshCommits}
      onRefreshNotes={handleRefreshNotes}
    />
  );
}
