import { useState } from 'react';
import ChangesSection from './ChangesSection.tsx';
import RecentCommits from './RecentCommits.tsx';

export default function GitTab() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Source Control
        </h2>
      </div>

      {/* Changes section with inline commit */}
      <div className="flex-1 overflow-y-auto">
        <ChangesSection />
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* Recent commits */}
      {showHistory && (
        <div className="border-t border-gray-200 max-h-[300px] overflow-y-auto">
          <RecentCommits />
        </div>
      )}
    </div>
  );
}

