import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { type GitStatus } from '../types';

export function useGitStatus(autoRefresh: boolean = false, interval: number = 5000) {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGitStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/git/status');
      setGitStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch git status');
      console.error('Failed to fetch git status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGitStatus();

    if (autoRefresh) {
      const intervalId = setInterval(fetchGitStatus, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, fetchGitStatus]);

  return {
    gitStatus,
    loading,
    error,
    refetch: fetchGitStatus,
  };
}

