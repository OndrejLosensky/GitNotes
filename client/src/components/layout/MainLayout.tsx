import { type ReactNode } from 'react';
import Sidebar from './Sidebar.tsx';
import BottomToolbar from './BottomToolbar.tsx';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto pb-[32px]">
        {children}
      </div>
      <BottomToolbar />
    </div>
  );
}

