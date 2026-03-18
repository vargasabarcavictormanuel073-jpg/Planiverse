'use client';

import { ReactNode } from 'react';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title={title} />
      <main className="pt-16 px-4 md:px-8 py-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
