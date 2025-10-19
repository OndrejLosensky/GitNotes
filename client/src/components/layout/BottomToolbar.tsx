import { useGitStatus } from '../../hooks/useGitStatus';

export default function BottomToolbar() {
  const { gitStatus } = useGitStatus(true, 5000); 

  const modifiedCount = gitStatus ? 
    gitStatus.modified.length + gitStatus.staged.length + gitStatus.untracked.length : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[32px] bg-[#1e3a5f] text-white flex items-center px-4 text-sm border-t border-gray-700">
      {/* Left section: Git branch and stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.5 0a3.5 3.5 0 1 1-1.667 6.583L8.5 7.917V9.5a.5.5 0 0 1-.5.5H6v1.5a.5.5 0 0 1-.5.5H4v1.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l4.5-4.5A.5.5 0 0 1 6.5 6H8V4.667a3.5 3.5 0 1 1 3.5-4.667z"/>
          </svg>
          <span className="text-gray-200">{gitStatus?.branch || 'main'}</span>
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
        <button className="hover:bg-gray-600 p-1 rounded transition-colors">
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

