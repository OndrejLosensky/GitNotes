import { useState } from 'react';
import { type TabType } from '../../types';
import TabBar from '../common/TabBar.tsx';
import NotesTree from '../notes/NotesTree.tsx';
import GitTab from '../git/GitTab.tsx';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  return (
    <div className="w-[280px] border-r border-gray-200 bg-white flex flex-col h-screen pb-[32px]">
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notes' ? <NotesTree /> : <GitTab />}
      </div>
    </div>
  );
}

