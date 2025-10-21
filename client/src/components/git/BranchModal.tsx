import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type Branch } from '../../types';
import { useGitBranches } from '../../hooks/useGitBranches';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches: Branch[];
  currentBranch: string;
}

export default function BranchModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  branches, 
  currentBranch 
}: BranchModalProps) {
  const [branchName, setBranchName] = useState('');
  const [sourceBranch, setSourceBranch] = useState(currentBranch);
  const [creating, setCreating] = useState(false);
  const { createBranch } = useGitBranches(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBranchName('');
      setSourceBranch(currentBranch);
    }
  }, [isOpen, currentBranch]);

  const handleCreate = async () => {
    if (!branchName.trim()) return;

    setCreating(true);
    try {
      const success = await createBranch(branchName.trim(), sourceBranch);
      
      if (success) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Create branch error:', error);
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

  const validateBranchName = (name: string): string | null => {
    if (!name.trim()) return null;
    
    const branchNameRegex = /^[a-zA-Z0-9/_-]+$/;
    
    if (!branchNameRegex.test(name)) {
      return 'Only alphanumeric characters, hyphens, underscores, and forward slashes are allowed';
    }
    
    if (name.includes('..')) {
      return 'Branch name cannot contain ".."';
    }
    
    if (name.startsWith('-')) {
      return 'Branch name cannot start with a hyphen';
    }
    
    if (name.endsWith('.lock')) {
      return 'Branch name cannot end with ".lock"';
    }
    
    if (name.length > 255) {
      return 'Branch name cannot exceed 255 characters';
    }

    // Check if branch already exists
    if (branches.some(branch => branch.name === name)) {
      return 'Branch already exists';
    }

    return null;
  };

  if (!isOpen) return null;

  const validationError = validateBranchName(branchName);
  const isValid = !validationError && branchName.trim().length > 0;

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
            Create New Branch
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Branch Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Branch Name
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: validationError ? 'var(--color-error)' : 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="feature/new-feature"
              autoFocus
            />
            {validationError && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{validationError}</p>
            )}
          </div>

          {/* Source Branch Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Create from Branch
            </label>
            <select
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name} {branch.current ? '(current)' : ''}
                </option>
              ))}
            </select>
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
            disabled={creating || !isValid}
            className="px-4 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            style={{
              backgroundColor: creating || !isValid ? 'var(--text-tertiary)' : 'var(--color-primary)',
            }}
            onMouseEnter={(e) => {
              if (!creating && isValid) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!creating && isValid) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Branch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
