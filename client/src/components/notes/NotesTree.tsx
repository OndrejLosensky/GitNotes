import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { useNoteSearch } from '../../hooks/useNoteSearch';
import { type SearchResult } from '../../types';
import NoteItem from './NoteItem.tsx';
import CreateItemModal from './CreateItemModal.tsx';

export default function NotesTree() {
  const navigate = useNavigate();
  const { notesTree, loading, error, refetch } = useNotes();
  const { searchQuery, setSearchQuery, searchResults, loading: searchLoading, error: searchError, clearSearch } = useNoteSearch();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSearchResultClick = (result: SearchResult) => {
    navigate(`/note/${result.path}`);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
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
            onClick={() => setShowCreateModal(true)}
            className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-all duration-200"
            title="Create New Item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {/* Search Input */}
        <div className="mt-3 relative">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-7 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          // Search Results
          <div className="py-2">
            {searchLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Searching...</p>
              </div>
            ) : searchError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-red-500 mb-2">Search failed</p>
                <p className="text-xs text-gray-400">{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-gray-500 mb-2">No results found</p>
                <p className="text-xs text-gray-400">Try a different search term</p>
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.path}
                  onClick={() => handleSearchResultClick(result)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {result.matches} match{result.matches !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {result.path}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {highlightMatch(result.snippet, searchQuery)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Normal Notes Tree
          notesTree.length === 0 ? (
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
          )
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

