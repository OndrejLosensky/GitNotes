import React, { useState, useRef, useEffect } from 'react';
import { type TreeNode } from '../../types';

interface ContextMenuProps {
  node: TreeNode;
  onDelete: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function ContextMenu({ node, onDelete, isOpen, onClose, position }: ContextMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError(null);
    console.log('Confirming deletion of:', { name: node.name, path: node.path, type: node.type });
    try {
      await onDelete(node.path);
      onClose();
    } catch (error: any) {
      // Handle both string and Error object errors
      const errorMsg = typeof error === 'string' ? error : (error.message || 'Failed to delete item');
      console.error('Failed to delete item:', errorMsg);
      setDeleteError(errorMsg);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  if (!isOpen) return null;

  const itemType = node.type === 'file' ? 'note' : 'folder';
  const itemName = node.name;

  return (
    <div
      ref={menuRef}
      className="fixed border rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {!showDeleteConfirm ? (
        <button
          onClick={handleDeleteClick}
          className="w-full px-3 py-2 text-left text-sm flex items-center transition-colors"
          style={{ color: 'var(--color-error)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete {itemType}
        </button>
      ) : (
        <div className="px-3 py-2">
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Delete "{itemName}"?
          </div>
          {deleteError && (
            <div className="text-xs mb-2 p-2 rounded" style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              {deleteError}
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleConfirmDelete}
              className="px-2 py-1 text-xs text-white rounded transition-colors"
              style={{ backgroundColor: 'var(--color-error)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-2 py-1 text-xs rounded transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
