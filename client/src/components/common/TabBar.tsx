import { type TabType } from '../../types';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'notes', label: 'Notes' },
    { id: 'git', label: 'Git' },
  ];

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 border-transparent hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

