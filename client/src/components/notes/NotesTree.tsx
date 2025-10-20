import { useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import NoteItem from './NoteItem.tsx';
import CreateItemModal from './CreateItemModal.tsx';

export default function NotesTree() {
  const { notesTree, loading, error, refetch } = useNotes();
  const [showCreateModal, setShowCreateModal] = useState(false);


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
            onClick={() => setShowCreateModal(true)}
            className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-all duration-200"
            title="Create New Item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notesTree.length === 0 ? (
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

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refetch}
        notesTree={notesTree}
      />
    </div>
  );
}

