import { useState } from 'react';
import ChangesSection from './ChangesSection.tsx';
import RecentCommits from './RecentCommits.tsx';

export default function GitTab() {
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);

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

      {/* History section */}
      <div className="border-t border-gray-200">
        <RecentCommits 
          isCollapsed={isHistoryCollapsed}
          onToggle={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
        />
      </div>
    </div>
  );
}

