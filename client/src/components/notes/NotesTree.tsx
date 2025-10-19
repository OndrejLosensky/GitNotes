import { useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import NoteItem from './NoteItem.tsx';
import apiClient from '../../api/client';

export default function NotesTree() {
  const { notesTree, loading, error, refetch } = useNotes();
  const [showCreate, setShowCreate] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateNote = async () => {
    if (!newNoteName.trim() || !newNoteContent.trim()) return;

    setCreating(true);
    try {
      await apiClient.post('/notes', {
        name: newNoteName,
        path: '',
        content: newNoteContent,
      });
      setNewNoteName('');
      setNewNoteContent('');
      setShowCreate(false);
      await refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        Loading notes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Explorer
          </h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-all duration-200"
            title="New Note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      {showCreate && (
        <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File Name
              </label>
              <input
                type="text"
                placeholder="my-note.md"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                placeholder="Start writing your note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                disabled={creating}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Note'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {notesTree.length === 0 && !showCreate ? (
          <div className="px-4 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500 mb-2">No files found</p>
            <p className="text-xs text-gray-400">Create a new note to get started</p>
          </div>
        ) : (
          <div className="py-2">
            {notesTree.map((node) => (
              <NoteItem key={node.path} node={node} level={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

