import { type ReactNode } from 'react';
import Sidebar from './Sidebar.tsx';
import BottomToolbar from './BottomToolbar.tsx';

interface MainLayoutProps {
  children: ReactNode;
  topToolbar?: ReactNode;
}

export default function MainLayout({ children, topToolbar }: MainLayoutProps) {
  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Sidebar />
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

