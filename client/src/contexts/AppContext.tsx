import { createContext, useContext, useState, type ReactNode } from 'react';
import { type TabType, type TreeNode, type GitStatus } from '../types';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  notesTree: TreeNode[];
  setNotesTree: (tree: TreeNode[]) => void;
  gitStatus: GitStatus | null;
  setGitStatus: (status: GitStatus | null) => void;
  refreshNotes: () => void;
  refreshGitStatus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [notesTree, setNotesTree] = useState<TreeNode[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);

  const refreshNotes = () => {
    // This will be implemented to fetch notes
    console.log('Refreshing notes...');
  };

  const refreshGitStatus = () => {
    // This will be implemented to fetch git status
    console.log('Refreshing git status...');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        notesTree,
        setNotesTree,
        gitStatus,
        setGitStatus,
        refreshNotes,
        refreshGitStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

