import React from 'react';
import { Tv, Sparkles, Terminal, Youtube, Zap, Smartphone, Maximize2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'launcher_view', label: '⭐ Minha Nova Launcher (Print)', icon: Tv },
    { id: 'termux', label: '1. Instalar via Termux', icon: Terminal },
    { id: 'debloat', label: '2. Debloat Gemini AI', icon: Sparkles },
    { id: 'tweaks', label: '3. Acelerar (0.5x)', icon: Zap },
    { id: 'chat', label: 'Copiloto Gemini AI', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  Gemini TV Launcher
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
                    Century TV Stick (2GB)
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                A launcher idêntica ao vídeo com automação no Termux pelo Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('launcher_view')}
              className="flex items-center gap-1.5 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Abrir Nova Launcher</span>
            </button>

            {/* Reference badge to Tech World BR video */}
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300">
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                Century Stick (2GB) • <strong>Gemini AI</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Bar */}
        <nav className="flex items-center gap-1.5 mt-3 sm:mt-4 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
