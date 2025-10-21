import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import { type Note, type TreeNode } from '../types';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry {
  notes: Note[];
  notesTree: TreeNode[];
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  lastHit?: number;
  lastMiss?: number;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesTree, setNotesTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache reference
  const cacheRef = useRef<CacheEntry | null>(null);
  const cacheStatsRef = useRef<CacheStats>({ hits: 0, misses: 0 });

  const isCacheValid = useCallback((cache: CacheEntry | null): boolean => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  const logCacheHit = useCallback(() => {
    cacheStatsRef.current.hits++;
    cacheStatsRef.current.lastHit = Date.now();
  }, []);

  const logCacheMiss = useCallback(() => {
    cacheStatsRef.current.misses++;
    cacheStatsRef.current.lastMiss = Date.now();
  }, []);

  const fetchNotes = useCallback(async (forceRefresh: boolean = false) => {
    // Check cache first unless force refresh is requested
    if (!forceRefresh && isCacheValid(cacheRef.current)) {
      logCacheHit();
      setNotes(cacheRef.current!.notes);
      setNotesTree(cacheRef.current!.notesTree);
      return;
    }

    logCacheMiss();
    setLoading(true);
    setError(null);
    try {
      const [notesResponse, treeResponse] = await Promise.all([
        apiClient.get('/notes'),
        apiClient.get('/notes/tree')
      ]);
      
      const newNotes = notesResponse.data.notes || [];
      const newNotesTree = treeResponse.data.tree || [];
      
      // Update cache
      cacheRef.current = {
        notes: newNotes,
        notesTree: newNotesTree,
        timestamp: Date.now()
      };
      
      setNotes(newNotes);
      setNotesTree(newNotesTree);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, logCacheHit, logCacheMiss]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const deleteItem = async (path: string): Promise<void> => {
    try {
      // Encode each path segment separately to preserve the path structure
      const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
      await apiClient.delete(`/notes/${encodedPath}`);
      // Force refresh after deletion to get updated data
      await fetchNotes(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete item';
      setError(errorMessage);
      // Throw a simple string instead of Error object to avoid React rendering issues
      throw errorMessage;
    }
  };

  const invalidateCache = useCallback((reason?: string) => {
    cacheRef.current = null;
    console.log(`Notes cache invalidated${reason ? ` (${reason})` : ''}`);
  }, []);

  const getCacheStats = useCallback(() => {
    const stats = cacheStatsRef.current;
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? (stats.hits / total * 100).toFixed(1) : '0';
    
    return {
      ...stats,
      hitRate: `${hitRate}%`,
      total,
      cacheAge: cacheRef.current ? Date.now() - cacheRef.current.timestamp : null
    };
  }, []);

  return {
    notes,
    notesTree,
    loading,
    error,
    refetch: fetchNotes,
    deleteItem,
    invalidateCache,
    getCacheStats,
  };
}

