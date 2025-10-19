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
    <div className="py-2">
      <div className="px-4 py-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Notes
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          title="New Note"
        >
          +
        </button>
      </div>
      
      {showCreate && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Note name (e.g., my-note.md)"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Note content..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              rows={3}
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateNote}
                disabled={creating}
                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notesTree.length === 0 && !showCreate ? (
        <div className="px-4 py-8 text-sm text-gray-500 text-center">
          No notes found
        </div>
      ) : (
        <div>
          {notesTree.map((node) => (
            <NoteItem key={node.path} node={node} level={0} />
          ))}
        </div>
      )}
    </div>
  );
}

