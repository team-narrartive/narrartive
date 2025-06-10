
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  currentView?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showSidebar = false, 
  currentView = 'dashboard'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSettings = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }));
  };

  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'logout' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentView={currentView}
        />
      )}
      
      <div className={`transition-all duration-300 ${showSidebar && sidebarOpen ? 'ml-64' : showSidebar ? 'ml-16' : ''}`}>
        <Header 
          showSidebar={showSidebar}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
