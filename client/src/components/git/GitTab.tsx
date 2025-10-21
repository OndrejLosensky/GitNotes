import { useState } from 'react';
import ChangesSection from './ChangesSection.tsx';
import RecentCommits from './RecentCommits.tsx';

export default function GitTab() {
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <div 
        className="px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Source Control
        </h2>
      </div>

      {/* Changes section with inline commit */}
      <div className="flex-1 overflow-y-auto">
        <ChangesSection />
      </div>

      {/* History section */}
      <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
        <RecentCommits 
          isCollapsed={isHistoryCollapsed}
          onToggle={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
        />
      </div>
    </div>
  );
}

