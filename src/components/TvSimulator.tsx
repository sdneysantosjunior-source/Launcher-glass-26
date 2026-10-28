import React, { useState } from 'react';
import { Tv, Sparkles, Play, ShieldAlert, CheckCircle, Zap, Film, Layers, Gauge } from 'lucide-react';

export const TvSimulator: React.FC = () => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const apps = [
    { name: 'YouTube', icon: '▶️', color: 'bg-red-600' },
    { name: 'Netflix', icon: '🍿', color: 'bg-red-800' },
    { name: 'Prime Video', icon: '🎬', color: 'bg-blue-600' },
    { name: 'Stremio', icon: '🔮', color: 'bg-purple-600' },
    { name: 'Max', icon: '⚡', color: 'bg-indigo-600' },
    { name: 'SmartTube', icon: '🛡️', color: 'bg-cyan-600' },
    { name: 'Configurações', icon: '⚙️', color: 'bg-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 mb-2">
              <Tv className="w-3.5 h-3.5" />
              <span>Comparador Visual Interativo</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Simulador da TV: Antes x Depois
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Veja o impacto real na taxa de quadros (FPS), consumo de memória RAM e poluição visual.
            </p>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('before')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'before'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚠️ Antes (Original Lento)
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'after'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 Depois (Gemini AI)
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" /> Fluidez de Tela
          </div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${viewMode === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {viewMode === 'after' ? '60 FPS Lisos' : '28 FPS (Gargalos)'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Resposta do Controle
          </div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${viewMode === 'after' ? 'text-cyan-400' : 'text-rose-400'}`}>
            {viewMode === 'after' ? '0.1s (Instantâneo)' : '1.4s (Atraso)'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Memória RAM Livre (Total 2GB)
          </div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${viewMode === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {viewMode === 'after' ? '1.250 MB Livres' : 'Apenas 520 MB Livres'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Film className="w-3.5 h-3.5" /> Propagandas & Banners
          </div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${viewMode === 'after' ? 'text-purple-400' : 'text-amber-400'}`}>
            {viewMode === 'after' ? 'Zero (0) Ads' : 'Mais de 15 Banners'}
          </div>
        </div>
      </div>

      {/* Simulated TV Frame */}
      <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* TV Stand / LED Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${viewMode === 'after' ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-mono uppercase tracking-wider text-[11px] text-slate-300">
              {viewMode === 'after' ? 'Modo Gemini TV (Projectivy 60fps)' : 'Modo Original de Fábrica (Android TV 9)'}
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            19:45 • 4K HDR 60Hz
          </div>
        </div>

        {/* TV Screen Content */}
        {viewMode === 'before' ? (
          /* BEFORE: Sluggish, bloated stock screen */
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4 min-h-[360px] relative">
            {/* Huge annoying sponsor ad banner */}
            <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border border-rose-500/30 rounded-xl p-4 relative overflow-hidden">
              <div className="text-[10px] bg-black/60 text-amber-300 px-2 py-0.5 rounded uppercase font-bold w-fit mb-1 border border-amber-500/30">
                📢 Anúncio Patrocinado em Vídeo (Consome Banda & RAM)
              </div>
              <h4 className="font-bold text-white text-base">
                Novo Filme Lançamento: Assista por R$ 29,90 no Google Filmes!
              </h4>
              <p className="text-xs text-rose-200 mt-1 max-w-md">
                Trailer reproduzindo automaticamente em segundo plano gastando CPU do Mi TV Stick...
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] bg-white/20 text-white px-2 py-1 rounded font-semibold">Alugar</span>
                <span className="text-[11px] text-rose-300">Lags ao navegar no controle</span>
              </div>
            </div>

            {/* Channels feed */}
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-2">
                Recomendações Promocionais do Google TV
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 text-center space-y-1">
                    <div className="w-8 h-8 mx-auto bg-slate-700 rounded-lg flex items-center justify-center text-xs">
                      📺
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">Canal {i}</div>
                    <div className="text-[9px] text-slate-500">Auto-preview</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Sintomas no Mi Stick:</strong> Trava ao rolar, controle falha comandos e apps fecham sozinhos por falta de RAM.
              </span>
            </div>
          </div>
        ) : (
          /* AFTER: Clean, futuristic Liquid Glass interface */
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 space-y-5 min-h-[360px] relative">
            {/* Top Bar with Glass Clock and Minimalist Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-white tracking-tight">19:45</div>
                <div className="text-xs text-cyan-400 border-l border-slate-700 pl-3">
                  Terça-feira, 27 de Outubro
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Wi-Fi 5GHz Excelente</span>
              </div>
            </div>

            {/* Clean Favorites Row */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Meus Aplicativos Rápidos (Acesso Instantâneo)</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                {apps.map((app) => (
                  <button
                    key={app.name}
                    onClick={() => setSelectedApp(app.name)}
                    className="group bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 hover:border-cyan-400 rounded-xl p-3 text-center transition-all duration-150 transform hover:-translate-y-1 cursor-pointer shadow-lg"
                  >
                    <div className="text-2xl mb-1">{app.icon}</div>
                    <div className="text-xs font-bold text-white group-hover:text-slate-950 truncate">
                      {app.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick feedback message */}
            {selectedApp && (
              <div className="bg-cyan-950/60 border border-cyan-500/40 p-3 rounded-xl text-xs text-cyan-200 flex items-center justify-between animate-fadeIn">
                <span>
                  🚀 Abrindo <strong>{selectedApp}</strong> em 0.3 segundos sem travamentos!
                </span>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Resultado com Gemini AI:</strong> Interface limpa estilo <em>Liquid Glass</em>, sem anúncios intrusivos e com mais de 450MB de RAM livre para reproduzir qualquer vídeo em 4K/FullHD!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
