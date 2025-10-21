import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { type CommitDetails } from '../types';

export function useCommitDetails(commitHash: string | null) {
  const [commitDetails, setCommitDetails] = useState<CommitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!commitHash) {
      setCommitDetails(null);
      setError(null);
      return;
    }

    const fetchCommitDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/git/commits/${commitHash}`);
        setCommitDetails(response.data);
      } catch (err: any) {
        console.error('Failed to fetch commit details:', err);
        setError(err.response?.data?.message || 'Failed to load commit details');
        setCommitDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitDetails();
  }, [commitHash]);

  return { commitDetails, loading, error };
}

