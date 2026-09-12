import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-300 hover:text-white focus:outline-none">
          <Menu size={24} />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
