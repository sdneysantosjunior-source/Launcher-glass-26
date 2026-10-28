import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomTvLauncher } from './components/CustomTvLauncher';
import { TermuxQuickStart } from './components/TermuxQuickStart';
import { PackageAnalyzer } from './components/PackageAnalyzer';
import { SpeedTweaks } from './components/SpeedTweaks';
import { GeminiChat } from './components/GeminiChat';
import { Terminal, Sparkles, Tv, Zap, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('launcher_view');
  const [isNativeTvMode, setIsNativeTvMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasBridge = typeof (window as unknown as { AndroidTV?: unknown }).AndroidTV !== 'undefined';
    if (params.get('tv') === '1' || hasBridge) {
      setIsNativeTvMode(true);
    }
  }, []);

  // When running inside the compiled Android 14 TV APK, render pure Fullscreen TV Launcher
  if (isNativeTvMode) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#04060e]">
        <CustomTvLauncher
          defaultFullscreen={true}
          onOpenTermuxGuide={() => {
            setIsNativeTvMode(false);
            setActiveTab('termux');
          }}
        />
      </div>
    );
  }

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
                    Launcher Glass 26 • Century TV Stick (Android 14)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Use as setas do teclado ou clique em &quot;Simular Controle TV&quot; na barra superior da Launcher para testar toda a navegação.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsNativeTvMode(true)}
                  className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Modo APK Tela Cheia</span>
                </button>
                <button
                  onClick={() => setActiveTab('termux')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Instalar no Century via Termux</span>
                </button>
              </div>
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
            Century TV Stick (Android 14 • 2GB RAM) • Launcher Glass 26 Oficial
          </p>
        </div>
      </footer>
    </div>
  );
}
