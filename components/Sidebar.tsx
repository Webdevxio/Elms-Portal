
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: View.PROFILE, label: 'Profile Settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: View.ADMIN, label: 'Control Center', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || user.role === 'admin');

  return (
    <div className="w-64 bg-[#0a0a1a] h-screen border-r border-white/5 flex flex-col fixed left-0 top-0 hidden md:flex z-50">
      <div className="p-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#8b3dff] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white text-2xl font-black">L</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white italic">Lumina</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Portal Navigation</p>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
              currentView === item.id 
              ? 'bg-[#8b3dff] text-white shadow-xl shadow-purple-900/40' 
              : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        {/* Sign Out Button */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-6 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 mr-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        <div className="bg-[#10101f] border border-white/5 rounded-3xl p-5 flex items-center space-x-4">
           <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-12 h-12 rounded-2xl border-2 border-white/5 bg-[#1a1a2e]" alt="Avatar" />
           <div className="overflow-hidden">
             <p className="text-sm font-bold text-white truncate">{user.name}</p>
             <p className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-[#8b3dff]' : 'text-slate-500'}`}>
               {user.role === 'admin' ? 'Administrator' : 'Active Student'}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
