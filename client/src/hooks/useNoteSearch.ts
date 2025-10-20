import { useState, useEffect, useCallback } from 'react';
import { type SearchResult } from '../types';
import apiClient from '../api/client';

export function useNoteSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNotes = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<SearchResult[]>('/notes/search', {
        params: {
          q: query.trim()
        }
      });
      
      setSearchResults(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Search failed';
      setError(errorMessage);
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchNotes(searchQuery);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchNotes]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    searchNotes,
    clearSearch
  };
}
