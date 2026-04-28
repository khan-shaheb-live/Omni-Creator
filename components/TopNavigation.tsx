import React from 'react';
import { Layout, PenTool, Users, MonitorPlay, ImageMinus, UserCircle, LogOut } from 'lucide-react';
import { ToolType } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopNavigationProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ activeTool, setActiveTool }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: ToolType.CONTENT_ARCHITECT,
      label: 'Content Architect',
      icon: <PenTool size={18} />,
    },
    {
      id: ToolType.PRESENTATION_ARCHITECT,
      label: 'Presentation AI',
      icon: <MonitorPlay size={18} />,
    },
    {
      id: ToolType.COMMUNITY_GROWTH,
      label: 'Community Growth',
      icon: <Users size={18} />,
    },
    {
      id: ToolType.BACKGROUND_REMOVER,
      label: 'Bg Remover',
      icon: <ImageMinus size={18} />,
    },
    {
      id: ToolType.AVATAR_GENERATOR,
      label: 'Avatar Gen',
      icon: <UserCircle size={18} />,
    },
    {
      id: ToolType.AVATAR_VIDEO_GENERATOR,
      label: 'Avatar Video',
      icon: <MonitorPlay size={18} />,
    }
  ];

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 glass-panel bg-slate-900/60 sticky top-0 z-50 backdrop-blur-md">
      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Layout size={18} />
        </div>
        <div className="hidden md:block">
            <h1 className="font-bold text-lg text-white tracking-tight">OmniCreator</h1>
        </div>
      </div>

      {/* Navigation - Center */}
      <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-[50vw]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTool === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Right Actions - User Profile */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Pro Member</p>
            </div>
            <div className="relative group">
               <img 
                 src={user.avatar || "https://ui-avatars.com/api/?background=random"} 
                 alt={user.name} 
                 className="h-9 w-9 rounded-full ring-2 ring-white/10 shadow-lg cursor-pointer object-cover" 
               />
               
               {/* Dropdown for logout */}
               <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="p-3 border-b border-white/5 block sm:hidden">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
               </div>
            </div>
          </div>
        ) : (
           <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse"></div>
        )}
      </div>
    </header>
  );
};