import { type ReactNode } from 'react';
import Sidebar from './Sidebar.tsx';
import BottomToolbar from './BottomToolbar.tsx';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Sidebar />
      <div className="flex-1 overflow-auto pb-[32px]" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {children}
      </div>
      <BottomToolbar />
    </div>
  );
}

