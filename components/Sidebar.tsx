import React from 'react';
import { Layout, PenTool, Users, MonitorPlay } from 'lucide-react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const menuItems = [
    {
      id: ToolType.CONTENT_ARCHITECT,
      label: 'Content Architect',
      icon: <PenTool size={20} />,
      description: 'Social Media Strategy'
    },
    {
      id: ToolType.PRESENTATION_ARCHITECT,
      label: 'Presentation AI',
      icon: <MonitorPlay size={20} />,
      description: 'Slide Deck Builder'
    },
    {
      id: ToolType.COMMUNITY_GROWTH,
      label: 'Community Growth',
      icon: <Users size={20} />,
      description: 'Campaign Manager'
    }
  ];

  return (
    <div className="w-full md:w-72 border-r border-white/5 flex-shrink-0 flex flex-col h-full glass-panel bg-slate-900/30">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Layout size={18} />
          </div>
          <h1 className="font-bold text-xl text-white tracking-tight">OmniCreator</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2 ml-1">AI-Powered Creative Suite</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={`w-full flex items-start p-3 rounded-xl transition-all duration-300 text-left group border ${
              activeTool === item.id
                ? 'bg-white/10 text-white border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span className={`mt-0.5 transition-colors ${activeTool === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </span>
            <div className="ml-3">
              <span className="block font-medium text-sm">{item.label}</span>
              <span className={`block text-xs mt-0.5 transition-colors ${activeTool === item.id ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-300">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Pro Tip
          </h3>
          <p className="text-sm text-slate-400">
            Be specific with your inputs to get the best results from the AI models.
          </p>
        </div>
      </div>
    </div>
  );
};