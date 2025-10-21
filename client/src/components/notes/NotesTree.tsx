import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { useNoteSearch } from '../../hooks/useNoteSearch';
import { type SearchResult, type TreeNode } from '../../types';
import NoteItem from './NoteItem.tsx';
import CreateItemModal from './CreateItemModal.tsx';
import ContextMenu from './ContextMenu.tsx';

export default function NotesTree() {
  const navigate = useNavigate();
  const { notesTree, loading, error, refetch, deleteItem } = useNotes();
  const { searchQuery, setSearchQuery, searchResults, loading: searchLoading, error: searchError, clearSearch } = useNoteSearch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    node: TreeNode;
    position: { x: number; y: number };
  } | null>(null);

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

  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      node,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleDeleteItem = async (path: string) => {
    try {
      await deleteItem(path);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
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
      <div 
        className="px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Explorer
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded transition-all duration-200"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.backgroundColor = 'var(--sidebar-active)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
            <svg 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-7 pr-8 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = `0 0 0 1px var(--color-primary)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{ borderColor: 'var(--color-primary)' }}></div>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Searching...</p>
              </div>
            ) : searchError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-error)' }}>Search failed</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>No results found</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Try a different search term</p>
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.path}
                  onClick={() => handleSearchResultClick(result)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-light)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {result.name}
                      </h4>
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {result.matches} match{result.matches !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {result.path}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>No files found</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Create a new note to get started</p>
            </div>
          ) : (
              <div className="py-2">
                {notesTree.map((node) => (
                  <NoteItem 
                    key={node.path} 
                    node={node} 
                    level={0} 
                    onContextMenu={(e) => handleContextMenu(e, node)}
                  />
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

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            node={contextMenu.node}
            onDelete={handleDeleteItem}
            isOpen={true}
            onClose={closeContextMenu}
            position={contextMenu.position}
          />
        )}
      </div>
    );
  }

