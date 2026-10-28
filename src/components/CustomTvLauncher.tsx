import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
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
  ChevronLeft,
  Monitor,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Gamepad,
  CheckCircle2,
  Cpu,
  Radio
} from 'lucide-react';

interface CustomTvLauncherProps {
  onOpenTermuxGuide?: () => void;
  defaultFullscreen?: boolean;
}

interface AppItem {
  id: string;
  name: string;
  label: string;
  packagesCsv: string;
  category: 'all' | 'filmes' | 'tv' | 'jogos' | 'musica';
  bgGradient: string;
  accentGlow: string;
  description: string;
  renderLogo: () => React.ReactNode;
}

interface ContinueItem {
  id: string;
  title: string;
  subtitle: string;
  provider: string;
  packagesCsv: string;
  providerBadgeClass: string;
  progress: number;
  bgGradient: string;
  accentColor: string;
  durationRestante: string;
}

export const CustomTvLauncher: React.FC<CustomTvLauncherProps> = ({
  onOpenTermuxGuide,
  defaultFullscreen = false,
}) => {
  // Clock & Date state
  const [timeStr, setTimeStr] = useState('20:35');
  const [dateStr, setDateStr] = useState('Seg, 26 de Maio');

  // Active dock category ('inicio', 'apps', 'filmes', 'tv', 'jogos', 'musica', 'config')
  const [activeDock, setActiveDock] = useState<string>('inicio');

  // Fullscreen mode (automatic on TV APK)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(defaultFullscreen);

  // Show/hide virtual remote simulator on screen
  const [showVirtualRemote, setShowVirtualRemote] = useState<boolean>(false);

  // Sound toggle (Web Audio API click sound for TV remote feedback)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Hero Carousel index (0 to 4)
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState<boolean>(false);
  const [drawerFocusIdx, setDrawerFocusIdx] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlayerModal, setActivePlayerModal] = useState<{
    title: string;
    subtitle: string;
    provider: string;
    packagesCsv: string;
    progress?: number;
  } | null>(null);

  // Focus Navigation ID
  const [focusedId, setFocusedId] = useState<string>('app-0');

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (defaultFullscreen) {
      setIsFullscreen(true);
    }
  }, [defaultFullscreen]);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const playNavigationSound = useCallback((freq = 560) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, ctx.currentTime + 0.045);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Ignore audio block before first interaction
    }
  }, [soundEnabled]);

  // Update real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      setDateStr(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance Hero Banner carousel
  useEffect(() => {
    if (activePlayerModal || isAppDrawerOpen || isSearchOpen) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 5);
    }, 6500);
    return () => clearInterval(timer);
  }, [activePlayerModal, isAppDrawerOpen, isSearchOpen]);

  // Auto-scroll focused item into view on TV
  useEffect(() => {
    const el = document.getElementById(`tv-focus-${focusedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedId]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      if (!defaultFullscreen) {
        setIsFullscreen(false);
      }
    }
  }, [defaultFullscreen]);

  // Native Android TV Launcher Bridge + Simulator Player Fallback
  const launchNativeOrSimulate = useCallback(
    (title: string, subtitle: string, provider: string, packagesCsv: string, progress?: number) => {
      const bridge = (window as unknown as {
        AndroidTV?: {
          launchApp?: (pkgs: string) => boolean;
          openSettings?: () => void;
          openWifiSettings?: () => void;
        };
      }).AndroidTV;

      if (bridge && typeof bridge.launchApp === 'function') {
        const launched = bridge.launchApp(packagesCsv);
        if (launched) {
          triggerToast(`Abrindo ${provider} na Century TV Stick...`);
          return;
        }
      }

      // Open Interactive TV Player/App Preview Modal (Zero broken browser redirects!)
      setActivePlayerModal({
        title,
        subtitle,
        provider,
        packagesCsv,
        progress,
      });
    },
    [triggerToast]
  );

  const carouselSlides = [
    {
      tag: 'SAMSUNG TV Plus',
      title: 'Descubra novos mundos',
      subtitle: 'Filmes, séries e canais gratuitos',
      actionText: 'Assistir agora',
      packagesCsv: 'com.google.android.youtube.tv,com.liskovsoft.smarttubetv.beta,com.google.android.youtube',
      bgAccent: 'from-[#ff6b4a]/35 via-[#6b2cf5]/30 to-[#0c142c]/80',
    },
    {
      tag: 'HBO MAX ORIGINAL',
      title: 'The Last of Us: Parte II',
      subtitle: 'Novos episódios em 4K HDR Dolby Atmos',
      actionText: 'Assistir agora',
      packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
      bgAccent: 'from-amber-600/35 via-purple-900/35 to-slate-950/80',
    },
    {
      tag: 'PRIME VIDEO 4K',
      title: 'Fallout: Nova Califórnia',
      subtitle: 'Série original em destaque na sua TV',
      actionText: 'Assistir agora',
      packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
      bgAccent: 'from-cyan-500/35 via-blue-900/35 to-slate-950/80',
    },
    {
      tag: 'DISNEY+ PREMIERE',
      title: 'Star Wars: Andor',
      subtitle: 'A rebelião começa em alta definição',
      actionText: 'Assistir agora',
      packagesCsv: 'com.disney.disneyplus',
      bgAccent: 'from-blue-500/35 via-indigo-900/35 to-slate-950/80',
    },
    {
      tag: 'GLOBOPLAY AO VIVO',
      title: 'Canais Ao Vivo & Esportes',
      subtitle: 'Transmissão aberta 24h sem travamentos',
      actionText: 'Assistir agora',
      packagesCsv: 'com.globo.globotv',
      bgAccent: 'from-orange-500/35 via-red-900/35 to-slate-950/80',
    },
  ];

  // 9 Streaming Apps matching the reference screenshot
  const appList: AppItem[] = [
    {
      id: 'app-0',
      name: 'Netflix',
      label: 'Netflix',
      packagesCsv: 'com.netflix.ninja,com.netflix.mediaclient',
      category: 'filmes',
      bgGradient: 'from-[#1c090b] via-[#110506] to-[#080304]',
      accentGlow: 'rgba(229,9,20,0.55)',
      description: 'Filmes e séries em 4K Ultra HD',
      renderLogo: () => (
        <span className="text-3xl sm:text-4xl font-black text-[#E50914] tracking-tighter drop-shadow-[0_4px_14px_rgba(229,9,20,0.85)] select-none">
          N
        </span>
      ),
    },
    {
      id: 'app-1',
      name: 'Prime Video',
      label: 'Prime Video',
      packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
      category: 'filmes',
      bgGradient: 'from-[#072a4f] via-[#051c36] to-[#030e1c]',
      accentGlow: 'rgba(0,168,225,0.55)',
      description: 'Originais Amazon e canais ao vivo',
      renderLogo: () => (
        <div className="flex flex-col items-center leading-none select-none">
          <span className="text-[11px] sm:text-xs font-extrabold text-[#00A8E1] tracking-tight">
            prime
          </span>
          <span className="text-[11px] sm:text-xs font-extrabold text-[#00A8E1] tracking-tight">
            video
          </span>
          <span className="text-xs font-black text-[#00A8E1] -mt-0.5">⌣</span>
        </div>
      ),
    },
    {
      id: 'app-2',
      name: 'Disney+',
      label: 'Disney+',
      packagesCsv: 'com.disney.disneyplus',
      category: 'filmes',
      bgGradient: 'from-[#0d1f4d] via-[#081331] to-[#04091a]',
      accentGlow: 'rgba(56,189,248,0.5)',
      description: 'Disney, Pixar, Marvel, Star Wars e NatGeo',
      renderLogo: () => (
        <span className="text-sm sm:text-base font-black text-white italic tracking-tight drop-shadow select-none">
          Disney<span className="text-cyan-400 font-bold">+</span>
        </span>
      ),
    },
    {
      id: 'app-3',
      name: 'YouTube',
      label: 'YouTube',
      packagesCsv: 'com.google.android.youtube.tv,com.liskovsoft.smarttubetv.beta,com.google.android.youtube',
      category: 'tv',
      bgGradient: 'from-[#281212] via-[#160a0a] to-[#0b0505]',
      accentGlow: 'rgba(255,0,0,0.55)',
      description: 'Vídeos em 4K 60fps e canais ao vivo',
      renderLogo: () => (
        <div className="w-9 h-6 sm:w-11 sm:h-7 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(255,0,0,0.6)]">
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white ml-0.5" />
        </div>
      ),
    },
    {
      id: 'app-4',
      name: 'HBO max',
      label: 'HBO max',
      packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
      category: 'filmes',
      bgGradient: 'from-[#271052] via-[#180836] to-[#0c041c]',
      accentGlow: 'rgba(147,51,234,0.55)',
      description: 'Séries HBO, filmes Warner e Champions League',
      renderLogo: () => (
        <div className="flex flex-col items-center leading-none select-none">
          <span className="text-xs sm:text-sm font-black text-white tracking-wider">HBO</span>
          <span className="text-[11px] sm:text-xs font-extrabold text-purple-200 tracking-tight">max</span>
        </div>
      ),
    },
    {
      id: 'app-5',
      name: 'globoplay',
      label: 'globoplay',
      packagesCsv: 'com.globo.globotv',
      category: 'tv',
      bgGradient: 'from-[#ff3d00] via-[#e01e00] to-[#990900]',
      accentGlow: 'rgba(255,61,0,0.6)',
      description: 'TV Globo Ao Vivo, novelas, séries e futebol',
      renderLogo: () => (
        <span className="text-[11px] sm:text-xs font-black text-white tracking-tight drop-shadow select-none">
          globoplay
        </span>
      ),
    },
    {
      id: 'app-6',
      name: 'Apple TV',
      label: 'Apple TV',
      packagesCsv: 'com.apple.atve.androidtv.appletv',
      category: 'filmes',
      bgGradient: 'from-[#242529] via-[#151619] to-[#0a0a0c]',
      accentGlow: 'rgba(255,255,255,0.35)',
      description: 'Apple Originals como Ruptura, Silo e Ted Lasso',
      renderLogo: () => (
        <div className="flex items-center gap-0.5 text-white font-bold text-xs sm:text-sm select-none">
          <span></span>
          <span>tv</span>
        </div>
      ),
    },
    {
      id: 'app-7',
      name: 'Paramount+',
      label: 'Paramount+',
      packagesCsv: 'com.cbs.ca,com.cbs.app',
      category: 'filmes',
      bgGradient: 'from-[#0052d4] via-[#003699] to-[#001c57]',
      accentGlow: 'rgba(0,82,212,0.6)',
      description: 'Filmes de cinema, séries e Libertadores',
      renderLogo: () => (
        <div className="text-center leading-tight select-none">
          <div className="text-[7px] text-white/80 tracking-widest">★★★</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-white italic tracking-tight">
            Paramount+
          </span>
        </div>
      ),
    },
    {
      id: 'app-8',
      name: 'Samsung TV Plus',
      label: 'Samsung TV Plus',
      packagesCsv: 'com.tcl.tv,com.google.android.tv',
      category: 'tv',
      bgGradient: 'from-[#102538] via-[#091624] to-[#050b12]',
      accentGlow: 'rgba(56,189,248,0.5)',
      description: 'Grade de canais IP gratuitos 24 horas',
      renderLogo: () => (
        <div className="flex flex-col items-center leading-none select-none">
          <div className="w-6 h-4 border-2 border-cyan-400 rounded-md flex items-center justify-center mb-0.5">
            <div className="w-2 h-2 bg-orange-400 rounded-xs" />
          </div>
          <span className="text-[7px] sm:text-[8px] font-bold text-white tracking-tight">
            TV Plus
          </span>
        </div>
      ),
    },
  ];

  // 5 "Continuar assistindo" cards matching the reference photo
  const continueWatchingList: ContinueItem[] = [
    {
      id: 'continue-0',
      title: 'THE LAST OF US',
      subtitle: 'T1:E4 • Por Favor, Segure a Minha Mão',
      provider: 'HBO max',
      packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
      providerBadgeClass: 'text-white font-black',
      progress: 42,
      bgGradient: 'from-[#3b2d1d] via-[#1c1610] to-[#090806]',
      accentColor: '#eab308',
      durationRestante: 'Restam 28 min',
    },
    {
      id: 'continue-1',
      title: 'Fallout',
      subtitle: 'T1:E2 • O Alvo',
      provider: 'prime video',
      packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
      providerBadgeClass: 'text-[#00A8E1] font-extrabold',
      progress: 35,
      bgGradient: 'from-[#3d3112] via-[#181f1c] to-[#070a09]',
      accentColor: '#38bdf8',
      durationRestante: 'Restam 39 min',
    },
    {
      id: 'continue-2',
      title: 'HOUSE OF THE DRAGON',
      subtitle: 'T2:E6 • O Povo Comum',
      provider: 'HBO max',
      packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
      providerBadgeClass: 'text-white font-black',
      progress: 68,
      bgGradient: 'from-[#421512] via-[#210b09] to-[#0a0404]',
      accentColor: '#ef4444',
      durationRestante: 'Restam 19 min',
    },
    {
      id: 'continue-3',
      title: 'Ruptura',
      subtitle: 'T1:E8 • O Que Tem Para o Jantar?',
      provider: 'tv+',
      packagesCsv: 'com.apple.atve.androidtv.appletv',
      providerBadgeClass: 'text-white font-bold',
      progress: 54,
      bgGradient: 'from-[#122b3d] via-[#0b1924] to-[#050b10]',
      accentColor: '#60a5fa',
      durationRestante: 'Restam 22 min',
    },
    {
      id: 'continue-4',
      title: 'O PROBLEMA DOS 3 CORPOS',
      subtitle: 'T1:E5 • Dia do Julgamento',
      provider: 'NETFLIX',
      packagesCsv: 'com.netflix.ninja,com.netflix.mediaclient',
      providerBadgeClass: 'text-[#E50914] font-black',
      progress: 78,
      bgGradient: 'from-[#2e1f14] via-[#171219] to-[#07060a]',
      accentColor: '#f97316',
      durationRestante: 'Restam 14 min',
    },
  ];

  // Extra Apps in the App Drawer
  const drawerApps = [
    { name: 'Netflix 4K', icon: '🎬', tag: 'Streaming', pkg: 'com.netflix.ninja,com.netflix.mediaclient' },
    { name: 'YouTube TV', icon: '▶️', tag: 'Vídeos', pkg: 'com.google.android.youtube.tv,com.google.android.youtube' },
    { name: 'Prime Video', icon: '📦', tag: 'Streaming', pkg: 'com.amazon.amazonvideo.livingroom' },
    { name: 'Disney+', icon: '✨', tag: 'Streaming', pkg: 'com.disney.disneyplus' },
    { name: 'HBO Max', icon: '🟣', tag: 'Séries & Filmes', pkg: 'com.wbd.stream' },
    { name: 'Globoplay', icon: '🟠', tag: 'TV Ao Vivo', pkg: 'com.globo.globotv' },
    { name: 'Spotify TV', icon: '🎵', tag: 'Música', pkg: 'com.spotify.tv.android,com.spotify.music' },
    { name: 'SmartTube Next', icon: '🛡️', tag: 'Sem Anúncios', pkg: 'com.liskovsoft.smarttubetv.beta' },
    { name: 'Stremio 4K', icon: '🔮', tag: 'Cinema', pkg: 'com.stremio.one' },
    { name: 'VLC Player', icon: 'コーン', tag: 'Mídia USB', pkg: 'org.videolan.vlc' },
    { name: 'Wi-Fi & Rede', icon: '📶', tag: 'Android 14', pkg: 'WIFI_SETTINGS' },
    { name: 'Configurações da TV', icon: '⚙️', tag: 'Android 14', pkg: 'ANDROID_SETTINGS' },
  ];

  // Left Dock Menu Items
  const dockItems = [
    { id: 'dock-inicio', key: 'inicio', label: 'Início', icon: Home },
    { id: 'dock-apps', key: 'apps', label: 'Apps', icon: Grid },
    { id: 'dock-filmes', key: 'filmes', label: 'Filmes e Séries', icon: Film },
    { id: 'dock-tv', key: 'tv', label: 'TV ao Vivo', icon: Tv2 },
    { id: 'dock-jogos', key: 'jogos', label: 'Jogos', icon: Gamepad2 },
    { id: 'dock-musica', key: 'musica', label: 'Música', icon: Music2 },
    { id: 'dock-config', key: 'config', label: 'Configurações', icon: Settings },
  ];

  const topBarIds = ['top-search', 'top-wifi', 'top-profile', 'top-fullscreen'];

  // Unified D-Pad Command Dispatcher (used by both Physical Remote & Virtual Remote Simulator)
  const executeRemoteCommand = useCallback(
    (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Enter' | 'Escape' | 'Home') => {
      playNavigationSound(key === 'Enter' ? 680 : 540);

      // Home Key always resets to Início and Netflix
      if (key === 'Home') {
        setIsAppDrawerOpen(false);
        setIsSearchOpen(false);
        setActivePlayerModal(null);
        setActiveDock('inicio');
        setFocusedId('app-0');
        triggerToast('🏠 Tela Inicial • Launcher Glass 26');
        return;
      }

      // 1. Handle Player Modal Open
      if (activePlayerModal) {
        if (key === 'Escape' || key === 'Enter') {
          setActivePlayerModal(null);
        }
        return;
      }

      // 2. Handle Search Modal Open
      if (isSearchOpen) {
        if (key === 'Escape') {
          setIsSearchOpen(false);
        }
        return;
      }

      // 3. Handle App Drawer Modal Open
      if (isAppDrawerOpen) {
        if (key === 'Escape') {
          setIsAppDrawerOpen(false);
          return;
        }
        if (key === 'ArrowRight') {
          setDrawerFocusIdx((prev) => Math.min(drawerApps.length - 1, prev + 1));
          return;
        }
        if (key === 'ArrowLeft') {
          setDrawerFocusIdx((prev) => Math.max(0, prev - 1));
          return;
        }
        if (key === 'ArrowDown') {
          setDrawerFocusIdx((prev) => Math.min(drawerApps.length - 1, prev + 4));
          return;
        }
        if (key === 'ArrowUp') {
          setDrawerFocusIdx((prev) => Math.max(0, prev - 4));
          return;
        }
        if (key === 'Enter') {
          const selected = drawerApps[drawerFocusIdx];
          if (selected) {
            setIsAppDrawerOpen(false);
            const bridge = (window as unknown as {
              AndroidTV?: { openSettings?: () => void; openWifiSettings?: () => void };
            }).AndroidTV;
            if (selected.pkg === 'ANDROID_SETTINGS') {
              if (bridge?.openSettings) bridge.openSettings();
              else if (onOpenTermuxGuide) onOpenTermuxGuide();
              else triggerToast('⚙️ Abrindo Configurações do Android 14 TV...');
              return;
            }
            if (selected.pkg === 'WIFI_SETTINGS') {
              if (bridge?.openWifiSettings) bridge.openWifiSettings();
              else triggerToast('📶 Rede Wi-Fi 5GHz Conectada (192.168.0.117)');
              return;
            }
            launchNativeOrSimulate(selected.name, selected.tag, selected.name, selected.pkg);
          }
          return;
        }
        return;
      }

      // 4. Escape on main screen returns focus to Início / Netflix
      if (key === 'Escape') {
        setActiveDock('inicio');
        setFocusedId('app-0');
        return;
      }

      // 5. Enter / OK Action on Main Screen
      if (key === 'Enter') {
        if (focusedId === 'top-search') {
          setIsSearchOpen(true);
          return;
        }
        if (focusedId === 'top-wifi') {
          const bridge = (window as unknown as { AndroidTV?: { openWifiSettings?: () => void } }).AndroidTV;
          if (bridge?.openWifiSettings) {
            bridge.openWifiSettings();
          } else {
            triggerToast('📶 Wi-Fi Conectado • IP da Century Stick: 192.168.0.117');
          }
          return;
        }
        if (focusedId === 'top-profile') {
          triggerToast('👤 Perfil Ativo: Sidney • Century TV Stick (Android 14)');
          return;
        }
        if (focusedId === 'top-fullscreen') {
          toggleFullscreen();
          return;
        }
        if (focusedId === 'hero-banner') {
          const slide = carouselSlides[carouselIndex];
          launchNativeOrSimulate(slide.title, slide.subtitle, slide.tag, slide.packagesCsv);
          return;
        }
        if (focusedId === 'widget-weather') {
          triggerToast('🌕 São Paulo • 18°C • Céu Limpo • Umidade 62%');
          return;
        }
        if (focusedId === 'widget-hdmi') {
          triggerToast('🔌 Entrada HDMI 1 Ativa (1080p / 4K @ 60Hz HDR)');
          return;
        }
        if (focusedId.startsWith('app-')) {
          const idx = parseInt(focusedId.replace('app-', ''), 10);
          const app = appList[idx];
          if (app) {
            launchNativeOrSimulate(app.name, app.description, app.name, app.packagesCsv);
          }
          return;
        }
        if (focusedId.startsWith('continue-')) {
          const idx = parseInt(focusedId.replace('continue-', ''), 10);
          const item = continueWatchingList[idx];
          if (item) {
            launchNativeOrSimulate(
              item.title,
              item.subtitle,
              item.provider,
              item.packagesCsv,
              item.progress
            );
          }
          return;
        }
        if (focusedId.startsWith('dock-')) {
          const dockKey = focusedId.replace('dock-', '');
          setActiveDock(dockKey);
          if (dockKey === 'apps') {
            setDrawerFocusIdx(0);
            setIsAppDrawerOpen(true);
          } else if (dockKey === 'config') {
            const bridge = (window as unknown as { AndroidTV?: { openSettings?: () => void } }).AndroidTV;
            if (bridge?.openSettings) {
              bridge.openSettings();
            } else if (onOpenTermuxGuide) {
              onOpenTermuxGuide();
            } else {
              triggerToast('⚙️ Configurações de Desempenho Ativas (0.5x)');
            }
          } else {
            triggerToast(`📂 Categoria: ${dockItems.find((d) => d.key === dockKey)?.label}`);
          }
          return;
        }
      }

      // 6. Directional D-Pad Navigation Graph
      setFocusedId((current) => {
        // --- TOP BAR ---
        if (topBarIds.includes(current)) {
          const idx = topBarIds.indexOf(current);
          if (key === 'ArrowLeft') {
            return idx > 0 ? topBarIds[idx - 1] : 'dock-inicio';
          }
          if (key === 'ArrowRight') {
            return idx < topBarIds.length - 1 ? topBarIds[idx + 1] : current;
          }
          if (key === 'ArrowDown') {
            return idx === 0 ? 'hero-banner' : 'widget-weather';
          }
          return current;
        }

        // --- LEFT DOCK ---
        if (current.startsWith('dock-')) {
          const dockIdx = dockItems.findIndex((d) => d.id === current);
          if (key === 'ArrowDown') {
            const nextIdx = Math.min(dockItems.length - 1, dockIdx + 1);
            setActiveDock(dockItems[nextIdx].key);
            return dockItems[nextIdx].id;
          }
          if (key === 'ArrowUp') {
            const prevIdx = Math.max(0, dockIdx - 1);
            setActiveDock(dockItems[prevIdx].key);
            return dockItems[prevIdx].id;
          }
          if (key === 'ArrowRight') {
            if (dockIdx <= 1) return 'hero-banner';
            if (dockIdx <= 4) return 'app-0';
            return 'continue-0';
          }
          return current;
        }

        // --- HERO BANNER ---
        if (current === 'hero-banner') {
          if (key === 'ArrowUp') return 'top-search';
          if (key === 'ArrowLeft') return 'dock-inicio';
          if (key === 'ArrowRight') return 'widget-weather';
          if (key === 'ArrowDown') return 'app-0';
          return current;
        }

        // --- WEATHER WIDGET ---
        if (current === 'widget-weather') {
          if (key === 'ArrowUp') return 'top-wifi';
          if (key === 'ArrowLeft') return 'hero-banner';
          if (key === 'ArrowDown') return 'widget-hdmi';
          return current;
        }

        // --- HDMI WIDGET ---
        if (current === 'widget-hdmi') {
          if (key === 'ArrowUp') return 'widget-weather';
          if (key === 'ArrowLeft') return 'hero-banner';
          if (key === 'ArrowDown') return 'app-7';
          return current;
        }

        // --- SEUS APLICATIVOS ROW (app-0 to app-8) ---
        if (current.startsWith('app-')) {
          const idx = parseInt(current.replace('app-', ''), 10);
          if (key === 'ArrowLeft') {
            return idx === 0 ? 'dock-apps' : `app-${idx - 1}`;
          }
          if (key === 'ArrowRight') {
            return idx < appList.length - 1 ? `app-${idx + 1}` : current;
          }
          if (key === 'ArrowUp') {
            return idx <= 5 ? 'hero-banner' : 'widget-hdmi';
          }
          if (key === 'ArrowDown') {
            const targetContinue = Math.min(
              continueWatchingList.length - 1,
              Math.floor((idx / appList.length) * continueWatchingList.length)
            );
            return `continue-${targetContinue}`;
          }
          return current;
        }

        // --- CONTINUAR ASSISTINDO ROW (continue-0 to continue-4) ---
        if (current.startsWith('continue-')) {
          const idx = parseInt(current.replace('continue-', ''), 10);
          if (key === 'ArrowLeft') {
            return idx === 0 ? 'dock-filmes' : `continue-${idx - 1}`;
          }
          if (key === 'ArrowRight') {
            return idx < continueWatchingList.length - 1 ? `continue-${idx + 1}` : current;
          }
          if (key === 'ArrowUp') {
            const targetApp = Math.min(appList.length - 1, idx * 2);
            return `app-${targetApp}`;
          }
          return current;
        }

        return 'app-0';
      });
    },
    [
      activePlayerModal,
      appList,
      carouselIndex,
      carouselSlides,
      continueWatchingList,
      dockItems,
      drawerApps,
      drawerFocusIdx,
      focusedId,
      isAppDrawerOpen,
      isSearchOpen,
      launchNativeOrSimulate,
      onOpenTermuxGuide,
      playNavigationSound,
      toggleFullscreen,
      triggerToast,
    ]
  );

  // Physical Keyboard & Android TV D-Pad Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchOpen && e.target instanceof HTMLInputElement) {
        if (e.key === 'Escape') {
          setIsSearchOpen(false);
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4) {
        e.preventDefault();
        executeRemoteCommand('Escape');
        return;
      }

      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 23) {
        e.preventDefault();
        executeRemoteCommand('Enter');
        return;
      }

      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        executeRemoteCommand(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeRemoteCommand, isSearchOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#060916] text-white font-sans overflow-hidden select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen flex flex-col justify-between'
          : 'rounded-[32px] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] min-h-[680px]'
      }`}
    >
      {/* ========================================================================= */}
      {/* COSMIC PLANET & SUNSET MOUNTAIN LAKE WALLPAPER (Fiel à Foto enviada)      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Twilight Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e22] via-[#171836] to-[#080a16]" />

        {/* Subtle Starfield */}
        <div
          className="absolute inset-0 opacity-35 bg-[radial-gradient(white_1px,transparent_1px)]"
          style={{ backgroundSize: '46px 46px' }}
        />

        {/* Giant Ringed Planet at Top Right-Center */}
        <div className="absolute -top-24 right-[18%] w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#d946ef]/40 via-[#ec4899]/35 to-[#f97316]/30 blur-2xl" />
        <div className="absolute -top-20 right-[19%] w-[330px] h-[330px] rounded-full bg-gradient-to-br from-[#3b2d54] via-[#211936] to-[#0d0a1a] shadow-[inset_-30px_-20px_60px_rgba(0,0,0,0.85),0_0_80px_rgba(236,72,153,0.3)] border border-white/10" />

        {/* Secondary Small Moon to the right of the planet */}
        <div className="absolute top-14 right-[14%] w-12 h-12 rounded-full bg-gradient-to-br from-[#f8cba6] via-[#b37d64] to-[#2c1d24] shadow-[0_0_25px_rgba(248,203,166,0.45)]" />

        {/* Warm Sunset Glow Horizon behind Mountains */}
        <div className="absolute top-[22%] left-[18%] right-[12%] h-52 bg-gradient-to-r from-indigo-500/20 via-[#ff7b54]/35 to-purple-500/20 blur-3xl" />

        {/* Jagged Alpine Mountains & Lake Reflection */}
        <svg
          className="absolute bottom-24 left-0 right-0 w-full h-64 opacity-65"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#11152c"
            d="M0,192L120,130L240,180L380,85L510,165L660,64L820,175L960,95L1110,160L1270,70L1440,150L1440,320L0,320Z"
          />
          <path
            fill="#090c1c"
            d="M0,224L160,165L310,210L490,120L650,205L830,115L1010,195L1190,130L1350,190L1440,160L1440,320L0,320Z"
          />
        </svg>

        {/* Bottom Lake Dark Glass Vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#050711] via-[#070b19]/95 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* TOP BAR: CLOCK (Left) + STATUS & REMOTE SIMULATOR TOGGLE (Right)          */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex items-start justify-between px-5 sm:px-8 pt-4 sm:pt-6 pb-2">
        {/* Top Left Clock & Date (20:35 / Seg, 26 de Maio) */}
        <div className="pl-1">
          <div className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-none drop-shadow-md">
            {timeStr}
          </div>
          <div className="text-xs sm:text-sm text-slate-300/90 font-medium mt-1 tracking-wide">
            {dateStr}
          </div>
        </div>

        {/* Center Pill Status + Remote Simulator Button */}
        <div className="hidden md:flex items-center gap-2 bg-black/45 backdrop-blur-xl border border-white/15 px-3.5 py-1.5 rounded-full text-[11px] text-slate-200 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Launcher Glass 26</span>
          <span className="text-white/30">•</span>
          <span className="text-cyan-300">Android 14 TV</span>
          <button
            onClick={() => setShowVirtualRemote((prev) => !prev)}
            className={`ml-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              showVirtualRemote
                ? 'bg-cyan-400 text-slate-950'
                : 'bg-white/10 hover:bg-white/20 text-cyan-300 border border-cyan-400/30'
            }`}
          >
            <Gamepad className="w-3 h-3" />
            <span>{showVirtualRemote ? 'Ocultar Controle' : 'Simular Controle TV'}</span>
          </button>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-1 text-slate-300 hover:text-white cursor-pointer"
            title="Som de navegação do controle"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Top Right Icons: Search, Wi-Fi, User Profile (Exato como na foto) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="tv-focus-top-search"
            onClick={() => {
              setFocusedId('top-search');
              setIsSearchOpen(true);
            }}
            onMouseEnter={() => setFocusedId('top-search')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              focusedId === 'top-search'
                ? 'bg-white/25 ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.8)] scale-110'
                : 'bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
            title="Pesquisar na TV"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          <button
            id="tv-focus-top-wifi"
            onClick={() => {
              setFocusedId('top-wifi');
              executeRemoteCommand('Enter');
            }}
            onMouseEnter={() => setFocusedId('top-wifi')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              focusedId === 'top-wifi'
                ? 'bg-white/25 ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.8)] scale-110'
                : 'bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
            title="Wi-Fi Conectado (192.168.0.117)"
          >
            <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          <button
            id="tv-focus-top-profile"
            onClick={() => {
              setFocusedId('top-profile');
              triggerToast('👤 Perfil Century TV Stick (Android 14 • 2GB RAM Otimizado)');
            }}
            onMouseEnter={() => setFocusedId('top-profile')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center border border-white/40 transition-all cursor-pointer ${
              focusedId === 'top-profile'
                ? 'ring-2 ring-cyan-300 shadow-[0_0_22px_rgba(56,189,248,0.9)] scale-110'
                : 'shadow-md'
            }`}
            title="Perfil do Usuário"
          >
            <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center text-[10px] font-black text-blue-700">
              S
            </div>
          </button>

          <button
            id="tv-focus-top-fullscreen"
            onClick={() => {
              setFocusedId('top-fullscreen');
              toggleFullscreen();
            }}
            onMouseEnter={() => setFocusedId('top-fullscreen')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              focusedId === 'top-fullscreen'
                ? 'bg-white/25 ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.8)] scale-110'
                : 'bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-300'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Expandir Modo TV'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN BODY: LEFT GLASS DOCK + RIGHT CONTENT AREA                           */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-5 px-5 sm:px-8 pb-6 pt-1 overflow-y-auto no-scrollbar">
        {/* ======================================================================= */}
        {/* LEFT FLOATING GLASS DOCK (Cápsula de Vidro Líquido idêntica à foto)     */}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-52 shrink-0 flex flex-col justify-center">
          <nav className="backdrop-blur-2xl bg-white/[0.06] border border-white/20 rounded-[28px] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDock === item.key;
              const isFocused = focusedId === item.id;

              return (
                <button
                  key={item.id}
                  id={`tv-focus-${item.id}`}
                  onClick={() => {
                    playNavigationSound();
                    setFocusedId(item.id);
                    setActiveDock(item.key);
                    if (item.key === 'apps') {
                      setDrawerFocusIdx(0);
                      setIsAppDrawerOpen(true);
                    } else if (item.key === 'config' && onOpenTermuxGuide) {
                      onOpenTermuxGuide();
                    }
                  }}
                  onMouseEnter={() => setFocusedId(item.id)}
                  className={`py-2.5 px-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer shrink-0 lg:w-full text-left relative ${
                    isActive || isFocused
                      ? 'bg-gradient-to-r from-[#2563eb]/80 via-[#1d4ed8]/65 to-[#1e3a8a]/50 text-white font-bold border border-cyan-300/80 shadow-[0_0_24px_rgba(56,189,248,0.55),inset_0_1px_8px_rgba(255,255,255,0.35)]'
                      : 'text-slate-300/90 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                  } ${isFocused ? 'scale-[1.03] ring-2 ring-white/90' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                      isActive || isFocused ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ======================================================================= */}
        {/* RIGHT MAIN CONTENT (Hero + Widgets + 9 Apps + 5 Continue Watching)      */}
        {/* ======================================================================= */}
        <div className="flex-1 flex flex-col justify-between space-y-4 min-w-0">
          {/* TOP SECTION: HERO BANNER + WEATHER & INPUTS WIDGETS */}
          <div className="flex flex-col xl:flex-row gap-4 items-stretch">
            {/* 1. Central Glass Hero Banner ("Descubra novos mundos") */}
            <div
              id="tv-focus-hero-banner"
              onClick={() => {
                setFocusedId('hero-banner');
                const slide = carouselSlides[carouselIndex];
                launchNativeOrSimulate(slide.title, slide.subtitle, slide.tag, slide.packagesCsv);
              }}
              onMouseEnter={() => setFocusedId('hero-banner')}
              className={`flex-1 rounded-[28px] border backdrop-blur-2xl bg-gradient-to-br ${
                carouselSlides[carouselIndex].bgAccent
              } p-5 sm:p-7 flex flex-col justify-between min-h-[195px] sm:min-h-[215px] relative overflow-hidden transition-all duration-300 cursor-pointer ${
                focusedId === 'hero-banner'
                  ? 'border-cyan-300 ring-2 ring-cyan-300/90 shadow-[0_0_35px_rgba(56,189,248,0.65)] scale-[1.01]'
                  : 'border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.55)]'
              }`}
            >
              {/* Scenic Mountain & Sunset reflection inside banner */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,140,80,0.32),transparent_60%)] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5 max-w-lg">
                <div className="text-[10px] sm:text-xs font-extrabold tracking-wider text-white/90 uppercase">
                  {carouselSlides[carouselIndex].tag}
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                  {carouselSlides[carouselIndex].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium">
                  {carouselSlides[carouselIndex].subtitle}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4">
                <div className="inline-flex items-center gap-2 bg-black/55 hover:bg-black/75 backdrop-blur-xl border border-white/30 text-white font-semibold px-4 py-2 rounded-full text-xs sm:text-sm shadow-lg transition">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{carouselSlides[carouselIndex].actionText}</span>
                </div>

                {/* Carousel Dots + Prev/Next controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndex((prev) => (prev - 1 + 5) % 5);
                    }}
                    className="p-1 rounded-full bg-black/30 hover:bg-white/20 text-white/70 hover:text-white cursor-pointer"
                    title="Slide Anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <button
                      key={dot}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex(dot);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dot === carouselIndex ? 'w-5 bg-white shadow-[0_0_8px_#fff]' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndex((prev) => (prev + 1) % 5);
                    }}
                    className="p-1 rounded-full bg-black/30 hover:bg-white/20 text-white/70 hover:text-white cursor-pointer"
                    title="Próximo Slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Right Widgets Column: Weather (São Paulo 18°) & Entradas (HDMI 1) */}
            <div className="w-full xl:w-56 shrink-0 grid grid-cols-2 xl:grid-cols-1 gap-3">
              {/* Weather Glass Card */}
              <div
                id="tv-focus-widget-weather"
                onClick={() => {
                  setFocusedId('widget-weather');
                  triggerToast('🌕 Clima em São Paulo: 18°C • Céu Limpo');
                }}
                onMouseEnter={() => setFocusedId('widget-weather')}
                className={`rounded-[24px] border backdrop-blur-2xl bg-white/[0.08] p-4 flex items-center justify-between transition-all cursor-pointer ${
                  focusedId === 'widget-weather'
                    ? 'border-cyan-300 ring-2 ring-cyan-300 shadow-[0_0_28px_rgba(56,189,248,0.65)] scale-[1.03]'
                    : 'border-white/20 shadow-lg hover:border-white/35'
                }`}
              >
                {/* 3D Full Moon sphere matching screenshot */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.45),0_0_20px_rgba(255,255,255,0.35)] flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="w-3 h-3 rounded-full bg-slate-400/50 absolute top-2.5 left-3" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400/40 absolute bottom-3 right-3" />
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-200 font-medium">São Paulo</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white leading-tight">18°</div>
                  <div className="text-[11px] text-slate-300/90">Céu Limpo</div>
                </div>
              </div>

              {/* Entradas HDMI 1 Glass Card */}
              <div
                id="tv-focus-widget-hdmi"
                onClick={() => {
                  setFocusedId('widget-hdmi');
                  triggerToast('🔌 Entrada HDMI 1: Century TV Stick (Sinal 4K HDR Ativo)');
                }}
                onMouseEnter={() => setFocusedId('widget-hdmi')}
                className={`rounded-[24px] border backdrop-blur-2xl bg-white/[0.08] p-4 flex items-center justify-between transition-all cursor-pointer ${
                  focusedId === 'widget-hdmi'
                    ? 'border-cyan-300 ring-2 ring-cyan-300 shadow-[0_0_28px_rgba(56,189,248,0.65)] scale-[1.03]'
                    : 'border-white/20 shadow-lg hover:border-white/35'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-300/80 font-medium flex items-center gap-1">
                    <span>──</span>
                    <span>Entradas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                    <Monitor className="w-4 h-4 text-slate-200" />
                    <span>HDMI 1</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* MIDDLE ROW: "Seus Aplicativos" (9 Squircle Glass Cards in 1 Row)      */}
          {/* ===================================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white/95 tracking-wide">
                Seus Aplicativos
              </h3>
              {activeDock !== 'inicio' && (
                <span className="text-[11px] text-cyan-300 font-semibold">
                  Filtro ativo: {dockItems.find((d) => d.key === activeDock)?.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-9 gap-2 sm:gap-3 pt-1">
              {appList.map((app) => {
                const isFocused = focusedId === app.id;
                const isDimmed =
                  activeDock !== 'inicio' &&
                  activeDock !== 'apps' &&
                  activeDock !== 'config' &&
                  app.category !== activeDock;

                return (
                  <div
                    key={app.id}
                    id={`tv-focus-${app.id}`}
                    onClick={() => {
                      playNavigationSound();
                      setFocusedId(app.id);
                      launchNativeOrSimulate(app.name, app.description, app.name, app.packagesCsv);
                    }}
                    onMouseEnter={() => setFocusedId(app.id)}
                    className={`flex flex-col items-center gap-1.5 cursor-pointer transition-opacity ${
                      isDimmed ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    <div
                      className={`w-full aspect-square rounded-[20px] sm:rounded-[24px] flex items-center justify-center relative overflow-hidden bg-gradient-to-b ${
                        app.bgGradient
                      } transition-all duration-200 ${
                        isFocused
                          ? 'border-2 border-cyan-200 ring-2 ring-cyan-400/90 shadow-[0_0_32px_rgba(56,189,248,0.95)] scale-110 -translate-y-1 z-20'
                          : 'border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.6)] hover:border-white/40'
                      }`}
                    >
                      {/* Top glass specular highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

                      {/* Bottom inner glow */}
                      <div
                        className="absolute inset-0 opacity-35 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 85%, ${app.accentGlow}, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10 flex items-center justify-center p-1">
                        {app.renderLogo()}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[11px] truncate max-w-full text-center transition-colors ${
                        isFocused ? 'text-white font-bold drop-shadow' : 'text-slate-300/90 font-medium'
                      }`}
                    >
                      {app.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM ROW: "Continuar assistindo" (5 Landscape Cards with Progress)  */}
          {/* ===================================================================== */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-white/95 tracking-wide">
              Continuar assistindo
            </h3>

            <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5">
              {continueWatchingList.map((item) => {
                const isFocused = focusedId === item.id;
                return (
                  <div
                    key={item.id}
                    id={`tv-focus-${item.id}`}
                    onClick={() => {
                      playNavigationSound();
                      setFocusedId(item.id);
                      launchNativeOrSimulate(
                        item.title,
                        item.subtitle,
                        item.provider,
                        item.packagesCsv,
                        item.progress
                      );
                    }}
                    onMouseEnter={() => setFocusedId(item.id)}
                    className={`rounded-[20px] sm:rounded-[22px] bg-gradient-to-br ${
                      item.bgGradient
                    } overflow-hidden relative flex flex-col justify-between h-24 sm:h-32 p-2.5 sm:p-3.5 cursor-pointer transition-all duration-200 ${
                      isFocused
                        ? 'border-2 border-cyan-300 ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(56,189,248,0.85)] scale-[1.04] -translate-y-1 z-20'
                        : 'border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.65)] hover:border-white/35'
                    }`}
                  >
                    {/* Top glass sheen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-white/10 pointer-events-none" />

                    {/* Top metadata */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-slate-200 border border-white/10 truncate">
                        {item.durationRestante}
                      </span>
                    </div>

                    {/* Poster Stylized Title & Provider Logo */}
                    <div className="relative z-10 space-y-1.5">
                      <div className="flex items-end justify-between gap-1">
                        <div className="min-w-0">
                          <div className="text-[10px] sm:text-xs font-black text-white tracking-wide uppercase truncate drop-shadow">
                            {item.title}
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-slate-300 truncate hidden sm:block">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className={`text-[8px] sm:text-[10px] shrink-0 ${item.providerBadgeClass}`}>
                          {item.provider}
                        </span>
                      </div>

                      {/* Glowing Blue Progress Bar matching screenshot */}
                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full shadow-[0_0_8px_#38bdf8]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIRTUAL TV REMOTE SIMULATOR (Para testar tudo na tela sem erros)          */}
      {/* ========================================================================= */}
      {showVirtualRemote && (
        <div className="absolute bottom-4 right-4 z-40 w-52 bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white">Controle Century TV</span>
            </div>
            <button
              onClick={() => setShowVirtualRemote(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* D-Pad Circle */}
          <div className="relative w-32 h-32 mx-auto rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner">
            <button
              onClick={() => executeRemoteCommand('ArrowUp')}
              className="absolute top-1.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-slate-200 hover:text-cyan-400 active:scale-90 cursor-pointer"
              title="Cima"
            >
              ▲
            </button>
            <button
              onClick={() => executeRemoteCommand('ArrowDown')}
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-slate-200 hover:text-cyan-400 active:scale-90 cursor-pointer"
              title="Baixo"
            >
              ▼
            </button>
            <button
              onClick={() => executeRemoteCommand('ArrowLeft')}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 px-2 py-2 text-xs font-bold text-slate-200 hover:text-cyan-400 active:scale-90 cursor-pointer"
              title="Esquerda"
            >
              ◄
            </button>
            <button
              onClick={() => executeRemoteCommand('ArrowRight')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-2 text-xs font-bold text-slate-200 hover:text-cyan-400 active:scale-90 cursor-pointer"
              title="Direita"
            >
              ►
            </button>
            <button
              onClick={() => executeRemoteCommand('Enter')}
              className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
            >
              OK
            </button>
          </div>

          {/* Bottom Remote Action Keys */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => executeRemoteCommand('Escape')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 py-1.5 rounded-xl font-semibold cursor-pointer"
            >
              ↩ Voltar
            </button>
            <button
              onClick={() => executeRemoteCommand('Home')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 py-1.5 rounded-xl font-bold cursor-pointer"
            >
              🏠 Home
            </button>
            <button
              onClick={() => {
                setDrawerFocusIdx(0);
                setIsAppDrawerOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 py-1.5 rounded-xl font-semibold cursor-pointer"
            >
              ⊞ Apps
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE STREAMING / APP SIMULATOR MODAL (Evita erro de navegador)     */}
      {/* ========================================================================= */}
      {activePlayerModal && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-extrabold border border-cyan-500/30">
                  {activePlayerModal.provider}
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>4K HDR • 60 FPS</span>
                </span>
              </div>
              <button
                onClick={() => setActivePlayerModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 py-2">
              <h3 className="text-2xl font-extrabold text-white">{activePlayerModal.title}</h3>
              <p className="text-sm text-slate-300">{activePlayerModal.subtitle}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pacote Android TV: <code className="text-cyan-300">{activePlayerModal.packagesCsv.split(',')[0]}</code></span>
              </div>
            </div>

            {typeof activePlayerModal.progress === 'number' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Progresso salvo</span>
                  <span>{activePlayerModal.progress}% concluído</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                    style={{ width: `${activePlayerModal.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300">
              Na sua <strong>Century TV Stick (Android 14)</strong>, clicar neste card abre diretamente o aplicativo nativo instalado na TV via <code className="text-cyan-300">Leanback Launch Intent</code>, sem precisar de navegador web.
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setActivePlayerModal(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Voltar para a Launcher (OK / Back)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCH MODAL                                                              */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Pesquisa Rápida na Century TV</span>
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes, séries ou aplicativos..."
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {appList
                .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      launchNativeOrSimulate(app.name, app.description, app.name, app.packagesCsv);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{app.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APP DRAWER MODAL (100% Navegável pelo Controle Remoto D-Pad)              */}
      {/* ========================================================================= */}
      {isAppDrawerOpen && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Todos os Aplicativos (Android 14 TV)</h3>
                  <p className="text-[11px] text-slate-400">
                    Use as setas do controle e OK para abrir • Century TV Stick
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAppDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto no-scrollbar p-1">
              {drawerApps.map((app, idx) => {
                const isSelected = drawerFocusIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setDrawerFocusIdx(idx);
                      setIsAppDrawerOpen(false);
                      launchNativeOrSimulate(app.name, app.tag, app.name, app.pkg);
                    }}
                    onMouseEnter={() => setDrawerFocusIdx(idx)}
                    className={`rounded-2xl p-3 text-center space-y-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/30 border-cyan-300 ring-2 ring-cyan-300 scale-105 shadow-[0_0_20px_rgba(56,189,248,0.6)]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mx-auto">{app.icon}</div>
                    <div className="text-xs font-bold text-white truncate">{app.name}</div>
                    <div className="text-[10px] text-cyan-300/80">{app.tag}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING TOAST FEEDBACK                                                   */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-cyan-400/80 text-white px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] backdrop-blur-xl flex items-center gap-2 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
