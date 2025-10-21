import { type ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar.tsx';
import BottomToolbar from './BottomToolbar.tsx';
import { useAppContext } from '../../contexts/AppContext';

interface MainLayoutProps {
  children: ReactNode;
  topToolbar?: ReactNode;
}

export default function MainLayout({ children, topToolbar }: MainLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  // Ctrl+B keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div 
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ 
          width: sidebarCollapsed ? '0px' : '280px',
          minWidth: sidebarCollapsed ? '0px' : '280px'
        }}
      >
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden pb-[32px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Top toolbar area - fixed at top */}
        {topToolbar && (
          <div className="flex-shrink-0">
            {topToolbar}
          </div>
        )}
        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
      <BottomToolbar />
    </div>
  );
}

