import React, { useState } from 'react';
import { CustomTvLauncher } from './components/CustomTvLauncher';
import { TermuxQuickStart } from './components/TermuxQuickStart';
import { PackageAnalyzer } from './components/PackageAnalyzer';
import { SpeedTweaks } from './components/SpeedTweaks';
import { GeminiChat } from './components/GeminiChat';
import { ArrowLeft, Terminal, Sparkles, Zap, MessageSquare } from 'lucide-react';

export default function App() {
  const [systemPanelTab, setSystemPanelTab] = useState<'termux' | 'debloat' | 'tweaks' | 'chat' | null>(null);

  if (systemPanelTab) {
    return (
      <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans">
        <header className="sticky top-0 z-40 bg-[#080d1e]/95 backdrop-blur-xl border-b border-white/15 px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSystemPanelTab(null)}
              className="flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/50 border border-[#60a5fa] text-white px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Launcher Glass 26</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSystemPanelTab('termux')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  systemPanelTab === 'termux'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Termux ADB</span>
              </button>
              <button
                onClick={() => setSystemPanelTab('debloat')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  systemPanelTab === 'debloat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Debloat</span>
              </button>
              <button
                onClick={() => setSystemPanelTab('tweaks')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  systemPanelTab === 'tweaks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>0.5x Speed</span>
              </button>
              <button
                onClick={() => setSystemPanelTab('chat')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  systemPanelTab === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Assistente</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
          {systemPanelTab === 'termux' && <TermuxQuickStart />}
          {systemPanelTab === 'debloat' && <PackageAnalyzer />}
          {systemPanelTab === 'tweaks' && <SpeedTweaks />}
          {systemPanelTab === 'chat' && <GeminiChat />}
        </main>
      </div>
    );
  }

  return <CustomTvLauncher onOpenSystemPanel={(tab) => setSystemPanelTab(tab)} />;
}
