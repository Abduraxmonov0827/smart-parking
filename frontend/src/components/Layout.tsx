import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { MobileMenuButton } from './Sidebar';

const titles: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/slots': 'Parking Slots',
  '/vehicles': 'Vehicles',
  '/entry-exit': 'Entry & Exit',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Smart Parking';

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 lg:px-6 py-4">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
