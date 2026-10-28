import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Tv, 
  Search, 
  Wifi, 
  Home, 
  Grid, 
  Film, 
  Tv2, 
  Gamepad2, 
  Music2, 
  Settings, 
  Play, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  Monitor, 
  Sparkles,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

interface CustomTvLauncherProps {
  onOpenTermuxGuide?: () => void;
}

export const CustomTvLauncher: React.FC<CustomTvLauncherProps> = ({ onOpenTermuxGuide }) => {
  // Clock & Date state
  const [timeStr, setTimeStr] = useState('20:35');
  const [dateStr, setDateStr] = useState('Seg, 26 de Maio');

  // Active dock menu
  const [activeDock, setActiveDock] = useState<string>('inicio');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sound toggle (Web Audio API synthetic click sound for TV remote feedback)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Carousel current index (0 to 4)
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Active notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App drawer modal
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);

  // Focus Navigation state
  // Section types: 'dock', 'hero', 'weather', 'hdmi', 'apps', 'continue'
  const [focusedId, setFocusedId] = useState<string>('app-0'); // starts on Netflix

  const containerRef = useRef<HTMLDivElement>(null);

  // Audio Context for synthetic TV remote feedback sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNavigationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext unavailable or blocked
    }
  }, [soundEnabled]);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      setDateStr(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Carousel slides data
  const carouselSlides = [
    {
      tag: 'CENTURY TV PLUS',
      title: 'Descubra novos mundos',
      subtitle: 'Filmes, séries e canais gratuitos',
      actionText: 'Assistir agora',
      actionUrl: 'https://www.youtube.com',
    },
    {
      tag: 'DESTAQUE HBO MAX',
      title: 'The Last of Us: Nova Temporada',
      subtitle: 'A aclamada série pós-apocalíptica',
      actionText: 'Assistir na HBO Max',
      actionUrl: 'https://www.max.com',
    },
    {
      tag: 'PRIME VIDEO',
      title: 'Fallout: O Fim do Mundo',
      subtitle: 'Disponível em 4K HDR com áudio espacial',
      actionText: 'Assistir no Prime',
      actionUrl: 'https://www.primevideo.com',
    },
    {
      tag: 'DISNEY+',
      title: 'Star Wars: The Mandalorian',
      subtitle: 'As aventuras pela galáxia continuam',
      actionText: 'Ver no Disney+',
      actionUrl: 'https://www.disneyplus.com',
    },
    {
      tag: 'GLOBOPLAY',
      title: 'Novelas & Reality 24 Horas',
      subtitle: 'Canais ao vivo em alta definição',
      actionText: 'Abrir Globoplay',
      actionUrl: 'https://globoplay.globo.com',
    },
  ];

  // 9 Apps list matching the screenshot
  const appList = [
    {
      id: 'app-0',
      name: 'Netflix',
      label: 'Netflix',
      bgGradient: 'from-[#141414] to-[#080808]',
      logoColor: 'text-[#E50914]',
      renderLogo: () => (
        <span className="text-3xl sm:text-4xl font-black text-[#E50914] tracking-tighter drop-shadow-[0_4px_12px_rgba(229,9,20,0.6)]">
          N
        </span>
      ),
      webUrl: 'https://www.netflix.com',
    },
    {
      id: 'app-1',
      name: 'Prime Video',
      label: 'Prime Video',
      bgGradient: 'from-[#00274c] to-[#001326]',
      logoColor: 'text-[#00A8E1]',
      renderLogo: () => (
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
            prime
          </span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
            video
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#00A8E1] leading-none -mt-0.5">
            ⌣
          </span>
        </div>
      ),
      webUrl: 'https://www.primevideo.com',
    },
    {
      id: 'app-2',
      name: 'Disney+',
      label: 'Disney+',
      bgGradient: 'from-[#0e1d44] to-[#070e24]',
      logoColor: 'text-cyan-400',
      renderLogo: () => (
        <span className="text-lg sm:text-xl font-black text-white italic tracking-tight drop-shadow">
          Disney<span className="text-cyan-400 font-normal">+</span>
        </span>
      ),
      webUrl: 'https://www.disneyplus.com',
    },
    {
      id: 'app-3',
      name: 'YouTube',
      label: 'YouTube',
      bgGradient: 'from-[#2b1010] to-[#120505]',
      logoColor: 'text-white',
      renderLogo: () => (
        <div className="w-10 h-7 sm:w-11 sm:h-8 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40">
          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
        </div>
      ),
      webUrl: 'https://www.youtube.com',
    },
    {
      id: 'app-4',
      name: 'HBO max',
      label: 'HBO max',
      bgGradient: 'from-[#240b49] to-[#100424]',
      logoColor: 'text-white',
      renderLogo: () => (
        <div className="flex flex-col items-center leading-none">
          <span className="text-sm sm:text-base font-black text-white tracking-wider">
            HBO
          </span>
          <span className="text-xs sm:text-sm font-bold text-indigo-300">
            max
          </span>
        </div>
      ),
      webUrl: 'https://www.max.com',
    },
    {
      id: 'app-5',
      name: 'globoplay',
      label: 'globoplay',
      bgGradient: 'from-[#ff3d00] to-[#c61000]',
      logoColor: 'text-white',
      renderLogo: () => (
        <span className="text-xs sm:text-sm font-black text-white tracking-tight drop-shadow">
          globoplay
        </span>
      ),
      webUrl: 'https://globoplay.globo.com',
    },
    {
      id: 'app-6',
      name: 'Apple TV',
      label: 'Apple TV',
      bgGradient: 'from-[#222224] to-[#0f0f10]',
      logoColor: 'text-white',
      renderLogo: () => (
        <div className="flex items-center gap-0.5 text-white font-bold text-xs sm:text-sm">
          <span></span>
          <span className="text-xs">tv</span>
        </div>
      ),
      webUrl: 'https://tv.apple.com',
    },
    {
      id: 'app-7',
      name: 'Paramount+',
      label: 'Paramount+',
      bgGradient: 'from-[#004fcf] to-[#002875]',
      logoColor: 'text-white',
      renderLogo: () => (
        <div className="text-center">
          <div className="text-[10px] text-white/80">★ ★ ★</div>
          <span className="text-xs font-bold text-white tracking-tight">Paramount+</span>
        </div>
      ),
      webUrl: 'https://www.paramountplus.com',
    },
    {
      id: 'app-8',
      name: 'Samsung TV Plus',
      label: 'Century TV Plus',
      bgGradient: 'from-[#082032] to-[#030d14]',
      logoColor: 'text-cyan-400',
      renderLogo: () => (
        <div className="flex flex-col items-center">
          <div className="w-6 h-5 border-2 border-cyan-400 rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
          </div>
          <span className="text-[9px] font-bold text-white mt-0.5">TV Plus</span>
        </div>
      ),
      webUrl: '#',
    },
  ];

  // 5 "Continuar assistindo" cards matching the screenshot
  const continueWatchingList = [
    {
      id: 'continue-0',
      title: 'THE LAST OF US',
      provider: 'HBO max',
      providerColor: 'text-white font-black text-[10px]',
      progress: 35,
      bgImage: 'from-amber-950/80 via-slate-900 to-black',
      category: 'Drama • T1:E4',
      badge: 'Pedro Pascal',
      webUrl: 'https://www.max.com',
    },
    {
      id: 'continue-1',
      title: 'Fallout',
      provider: 'prime video',
      providerColor: 'text-[#00A8E1] font-bold text-[10px]',
      progress: 20,
      bgImage: 'from-yellow-950/80 via-slate-900 to-black',
      category: 'Ficção • T1:E2',
      badge: 'Vault 33',
      webUrl: 'https://www.primevideo.com',
    },
    {
      id: 'continue-2',
      title: 'HOUSE OF DRAGON',
      provider: 'HBO max',
      providerColor: 'text-white font-black text-[10px]',
      progress: 65,
      bgImage: 'from-red-950/80 via-slate-900 to-black',
      category: 'Fantasia • T2:E6',
      badge: 'Rhaenyra',
      webUrl: 'https://www.max.com',
    },
    {
      id: 'continue-3',
      title: 'Ruptura',
      provider: 'tv+',
      providerColor: 'text-slate-300 font-bold text-[10px]',
      progress: 45,
      bgImage: 'from-blue-950/80 via-slate-900 to-black',
      category: 'Suspense • T1:E7',
      badge: 'Lumon Corp',
      webUrl: 'https://tv.apple.com',
    },
    {
      id: 'continue-4',
      title: 'O PROBLEMA DOS 3 CORPOS',
      provider: 'NETFLIX',
      providerColor: 'text-[#E50914] font-black text-[10px]',
      progress: 80,
      bgImage: 'from-indigo-950/80 via-slate-900 to-black',
      category: 'Ficção Científica • T1:E5',
      badge: 'San-Ti',
      webUrl: 'https://www.netflix.com',
    },
  ];

  // Dock items
  const dockItems = [
    { id: 'dock-inicio', label: 'Início', icon: Home },
    { id: 'dock-apps', label: 'Apps', icon: Grid },
    { id: 'dock-filmes', label: 'Filmes e Séries', icon: Film },
    { id: 'dock-tv', label: 'TV ao Vivo', icon: Tv2 },
    { id: 'dock-jogos', label: 'Jogos', icon: Gamepad2 },
    { id: 'dock-musica', label: 'Música', icon: Music2 },
    { id: 'dock-config', label: 'Configurações', icon: Settings },
  ];

  // 100% Functional TV Remote D-Pad Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape / Back button on TV remote
      if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4) {
        if (isAppDrawerOpen) {
          setIsAppDrawerOpen(false);
          playNavigationSound();
          return;
        }
        if (focusedId !== 'app-0') {
          setFocusedId('app-0');
          playNavigationSound();
          return;
        }
      }

      // Enter / OK button on TV remote
      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
        e.preventDefault();
        playNavigationSound();

        // Handle Hero Banner Action
        if (focusedId === 'hero-banner') {
          triggerToast(`🚀 Abrindo ${carouselSlides[carouselIndex].title} no Century TV Stick...`);
          window.open(carouselSlides[carouselIndex].actionUrl, '_blank');
          return;
        }

        // Handle Weather Widget
        if (focusedId === 'widget-weather') {
          triggerToast('⛅ Previsão do Tempo: São Paulo 18°C, Céu Limpo.');
          return;
        }

        // Handle HDMI Widget
        if (focusedId === 'widget-hdmi') {
          triggerToast('🔌 Alternando entrada para HDMI 1 no Century TV Stick...');
          return;
        }

        // Handle App Selection
        if (focusedId.startsWith('app-')) {
          const appIdx = parseInt(focusedId.replace('app-', ''), 10);
          const app = appList[appIdx];
          if (app) {
            triggerToast(`🚀 Abrindo ${app.name} no Century TV Stick...`);
            if (app.webUrl && app.webUrl !== '#') {
              window.open(app.webUrl, '_blank');
            } else {
              setIsAppDrawerOpen(true);
            }
          }
          return;
        }

        // Handle Continue Watching
        if (focusedId.startsWith('continue-')) {
          const cIdx = parseInt(focusedId.replace('continue-', ''), 10);
          const item = continueWatchingList[cIdx];
          if (item) {
            triggerToast(`▶ Continuando ${item.title} (${item.provider}) do minuto ${item.progress}%...`);
            window.open(item.webUrl, '_blank');
          }
          return;
        }

        // Handle Dock items
        if (focusedId.startsWith('dock-')) {
          const dockName = focusedId.replace('dock-', '');
          setActiveDock(dockName);
          if (dockName === 'apps') setIsAppDrawerOpen(true);
          if (dockName === 'config' && onOpenTermuxGuide) onOpenTermuxGuide();
          return;
        }
      }

      // Directional D-Pad mapping: ArrowUp, ArrowDown, ArrowLeft, ArrowRight
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        playNavigationSound();

        setFocusedId((current) => {
          // --- NAVIGATION WITHIN DOCK ---
          if (current.startsWith('dock-')) {
            const dockIdx = dockItems.findIndex((d) => d.id === current);
            if (e.key === 'ArrowDown') {
              const next = Math.min(dockItems.length - 1, dockIdx + 1);
              return dockItems[next].id;
            }
            if (e.key === 'ArrowUp') {
              const prev = Math.max(0, dockIdx - 1);
              return dockItems[prev].id;
            }
            if (e.key === 'ArrowRight') {
              return 'app-0'; // moves to Netflix
            }
            return current;
          }

          // --- NAVIGATION ON HERO BANNER ---
          if (current === 'hero-banner') {
            if (e.key === 'ArrowLeft') return 'dock-inicio';
            if (e.key === 'ArrowRight') return 'widget-weather';
            if (e.key === 'ArrowDown') return 'app-0';
            return current;
          }

          // --- NAVIGATION ON WEATHER WIDGET ---
          if (current === 'widget-weather') {
            if (e.key === 'ArrowLeft') return 'hero-banner';
            if (e.key === 'ArrowDown') return 'widget-hdmi';
            return current;
          }

          // --- NAVIGATION ON HDMI WIDGET ---
          if (current === 'widget-hdmi') {
            if (e.key === 'ArrowUp') return 'widget-weather';
            if (e.key === 'ArrowLeft') return 'hero-banner';
            if (e.key === 'ArrowDown') return 'app-8';
            return current;
          }

          // --- NAVIGATION IN "SEUS APLICATIVOS" ROW (app-0 to app-8) ---
          if (current.startsWith('app-')) {
            const idx = parseInt(current.replace('app-', ''), 10);
            if (e.key === 'ArrowLeft') {
              if (idx === 0) return 'dock-inicio'; // goes to dock
              return `app-${idx - 1}`;
            }
            if (e.key === 'ArrowRight') {
              if (idx < appList.length - 1) return `app-${idx + 1}`;
              return current;
            }
            if (e.key === 'ArrowUp') {
              if (idx <= 4) return 'hero-banner';
              return 'widget-hdmi';
            }
            if (e.key === 'ArrowDown') {
              // Map to continue watching item
              const continueTarget = Math.min(4, Math.floor((idx / appList.length) * 5));
              return `continue-${continueTarget}`;
            }
            return current;
          }

          // --- NAVIGATION IN "CONTINUAR ASSISTINDO" ROW (continue-0 to continue-4) ---
          if (current.startsWith('continue-')) {
            const idx = parseInt(current.replace('continue-', ''), 10);
            if (e.key === 'ArrowLeft') {
              if (idx === 0) return 'dock-filmes';
              return `continue-${idx - 1}`;
            }
            if (e.key === 'ArrowRight') {
              if (idx < continueWatchingList.length - 1) return `continue-${idx + 1}`;
              return current;
            }
            if (e.key === 'ArrowUp') {
              // Map back up to app row
              const appTarget = Math.min(8, idx * 2);
              return `app-${appTarget}`;
            }
            return current;
          }

          return 'app-0';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedId, isAppDrawerOpen, carouselIndex, playNavigationSound, onOpenTermuxGuide]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#04060e] text-white font-sans overflow-hidden select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen'
          : 'rounded-3xl border border-white/10 shadow-2xl min-h-[720px]'
      }`}
    >
      {/* ========================================================================= */}
      {/* 4K COSMIC SCI-FI BACKGROUND REPLICA (Planeta com anel, montanhas e lago)  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep starry space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b1c] via-[#121330] to-[#05060f]" />

        {/* Twinkling starfield effect */}
        <div 
          className="absolute inset-0 opacity-40 bg-[radial-gradient(white_1px,transparent_1px)]"
          style={{ backgroundSize: '40px 40px' }}
        />

        {/* Giant Ringed Planet with luminous atmosphere (top right) */}
        <div className="absolute -top-12 right-1/4 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-[#9945FF] via-[#DC1FFF] to-[#FF8C00] opacity-45 blur-md" />
        <div className="absolute -top-8 right-[24%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#1b1c3a] via-[#15102a] to-[#2c1338] shadow-[0_0_90px_rgba(220,31,255,0.4)] overflow-hidden">
          {/* Planet shadow and texture */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        </div>
        
        {/* Planetary Rings Angle */}
        <div 
          className="absolute -top-4 right-[16%] w-[520px] h-[140px] rounded-full border-[8px] border-[#DC1FFF]/30 opacity-70 transform -rotate-[24deg] pointer-events-none blur-[1px]"
          style={{ boxShadow: '0 0 50px rgba(220,31,255,0.5)' }}
        />

        {/* Secondary distant moon */}
        <div className="absolute top-16 right-16 w-14 h-14 rounded-full bg-slate-300/60 shadow-[0_0_20px_rgba(255,255,255,0.5)] blur-[0.5px]" />

        {/* Sunset glow behind mountains */}
        <div className="absolute bottom-1/3 left-0 right-0 h-48 bg-gradient-to-t from-[#ff6b4a]/25 via-[#9945FF]/15 to-transparent blur-2xl" />

        {/* Mountain Silhouette Layers */}
        <svg
          className="absolute bottom-20 left-0 right-0 w-full h-64 opacity-50"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#090a18"
            d="M0,192L80,160C160,128,320,64,480,96C640,128,800,256,960,256C1120,256,1280,128,1360,64L1440,0L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>

        {/* Alpine Lake Reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#04060e] via-[#080c1d]/90 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* TV REMOTE HUD INDICATOR (Informa que o controle está 100% ativo)          */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1 rounded-full text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white">Controle da TV: 100% Funcional</span>
        <span className="text-slate-400">| Use as setas (D-Pad) e OK</span>
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="ml-1 text-slate-400 hover:text-white"
          title={soundEnabled ? 'Som do controle ativado' : 'Som desativado'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: LEFT DOCK + RIGHT CONTENT GRID                               */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex h-full p-4 sm:p-6 gap-6">
        
        {/* ======================================================================= */}
        {/* LEFT DOCK (Cápsula Flutuante de Vidro Líquido do Print)                 */}
        {/* ======================================================================= */}
        <aside className="w-48 sm:w-56 shrink-0 flex flex-col justify-start space-y-4">
          
          {/* Top Left Clock and Date (Exato: 20:35 • Seg, 26 de Maio) */}
          <div className="pl-2 pt-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono drop-shadow">
              {timeStr}
            </div>
            <div className="text-xs text-slate-300 font-medium tracking-wide">
              {dateStr}
            </div>
          </div>

          {/* Floating Frosted Glass Dock Container */}
          <nav className="backdrop-blur-2xl bg-white/[0.06] border border-white/15 rounded-3xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-1.5">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDock === item.id.replace('dock-', '');
              const isFocused = focusedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playNavigationSound();
                    setFocusedId(item.id);
                    const dockName = item.id.replace('dock-', '');
                    setActiveDock(dockName);
                    if (dockName === 'apps') setIsAppDrawerOpen(true);
                    if (dockName === 'config' && onOpenTermuxGuide) onOpenTermuxGuide();
                  }}
                  onMouseEnter={() => setFocusedId(item.id)}
                  className={`w-full py-2.5 px-3.5 flex items-center gap-3 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.7)] border border-blue-400/60 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                  } ${
                    isFocused ? 'ring-2 ring-white scale-[1.03] shadow-lg' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span className="text-xs sm:text-sm tracking-tight truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ======================================================================= */}
        {/* MAIN TV SCREEN CONTENT (Hero + Seus Aplicativos + Continuar Assistindo)  */}
        {/* ======================================================================= */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar space-y-5">
          
          {/* Top Row: Hero Banner (Center) + Widgets (Right) */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            
            {/* 1. Large Frosted Glass Spotlight Banner */}
            <div
              id="hero-banner"
              onClick={() => {
                playNavigationSound();
                triggerToast(`🚀 Abrindo ${carouselSlides[carouselIndex].title}...`);
                window.open(carouselSlides[carouselIndex].actionUrl, '_blank');
              }}
              onMouseEnter={() => setFocusedId('hero-banner')}
              className={`flex-1 rounded-3xl border border-white/20 backdrop-blur-2xl bg-white/[0.08] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[175px] transition-all duration-200 cursor-pointer relative overflow-hidden ${
                focusedId === 'hero-banner' ? 'ring-4 ring-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.8)] scale-[1.01]' : ''
              }`}
            >
              {/* Glass subtle shine highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  {carouselSlides[carouselIndex].tag}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {carouselSlides[carouselIndex].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {carouselSlides[carouselIndex].subtitle}
                </p>
              </div>

              {/* Action Button & Carousel Dots */}
              <div className="flex items-center justify-between pt-3 relative z-10">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold px-4 py-2 rounded-full text-xs transition shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{carouselSlides[carouselIndex].actionText}</span>
                </button>

                {/* 5 Dots Pagination */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <button
                      key={dot}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex(dot);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        dot === carouselIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Right Side: Weather & Inputs Widgets */}
            <div className="w-full lg:w-48 shrink-0 flex flex-col gap-3">
              
              {/* Top Controls: Search, Wi-Fi, Profile Avatar */}
              <div className="flex items-center justify-end gap-2.5 pb-1">
                <button
                  onClick={() => triggerToast('🔍 Busca por voz e texto ativa no Century TV Stick.')}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer"
                  title="Pesquisar"
                >
                  <Search className="w-4 h-4" />
                </button>

                <div className="p-2 rounded-full bg-white/10 border border-white/15 text-white" title="Wi-Fi 5GHz Excelente">
                  <Wifi className="w-4 h-4" />
                </div>

                <div 
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/30 cursor-pointer"
                  title="Perfil Century TV"
                >
                  S
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-400 transition cursor-pointer"
                  title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Weather Widget */}
              <div
                id="widget-weather"
                onClick={() => triggerToast('⛅ Previsão: Céu Limpo em São Paulo, 18°C.')}
                onMouseEnter={() => setFocusedId('widget-weather')}
                className={`rounded-2xl border border-white/20 backdrop-blur-2xl bg-white/[0.08] p-3 shadow-lg flex items-center justify-between transition-all cursor-pointer ${
                  focusedId === 'widget-weather' ? 'ring-2 ring-blue-400 scale-[1.03]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-800 text-lg shadow-inner font-bold">
                  🌕
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-300 font-medium">São Paulo</div>
                  <div className="text-xl font-extrabold text-white leading-none">18°</div>
                  <div className="text-[10px] text-slate-400">Céu Limpo</div>
                </div>
              </div>

              {/* Inputs / Entradas Widget */}
              <div
                id="widget-hdmi"
                onClick={() => triggerToast('🔌 Entrada: Century Stick conectado no HDMI 1.')}
                onMouseEnter={() => setFocusedId('widget-hdmi')}
                className={`rounded-2xl border border-white/20 backdrop-blur-2xl bg-white/[0.08] p-3 shadow-lg flex items-center justify-between transition-all cursor-pointer ${
                  focusedId === 'widget-hdmi' ? 'ring-2 ring-blue-400 scale-[1.03]' : ''
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest">— Entradas —</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>HDMI 1</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

            </div>
          </div>

          {/* ======================================================================= */}
          {/* MIDDLE ROW: "Seus Aplicativos" (9 Squircle Glass Icons)                 */}
          {/* ======================================================================= */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
              Seus Aplicativos
            </h3>

            {/* Horizontal 9 App Icons Row matching the screenshot */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5 sm:gap-3">
              {appList.map((app) => {
                const isFocused = focusedId === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      playNavigationSound();
                      setFocusedId(app.id);
                      triggerToast(`🚀 Abrindo ${app.name} no Century TV Stick...`);
                      if (app.webUrl && app.webUrl !== '#') {
                        window.open(app.webUrl, '_blank');
                      } else {
                        setIsAppDrawerOpen(true);
                      }
                    }}
                    onMouseEnter={() => setFocusedId(app.id)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    {/* Glass 3D Squircle Container */}
                    <div
                      className={`w-full aspect-square rounded-2xl sm:rounded-3xl p-3 flex items-center justify-center transition-all duration-200 relative overflow-hidden bg-gradient-to-br ${app.bgGradient} border border-white/20 shadow-lg ${
                        isFocused
                          ? 'ring-4 ring-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.9)] scale-110 -translate-y-1 z-20'
                          : 'group-hover:scale-105 group-hover:border-white/40'
                      }`}
                    >
                      {/* Glossy liquid glass reflection top overlay */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none rounded-t-2xl" />

                      {/* App Logo */}
                      <div className="relative z-10 flex items-center justify-center">
                        {app.renderLogo()}
                      </div>
                    </div>

                    {/* App Text Label underneath */}
                    <span className={`text-[10px] sm:text-[11px] truncate max-w-[70px] text-center font-medium transition-colors ${
                      isFocused ? 'text-cyan-300 font-bold' : 'text-slate-300'
                    }`}>
                      {app.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* BOTTOM ROW: "Continuar assistindo" (Cards com barra de progresso)       */}
          {/* ======================================================================= */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
              Continuar assistindo
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {continueWatchingList.map((item) => {
                const isFocused = focusedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playNavigationSound();
                      setFocusedId(item.id);
                      triggerToast(`▶ Continuando ${item.title}...`);
                      window.open(item.webUrl, '_blank');
                    }}
                    onMouseEnter={() => setFocusedId(item.id)}
                    className={`rounded-2xl border border-white/15 bg-gradient-to-b ${item.bgImage} overflow-hidden shadow-lg transition-all duration-200 cursor-pointer relative flex flex-col justify-between h-28 sm:h-32 p-3 ${
                      isFocused
                        ? 'ring-4 ring-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.85)] scale-105 z-20 -translate-y-1'
                        : 'hover:border-white/40'
                    }`}
                  >
                    {/* Badge top tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-slate-300 font-medium">
                        {item.badge}
                      </span>
                      <span className="text-[8px] text-slate-400">{item.category}</span>
                    </div>

                    {/* Title & Provider Logo */}
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-white truncate drop-shadow">
                        {item.title}
                      </div>
                      <div className={item.providerColor}>
                        {item.provider}
                      </div>

                      {/* Progress Bar (Exata do print) */}
                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_#3b82f6]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ACTION TOAST                                                     */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-400 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APP DRAWER MODAL                                                          */}
      {/* ========================================================================= */}
      {isAppDrawerOpen && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Aplicativos Instalados</h3>
                  <p className="text-[11px] text-slate-400">Century TV Stick (2GB RAM)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAppDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto no-scrollbar">
              {[
                { name: 'Century Canais Ao Vivo', icon: '📡', tag: 'TV Aberta' },
                { name: 'Stremio 4K', icon: '🔮', tag: 'Streaming' },
                { name: 'SmartTube Next', icon: '🛡️', tag: 'Sem Anúncios' },
                { name: 'Plex Media', icon: '🎞️', tag: 'Mídia Local' },
                { name: 'RetroArch', icon: '🕹️', tag: 'Emulador' },
                { name: 'Spotify TV', icon: '🎵', tag: 'Música' },
                { name: 'Navegador Web', icon: '🌐', tag: 'Internet' },
                { name: 'Configurações Century', icon: '⚙️', tag: 'Sistema' },
              ].map((app, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerToast(`🚀 Abrindo ${app.name}...`);
                    setIsAppDrawerOpen(false);
                  }}
                  className="bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-400 rounded-2xl p-3 text-center space-y-1 transition-all cursor-pointer"
                >
                  <div className="text-3xl mx-auto">{app.icon}</div>
                  <div className="text-xs font-bold text-white truncate">{app.name}</div>
                  <div className="text-[10px] text-slate-400">{app.tag}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAppDrawerOpen(false)}
                className="text-cyan-400 text-xs font-bold hover:underline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
