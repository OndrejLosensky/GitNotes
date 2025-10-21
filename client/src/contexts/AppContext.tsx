import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type TabType, type TreeNode, type GitStatus } from '../types';

type RefreshType = 'notes' | 'commits' | 'all';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  notesTree: TreeNode[];
  setNotesTree: (tree: TreeNode[]) => void;
  gitStatus: GitStatus | null;
  setGitStatus: (status: GitStatus | null) => void;
  refreshNotes: () => void;
  refreshGitStatus: () => void;
  // New refresh system
  registerRefreshCallback: (type: RefreshType, callback: () => void) => void;
  triggerRefresh: (type: RefreshType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [notesTree, setNotesTree] = useState<TreeNode[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  
  // Refresh callback registry
  const [refreshCallbacks, setRefreshCallbacks] = useState<{
    notes: (() => void)[];
    commits: (() => void)[];
  }>({ notes: [], commits: [] });

  const refreshNotes = () => {
    // This will be implemented to fetch notes
    console.log('Refreshing notes...');
  };

  const refreshGitStatus = () => {
    // This will be implemented to fetch git status
    console.log('Refreshing git status...');
  };

  const registerRefreshCallback = useCallback((type: RefreshType, callback: () => void) => {
    setRefreshCallbacks(prev => {
      if (type === 'all') {
        return {
          notes: [...prev.notes, callback],
          commits: [...prev.commits, callback]
        };
      }
      return {
        ...prev,
        [type]: [...prev[type], callback]
      };
    });
  }, []);

  const triggerRefresh = useCallback((type: RefreshType) => {
    if (type === 'all') {
      refreshCallbacks.notes.forEach(callback => callback());
      refreshCallbacks.commits.forEach(callback => callback());
    } else {
      refreshCallbacks[type].forEach(callback => callback());
    }
  }, [refreshCallbacks]);

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
        registerRefreshCallback,
        triggerRefresh,
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

