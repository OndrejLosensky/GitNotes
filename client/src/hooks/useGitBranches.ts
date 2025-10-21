import { useState, useEffect, useCallback } from 'react';
import { type Branch, type BranchList } from '../types';
import apiClient from '../api/client';
import { useAppContext } from '../contexts/AppContext';

export function useGitBranches(autoRefresh: boolean = true, refreshInterval: number = 10000) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerRefresh } = useAppContext();

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<BranchList>('/git/branches');
      setBranches(response.data.branches);
      setCurrentBranch(response.data.current);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch branches';
      setError(errorMessage);
      console.error('Failed to fetch branches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBranch = useCallback(async (name: string, from?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.post<Branch>('/git/branches', {
        name,
        from
      });
      
      // Refresh branches after creation
      await fetchBranches();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create branch';
      setError(errorMessage);
      console.error('Failed to create branch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  const checkoutBranch = useCallback(async (name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.post('/git/checkout', {
        branch: name
      });
      
      // Update current branch immediately
      setCurrentBranch(name);
      
      // Refresh branches to get updated current status
      await fetchBranches();
      
      // Trigger refresh for both notes and commits after branch switch
      triggerRefresh('all');
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to checkout branch';
      setError(errorMessage);
      console.error('Failed to checkout branch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBranches, triggerRefresh]);

  const deleteBranch = useCallback(async (name: string, force: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/git/branches/${encodeURIComponent(name)}${force ? '?force=true' : ''}`;
      await apiClient.delete(url);
      
      // Refresh branches after deletion
      await fetchBranches();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete branch';
      setError(errorMessage);
      console.error('Failed to delete branch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  // Auto-refresh effect
  useEffect(() => {
    fetchBranches();
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchBranches, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBranches, autoRefresh, refreshInterval]);

  return {
    branches,
    currentBranch,
    loading,
    error,
    fetchBranches,
    createBranch,
    checkoutBranch,
    deleteBranch
  };
}
