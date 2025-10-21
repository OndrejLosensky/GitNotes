import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { type CommitInfo } from '../../types';
import CommitList from '../../components/git/CommitList';
import CommitDetail from '../../components/git/CommitDetail';
import { useCommitDetails } from '../../hooks/useCommitDetails';

export default function HistoryPage() {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  
  const { commitDetails, loading: detailsLoading, error: detailsError } = useCommitDetails(selectedHash);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await apiClient.get('/git/history?limit=50');
        setCommits(response.data.commits || []);
      } catch (error) {
        console.error('Failed to fetch commits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  return (
    <div className="h-full flex">
      {/* Left Panel - Commit List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Commit History
          </h2>
          {!loading && (
            <p className="text-xs text-gray-500 mt-1">
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
      <div className="flex-1 bg-white">
        <CommitDetail 
          commitDetails={commitDetails}
          loading={detailsLoading}
          error={detailsError}
        />
      </div>
    </div>
  );
}
