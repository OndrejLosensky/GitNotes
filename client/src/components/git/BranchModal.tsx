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
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90vw]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Create New Branch
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Branch Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                validationError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              placeholder="feature/new-feature"
              autoFocus
            />
            {validationError && (
              <p className="mt-1 text-xs text-red-600">{validationError}</p>
            )}
          </div>

          {/* Source Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create from Branch
            </label>
            <select
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !isValid}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center gap-2"
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
