import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
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
  
  // Use refs to avoid infinite re-renders
  const refreshCallbacksRef = useRef<{
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
    if (type === 'all') {
      refreshCallbacksRef.current = {
        notes: [...refreshCallbacksRef.current.notes, callback],
        commits: [...refreshCallbacksRef.current.commits, callback]
      };
    } else {
      refreshCallbacksRef.current = {
        ...refreshCallbacksRef.current,
        [type]: [...refreshCallbacksRef.current[type], callback]
      };
    }
  }, []);

  const triggerRefresh = useCallback((type: RefreshType) => {
    if (type === 'all') {
      refreshCallbacksRef.current.notes.forEach(callback => callback());
      refreshCallbacksRef.current.commits.forEach(callback => callback());
    } else {
      refreshCallbacksRef.current[type].forEach(callback => callback());
    }
  }, []);

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

