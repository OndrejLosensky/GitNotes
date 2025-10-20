import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitStatus } from '../../hooks/useGitStatus';
import { useGitBranches } from '../../hooks/useGitBranches';
import BranchModal from '../git/BranchModal';

export default function BottomToolbar() {
  const navigate = useNavigate();
  const { gitStatus } = useGitStatus(true, 5000);
  const { branches, currentBranch, checkoutBranch, deleteBranch } = useGitBranches(true, 5000);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const branchMenuRef = useRef<HTMLDivElement>(null);

  const modifiedCount = gitStatus ? 
    gitStatus.modified.length + gitStatus.staged.length + gitStatus.untracked.length : 0;

  // Close branch menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setShowBranchMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBranchSwitch = async (branchName: string) => {
    if (branchName === currentBranch) {
      setShowBranchMenu(false);
      return;
    }

    const success = await checkoutBranch(branchName);
    if (success) {
      setShowBranchMenu(false);
    }
  };

  const handleDeleteBranch = async (branchName: string, force: boolean = false) => {
    if (window.confirm(`Are you sure you want to delete the branch "${branchName}"?`)) {
      const success = await deleteBranch(branchName, force);
      if (success) {
        setShowBranchMenu(false);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[32px] bg-[#1e3a5f] text-white flex items-center px-4 text-sm border-t border-gray-700">
      {/* Left section: Git branch and stats */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={branchMenuRef}>
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
          >
            <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.5 0a3.5 3.5 0 1 1-1.667 6.583L8.5 7.917V9.5a.5.5 0 0 1-.5.5H6v1.5a.5.5 0 0 1-.5.5H4v1.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l4.5-4.5A.5.5 0 0 1 6.5 6H8V4.667a3.5 3.5 0 1 1 3.5-4.667z"/>
            </svg>
            <span className="text-gray-200">{currentBranch || gitStatus?.branch || 'main'}</span>
            <svg 
              className={`w-3 h-3 text-gray-300 transition-transform ${showBranchMenu ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Branch Dropdown Menu */}
          {showBranchMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
              {/* Branch List */}
              <div className="py-1">
                {branches.map((branch) => (
                  <div key={branch.name} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                    <button
                      onClick={() => handleBranchSwitch(branch.name)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <svg className={`w-3 h-3 ${branch.current ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {branch.current ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span className={`text-sm ${branch.current ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {branch.name}
                      </span>
                    </button>
                    {!branch.current && (
                      <button
                        onClick={() => handleDeleteBranch(branch.name)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete branch"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200"></div>

              {/* Create New Branch */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowBranchMenu(false);
                    setShowBranchModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Branch
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Visual separator */}
        <div className="w-px h-4 bg-gray-500"></div>
        
        {/* Git stats */}
        <div className="flex items-center gap-3 text-gray-300">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-xs">{gitStatus?.ahead || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
            <span className="text-xs">{gitStatus?.behind || 0}</span>
          </div>
          <span className="text-xs">{modifiedCount} modified</span>
        </div>
      </div>

      {/* Right section: Settings */}
      <div className="flex items-center ml-auto">
        <button 
          onClick={() => navigate('/settings')}
          className="hover:bg-gray-600 p-1 rounded transition-colors"
          title="Settings"
        >
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Branch Modal */}
      <BranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSuccess={() => {
          // Modal will handle success internally
        }}
        branches={branches}
        currentBranch={currentBranch}
      />
    </div>
  );
}

