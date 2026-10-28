import React, { useState } from 'react';
import { Header } from './components/Header';
import { CustomTvLauncher } from './components/CustomTvLauncher';
import { TermuxQuickStart } from './components/TermuxQuickStart';
import { PackageAnalyzer } from './components/PackageAnalyzer';
import { SpeedTweaks } from './components/SpeedTweaks';
import { GeminiChat } from './components/GeminiChat';
import { Terminal, Sparkles, Tv, Zap, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('launcher_view');

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation & App Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'launcher_view' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Sua Nova Launcher Neon Glass (Century TV Stick 2GB)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Réplica fiel do print do vídeo com navegação via controle remoto, atalhos de streaming e perfil personalizável.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('termux')}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Instalar no Century via Termux</span>
              </button>
            </div>

            {/* The Actual Custom Launcher */}
            <CustomTvLauncher onOpenTermuxGuide={() => setActiveTab('termux')} />
          </div>
        )}

        {activeTab === 'termux' && <TermuxQuickStart />}
        {activeTab === 'debloat' && <PackageAnalyzer />}
        {activeTab === 'tweaks' && <SpeedTweaks />}
        {activeTab === 'chat' && <GeminiChat />}
      </main>

      {/* Mobile Bottom Quick Navigation */}
      <div className="sm:hidden sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setActiveTab('launcher_view')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'launcher_view' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Launcher</span>
        </button>

        <button
          onClick={() => setActiveTab('termux')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'termux' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Termux</span>
        </button>

        <button
          onClick={() => setActiveTab('debloat')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'debloat' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Debloat</span>
        </button>

        <button
          onClick={() => setActiveTab('tweaks')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'tweaks' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>0.5x</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'chat' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Gemini AI</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-5 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p>
            Century TV Stick (2GB RAM) • Custom Smart TV Launcher estilo Neon Glass • Google Gemini 3.8 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
