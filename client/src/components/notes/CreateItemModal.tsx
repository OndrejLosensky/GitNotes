import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type TreeNode } from '../../types';
import apiClient from '../../api/client';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdPath?: string) => void;
  notesTree: TreeNode[];
}

interface PathOption {
  path: string;
  displayName: string;
  level: number;
}

export default function CreateItemModal({ isOpen, onClose, onSuccess, notesTree }: CreateItemModalProps) {
  const [itemType, setItemType] = useState<'note' | 'folder'>('note');
  const [itemName, setItemName] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [creating, setCreating] = useState(false);

  // Generate path options from the tree
  const pathOptions: PathOption[] = [
    { path: '', displayName: 'Root', level: 0 },
    ...generatePathOptions(notesTree, ''),
  ];

  function generatePathOptions(nodes: TreeNode[], basePath: string, level: number = 1): PathOption[] {
    const options: PathOption[] = [];
    
    nodes.forEach(node => {
      if (node.type === 'folder') {
        const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
        options.push({
          path: fullPath,
          displayName: '  '.repeat(level) + node.name,
          level
        });
        
        // Recursively add children
        if (node.children) {
          options.push(...generatePathOptions(node.children, fullPath, level + 1));
        }
      }
    });
    
    return options;
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setSelectedPath('');
      setItemType('note');
    }
  }, [isOpen]);

  // Generate default name based on type
  useEffect(() => {
    if (itemType === 'note') {
      setItemName('untitled-note.md');
    } else {
      setItemName('untitled-folder');
    }
  }, [itemType]);

  const handleCreate = async () => {
    if (!itemName.trim()) return;

    setCreating(true);
    try {
      if (itemType === 'note') {
        // Ensure the name ends with .md
        const noteName = itemName.endsWith('.md') ? itemName : `${itemName}.md`;
        const fullPath = selectedPath ? `${selectedPath}/${noteName}` : noteName;
        
        await apiClient.post('/notes', {
          name: noteName,
          path: selectedPath || '', // Empty string if root
          content: ' ', // Single space to satisfy the "not empty" requirement
        });
        
        onSuccess(fullPath);
      } else {
        // For folders, use the folders endpoint
        const fullPath = selectedPath ? `${selectedPath}/${itemName}` : itemName;
        
        await apiClient.post('/notes/folders', {
          name: itemName,
          parentPath: selectedPath || '',
        });
        
        onSuccess(fullPath);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to create ${itemType}`;
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}
    >
      <div 
        className="rounded-lg shadow-xl w-96 max-w-[90vw]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create New {itemType === 'note' ? 'Note' : 'Folder'}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setItemType('note')}
                className="flex-1 px-3 py-2 text-sm rounded-md border transition-colors"
                style={{
                  backgroundColor: itemType === 'note' ? 'var(--sidebar-active)' : 'var(--bg-secondary)',
                  borderColor: itemType === 'note' ? 'var(--color-primary)' : 'var(--border-color)',
                  color: itemType === 'note' ? 'var(--color-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (itemType !== 'note') {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (itemType !== 'note') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Note
                </div>
              </button>
              <button
                onClick={() => setItemType('folder')}
                className="flex-1 px-3 py-2 text-sm rounded-md border transition-colors"
                style={{
                  backgroundColor: itemType === 'folder' ? 'var(--sidebar-active)' : 'var(--bg-secondary)',
                  borderColor: itemType === 'folder' ? 'var(--color-primary)' : 'var(--border-color)',
                  color: itemType === 'folder' ? 'var(--color-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (itemType !== 'folder') {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (itemType !== 'folder') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Folder
                </div>
              </button>
            </div>
          </div>

          {/* Path Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Location
            </label>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {pathOptions.map((option) => (
                <option key={option.path} value={option.path}>
                  {option.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder={itemType === 'note' ? 'my-note.md' : 'my-folder'}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex justify-end gap-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !itemName.trim()}
            className="px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2"
            style={{
              backgroundColor: creating || !itemName.trim() ? 'var(--text-tertiary)' : 'var(--color-primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!creating && itemName.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!creating && itemName.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {creating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create {itemType === 'note' ? 'Note' : 'Folder'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
