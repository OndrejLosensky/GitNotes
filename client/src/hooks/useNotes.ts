import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { type Note, type TreeNode } from '../types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesTree, setNotesTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notesResponse, treeResponse] = await Promise.all([
        apiClient.get('/notes'),
        apiClient.get('/notes/tree')
      ]);
      setNotes(notesResponse.data.notes || []);
      setNotesTree(treeResponse.data.tree || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    notesTree,
    loading,
    error,
    refetch: fetchNotes,
  };
}

