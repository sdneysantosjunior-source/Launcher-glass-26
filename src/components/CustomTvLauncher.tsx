import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import {
  Home,
  Grid,
  Clapperboard,
  Tv,
  Gamepad2,
  Music,
  Settings,
  Play,
  Plus,
  Check,
  ChevronRight,
  X,
  Terminal,
  Sparkles,
  Wifi,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Trash2,
  RefreshCw,
  Layers
} from 'lucide-react';

interface CustomTvLauncherProps {
  onOpenSystemPanel?: (tab: 'termux' | 'debloat' | 'tweaks' | 'chat') => void;
}

interface AppCardItem {
  id: string;
  name: string;
  packagesCsv: string;
  deepLink: string;
  category: 'all' | 'filmes' | 'tv' | 'jogos' | 'musica';
  iconSrc?: string;
  accentGradient?: string;
  isMoreApps?: boolean;
}

export interface WatchNextItem {
  id: string;
  title: string;
  subtitle: string;
  provider: string;
  packagesCsv: string;
  deepLink: string;
  artSrc?: string;
  appIconSrc?: string;
  accentGradient?: string;
  progress: number;
  category: 'filmes' | 'tv' | 'jogos' | 'musica';
  isThirdParty: boolean;
  lastUpdated?: string;
}

interface InstalledAndroidApp {
  packageName: string;
  label: string;
  isTvApp: boolean;
  isThirdParty?: boolean;
}

const HdmiPortIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 9h16l-2 6H6L4 9z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 12h8" strokeLinecap="round" />
  </svg>
);

// Spring transition preset tuned for 60fps D-Pad remote focus on Android TV
const dpadSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 28,
  mass: 0.75,
};

// Third-party streaming apps catalog (used for "Seus Aplicativos" and 3rd-party "Continuar Assistindo" integration)
const THIRD_PARTY_STREAMING_APPS: AppCardItem[] = [
  {
    id: 'app-0',
    name: 'Netflix',
    packagesCsv: 'com.netflix.ninja,com.netflix.mediaclient',
    deepLink: 'nflx://www.netflix.com',
    category: 'filmes',
    iconSrc: './assets/launcher/icon_netflix.png',
    accentGradient: 'from-[#7f1d1d]/85 via-[#450a0a]/80 to-[#090d1a]/95',
  },
  {
    id: 'app-1',
    name: 'Prime Video',
    packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
    deepLink: 'https://app.primevideo.com',
    category: 'filmes',
    iconSrc: './assets/launcher/icon_prime.png',
    accentGradient: 'from-[#0369a1]/85 via-[#0c4a6e]/80 to-[#090d1a]/95',
  },
  {
    id: 'app-2',
    name: 'Disney+',
    packagesCsv: 'com.disney.disneyplus',
    deepLink: 'https://www.disneyplus.com',
    category: 'filmes',
    iconSrc: './assets/launcher/icon_disney.png',
    accentGradient: 'from-[#1e3a8a]/85 via-[#172554]/85 to-[#090d1a]/95',
  },
  {
    id: 'app-3',
    name: 'YouTube',
    packagesCsv: 'com.google.android.youtube.tv,com.liskovsoft.smarttubetv.beta,com.google.android.youtube',
    deepLink: 'vnd.youtube://',
    category: 'tv',
    iconSrc: './assets/launcher/icon_youtube.png',
    accentGradient: 'from-[#991b1b]/85 via-[#450a0a]/80 to-[#090d1a]/95',
  },
  {
    id: 'app-4',
    name: 'Max',
    packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
    deepLink: 'https://play.max.com',
    category: 'filmes',
    iconSrc: './assets/launcher/icon_max.png',
    accentGradient: 'from-[#1d4ed8]/85 via-[#1e1b4b]/85 to-[#090d1a]/95',
  },
  {
    id: 'app-5',
    name: 'Globoplay',
    packagesCsv: 'com.globo.globotv',
    deepLink: 'https://globoplay.globo.com',
    category: 'tv',
    iconSrc: './assets/launcher/icon_globoplay.png',
    accentGradient: 'from-[#c2410c]/85 via-[#7c2d12]/80 to-[#090d1a]/95',
  },
  {
    id: 'app-6',
    name: 'Apple TV',
    packagesCsv: 'com.apple.atve.androidtv.appletv',
    deepLink: 'https://tv.apple.com',
    category: 'filmes',
    iconSrc: './assets/launcher/icon_appletv.png',
    accentGradient: 'from-[#334155]/85 via-[#0f172a]/85 to-[#090d1a]/95',
  },
  {
    id: 'app-7',
    name: 'Spotify',
    packagesCsv: 'com.spotify.tv.android,com.spotify.music',
    deepLink: 'spotify://',
    category: 'musica',
    iconSrc: './assets/launcher/icon_spotify.png',
    accentGradient: 'from-[#15803d]/85 via-[#052e16]/85 to-[#090d1a]/95',
  },
  {
    id: 'app-8',
    name: 'Mais Apps',
    packagesCsv: '',
    deepLink: '',
    category: 'all',
    isMoreApps: true,
  },
];

// Initial 3rd-party app sessions (exclusively 3rd-party apps — no static design-photo placeholder movies)
const buildInitialThirdPartyContinueWatching = (): WatchNextItem[] => [
  {
    id: 'continue-0',
    title: 'Netflix • Continuar Sessão',
    subtitle: 'App de Terceiro • Retomar reprodução',
    provider: 'Netflix',
    packagesCsv: 'com.netflix.ninja,com.netflix.mediaclient',
    deepLink: 'nflx://www.netflix.com',
    appIconSrc: './assets/launcher/icon_netflix.png',
    accentGradient: 'from-[#991b1b]/90 via-[#450a0a]/85 to-[#090d1a]/95',
    progress: 64,
    category: 'filmes',
    isThirdParty: true,
    lastUpdated: 'Sincronizado via Watch Next',
  },
  {
    id: 'continue-1',
    title: 'Prime Video • Continuar Sessão',
    subtitle: 'App de Terceiro • Retomar reprodução',
    provider: 'Prime Video',
    packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
    deepLink: 'https://app.primevideo.com',
    appIconSrc: './assets/launcher/icon_prime.png',
    accentGradient: 'from-[#0284c7]/90 via-[#0c4a6e]/85 to-[#090d1a]/95',
    progress: 48,
    category: 'filmes',
    isThirdParty: true,
    lastUpdated: 'Sincronizado via Watch Next',
  },
  {
    id: 'continue-2',
    title: 'YouTube TV • Continuar Assistindo',
    subtitle: 'App de Terceiro • Último vídeo ativo',
    provider: 'YouTube',
    packagesCsv: 'com.google.android.youtube.tv,com.liskovsoft.smarttubetv.beta,com.google.android.youtube',
    deepLink: 'vnd.youtube://',
    appIconSrc: './assets/launcher/icon_youtube.png',
    accentGradient: 'from-[#b91c1c]/90 via-[#450a0a]/85 to-[#090d1a]/95',
    progress: 72,
    category: 'tv',
    isThirdParty: true,
    lastUpdated: 'Sincronizado via Watch Next',
  },
  {
    id: 'continue-3',
    title: 'Disney+ • Continuar Sessão',
    subtitle: 'App de Terceiro • Retomar reprodução',
    provider: 'Disney+',
    packagesCsv: 'com.disney.disneyplus',
    deepLink: 'https://www.disneyplus.com',
    appIconSrc: './assets/launcher/icon_disney.png',
    accentGradient: 'from-[#1d4ed8]/90 via-[#172554]/85 to-[#090d1a]/95',
    progress: 38,
    category: 'filmes',
    isThirdParty: true,
    lastUpdated: 'Sincronizado via Watch Next',
  },
  {
    id: 'continue-4',
    title: 'Max • Continuar Sessão',
    subtitle: 'App de Terceiro • Retomar reprodução',
    provider: 'Max',
    packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
    deepLink: 'https://play.max.com',
    appIconSrc: './assets/launcher/icon_max.png',
    accentGradient: 'from-[#2563eb]/90 via-[#1e1b4b]/85 to-[#090d1a]/95',
    progress: 55,
    category: 'filmes',
    isThirdParty: true,
    lastUpdated: 'Sincronizado via Watch Next',
  },
];

// Helper to match a package name to a known 3rd-party app icon & gradient
const resolveThirdPartyBrand = (pkgOrName: string) => {
  const lower = pkgOrName.toLowerCase();
  if (lower.includes('netflix')) {
    return {
      iconSrc: './assets/launcher/icon_netflix.png',
      accentGradient: 'from-[#991b1b]/90 via-[#450a0a]/85 to-[#090d1a]/95',
      provider: 'Netflix',
    };
  }
  if (lower.includes('amazon') || lower.includes('prime') || lower.includes('avod')) {
    return {
      iconSrc: './assets/launcher/icon_prime.png',
      accentGradient: 'from-[#0284c7]/90 via-[#0c4a6e]/85 to-[#090d1a]/95',
      provider: 'Prime Video',
    };
  }
  if (lower.includes('disney')) {
    return {
      iconSrc: './assets/launcher/icon_disney.png',
      accentGradient: 'from-[#1d4ed8]/90 via-[#172554]/85 to-[#090d1a]/95',
      provider: 'Disney+',
    };
  }
  if (lower.includes('youtube') || lower.includes('smarttube')) {
    return {
      iconSrc: './assets/launcher/icon_youtube.png',
      accentGradient: 'from-[#b91c1c]/90 via-[#450a0a]/85 to-[#090d1a]/95',
      provider: lower.includes('smarttube') ? 'SmartTube' : 'YouTube',
    };
  }
  if (lower.includes('wbd') || lower.includes('hbo') || lower.includes('max')) {
    return {
      iconSrc: './assets/launcher/icon_max.png',
      accentGradient: 'from-[#2563eb]/90 via-[#1e1b4b]/85 to-[#090d1a]/95',
      provider: 'Max',
    };
  }
  if (lower.includes('globo')) {
    return {
      iconSrc: './assets/launcher/icon_globoplay.png',
      accentGradient: 'from-[#ea580c]/90 via-[#7c2d12]/85 to-[#090d1a]/95',
      provider: 'Globoplay',
    };
  }
  if (lower.includes('apple')) {
    return {
      iconSrc: './assets/launcher/icon_appletv.png',
      accentGradient: 'from-[#475569]/90 via-[#0f172a]/85 to-[#090d1a]/95',
      provider: 'Apple TV',
    };
  }
  if (lower.includes('spotify')) {
    return {
      iconSrc: './assets/launcher/icon_spotify.png',
      accentGradient: 'from-[#16a34a]/90 via-[#052e16]/85 to-[#090d1a]/95',
      provider: 'Spotify',
    };
  }
  return {
    iconSrc: undefined,
    accentGradient: 'from-[#1e40af]/85 via-[#0f172a]/85 to-[#090d1a]/95',
    provider: pkgOrName,
  };
};

export const CustomTvLauncher: React.FC<CustomTvLauncherProps> = ({ onOpenSystemPanel }) => {
  // Clock & Date
  const [timeStr, setTimeStr] = useState('20:35');
  const [dateStr, setDateStr] = useState('Sáb, 26 de Maio');

  // Active Sidebar Category
  const [activeDock, setActiveDock] = useState<string>('inicio');

  // Focus ID for 100% D-Pad Remote Control Navigation
  const [focusedId, setFocusedId] = useState<string>('app-0');

  // Active HDMI Input (1, 2, or 3)
  const [activeHdmi, setActiveHdmi] = useState<number>(1);

  // Hero Spotlight Carousel Index (0 to 4)
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // My List state (persisted)
  const [myListIds, setMyListIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lg26_mylist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Weather state (live + cyclable cities)
  const [cityIndex, setCityIndex] = useState<number>(0);
  const cities = [
    { name: 'São Paulo - SP', temp: '26°C', status: 'Céu Limpo', lat: -23.55, lon: -46.63 },
    { name: 'Rio de Janeiro - RJ', temp: '29°C', status: 'Ensolarado', lat: -22.9, lon: -43.17 },
    { name: 'Belo Horizonte - MG', temp: '25°C', status: 'Céu Limpo', lat: -19.91, lon: -43.93 },
    { name: 'Curitiba - PR', temp: '21°C', status: 'Parcialmente Nublado', lat: -25.42, lon: -49.27 },
    { name: 'Brasília - DF', temp: '27°C', status: 'Céu Limpo', lat: -15.78, lon: -47.92 },
  ];
  const [liveTemp, setLiveTemp] = useState<string>('26°C');
  const [liveCondition, setLiveCondition] = useState<string>('Céu Limpo');

  // Sound feedback toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showRemoteOverlay, setShowRemoteOverlay] = useState<boolean>(false);

  // Modals
  const [isAppsDrawerOpen, setIsAppsDrawerOpen] = useState<boolean>(false);
  const [drawerFocusIdx, setDrawerFocusIdx] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsFocusIdx, setSettingsFocusIdx] = useState<number>(0);
  const [activeMediaModal, setActiveMediaModal] = useState<WatchNextItem | null>(null);

  // Installed 3rd-party apps from Android TV native bridge
  const [installedApps, setInstalledApps] = useState<InstalledAndroidApp[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const playSound = useCallback(
    (freq = 540) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch {
        // Ignore audio context restrictions before user gesture
      }
    },
    [soundEnabled]
  );

  // "Continuar Assistindo" state — strictly from 3rd-party apps (persisted in lg26_3p_watch_next_v3)
  const [watchNextList, setWatchNextList] = useState<WatchNextItem[]>(() => {
    try {
      // Clean up legacy static movie key if present
      localStorage.removeItem('lg26_watch_next_v2');
      const saved = localStorage.getItem('lg26_3p_watch_next_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return buildInitialThirdPartyContinueWatching();
  });

  // Save 3rd-party Watch Next changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lg26_3p_watch_next_v3', JSON.stringify(watchNextList));
    } catch {
      // ignore
    }
  }, [watchNextList]);

  // Synchronize 3rd-party Watch Next & Installed 3rd-party Apps from Android 14 TV Bridge
  const syncThirdPartyWatchNextFromBridge = useCallback(
    (showNotification = false) => {
      const bridge = (window as unknown as {
        AndroidTV?: {
          getInstalledAppsJson?: () => string;
          getWatchNextProgramsJson?: () => string;
        };
      }).AndroidTV;

      let detectedInstalled: InstalledAndroidApp[] = [];
      if (bridge?.getInstalledAppsJson) {
        try {
          const raw = bridge.getInstalledAppsJson();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            detectedInstalled = parsed;
            setInstalledApps(parsed);
          }
        } catch {
          // ignore
        }
      }

      if (bridge?.getWatchNextProgramsJson) {
        try {
          const rawWatch = bridge.getWatchNextProgramsJson();
          const parsedWatch = JSON.parse(rawWatch);
          if (Array.isArray(parsedWatch) && parsedWatch.length > 0) {
            const thirdPartyItems: WatchNextItem[] = parsedWatch.slice(0, 5).map((prog, idx) => {
              const pkg = prog.packageName || '';
              const brand = resolveThirdPartyBrand(pkg || prog.provider || '');
              const providerName = prog.provider || brand.provider || 'App de Terceiro';
              return {
                id: `continue-${idx}`,
                title: prog.title || `${providerName} • Continuar`,
                subtitle: prog.subtitle || `App de Terceiro • ${providerName}`,
                provider: providerName,
                packagesCsv: pkg || providerName,
                deepLink: prog.intentUri || '',
                artSrc:
                  prog.posterUri &&
                  (prog.posterUri.startsWith('http://') ||
                    prog.posterUri.startsWith('https://') ||
                    prog.posterUri.startsWith('data:'))
                    ? prog.posterUri
                    : undefined,
                appIconSrc: brand.iconSrc,
                accentGradient: brand.accentGradient,
                progress: typeof prog.progress === 'number' ? prog.progress : 45,
                category: 'filmes',
                isThirdParty: true,
                lastUpdated: 'Watch Next Nativo Android 14 TV',
              };
            });

            if (thirdPartyItems.length > 0) {
              setWatchNextList((prev) => {
                const combined = [...thirdPartyItems];
                for (const existing of prev) {
                  if (combined.length >= 5) break;
                  if (!combined.some((c) => c.packagesCsv === existing.packagesCsv)) {
                    combined.push({
                      ...existing,
                      id: `continue-${combined.length}`,
                    });
                  }
                }
                return combined.slice(0, 5).map((item, idx) => ({
                  ...item,
                  id: `continue-${idx}`,
                }));
              });
              if (showNotification) {
                triggerToast(`✓ ${thirdPartyItems.length} recomendações de apps de terceiros sincronizadas!`);
              }
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      // If no EPG rows yet but 3rd-party apps are installed on the TV, populate from installed 3rd-party apps
      const thirdPartyInstalled = detectedInstalled.filter((a) => a.isThirdParty !== false);
      if (thirdPartyInstalled.length > 0) {
        setWatchNextList((prev) => {
          const fromInstalled: WatchNextItem[] = thirdPartyInstalled.slice(0, 5).map((app, idx) => {
            const brand = resolveThirdPartyBrand(app.packageName || app.label);
            return {
              id: `continue-${idx}`,
              title: `${app.label} • Continuar`,
              subtitle: 'App de Terceiro Instalado • Retomar',
              provider: app.label,
              packagesCsv: app.packageName,
              deepLink: '',
              appIconSrc: brand.iconSrc,
              accentGradient: brand.accentGradient,
              progress: 50,
              category: 'filmes',
              isThirdParty: true,
              lastUpdated: 'App de Terceiro Instalado',
            };
          });
          const merged = [...fromInstalled, ...prev].slice(0, 5).map((item, i) => ({
            ...item,
            id: `continue-${i}`,
          }));
          return merged;
        });
      }

      if (showNotification) {
        triggerToast('✓ Continuar Assistindo sincronizado com seus Apps de Terceiros!');
      }
    },
    [triggerToast]
  );

  useEffect(() => {
    syncThirdPartyWatchNextFromBridge(false);
  }, [syncThirdPartyWatchNextFromBridge]);

  // Record / Promote a 3rd-Party App in "Continuar Assistindo" whenever the user launches it
  const recordThirdPartyAppActivity = useCallback(
    (appName: string, packagesCsv: string, deepLink = '', iconSrc?: string) => {
      if (!packagesCsv) return;
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const brand = resolveThirdPartyBrand(packagesCsv || appName);

      setWatchNextList((prev) => {
        const primaryPkg = packagesCsv.split(',')[0].trim();
        const existingIdx = prev.findIndex(
          (item) =>
            item.packagesCsv.includes(primaryPkg) ||
            item.provider.toLowerCase() === appName.toLowerCase()
        );

        let updatedList: WatchNextItem[];
        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const promoted: WatchNextItem = {
            ...existing,
            title: existing.title.includes('•') ? `${appName} • Sessão Ativa` : existing.title,
            subtitle: `App de Terceiro • Aberto às ${nowStr}`,
            provider: appName,
            packagesCsv,
            deepLink: deepLink || existing.deepLink,
            appIconSrc: iconSrc || existing.appIconSrc || brand.iconSrc,
            accentGradient: existing.accentGradient || brand.accentGradient,
            progress: Math.min(95, existing.progress + 12),
            isThirdParty: true,
            lastUpdated: `Aberto às ${nowStr}`,
          };
          const remaining = prev.filter((_, i) => i !== existingIdx);
          updatedList = [promoted, ...remaining];
        } else {
          const newEntry: WatchNextItem = {
            id: 'continue-0',
            title: `${appName} • Continuar Assistindo`,
            subtitle: `App de Terceiro • Aberto às ${nowStr}`,
            provider: appName,
            packagesCsv,
            deepLink,
            appIconSrc: iconSrc || brand.iconSrc,
            accentGradient: brand.accentGradient,
            progress: 25,
            category: 'filmes',
            isThirdParty: true,
            lastUpdated: `Aberto às ${nowStr}`,
          };
          updatedList = [newEntry, ...prev];
        }

        return updatedList.slice(0, 5).map((item, idx) => ({
          ...item,
          id: `continue-${idx}`,
        }));
      });
    },
    []
  );

  // Update Clock
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
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Real Weather from Open-Meteo for current selected city
  useEffect(() => {
    const city = cities[cityIndex];
    setLiveTemp(city.temp);
    setLiveCondition(city.status);

    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current_weather && typeof data.current_weather.temperature === 'number') {
          const rounded = Math.round(data.current_weather.temperature);
          setLiveTemp(`${rounded}°C`);
          const code = data.current_weather.weathercode;
          if (code === 0) setLiveCondition('Céu Limpo');
          else if (code <= 3) setLiveCondition('Poucas Nuvens');
          else if (code <= 67) setLiveCondition('Chuva Leve');
          else setLiveCondition('Céu Limpo');
        }
      })
      .catch(() => {
        // Offline or restricted: keep default 26°C Céu Limpo
      });
    return () => controller.abort();
  }, [cityIndex]);

  // Hero Spotlight Slides
  const heroSlides = [
    {
      id: 'hero-0',
      provider: 'AMAZON PRIME VIDEO',
      appName: 'Prime Video',
      titleLine1: 'O Último',
      titleLine2: 'Planeta',
      description: 'Uma jornada épica além do nosso mundo.\nDescubra o que existe além.',
      packagesCsv: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient',
      deepLink: 'https://app.primevideo.com',
      iconSrc: './assets/launcher/icon_prime.png',
      subtitle: 'Prime Video • 4K HDR',
    },
    {
      id: 'hero-1',
      provider: 'NETFLIX 4K',
      appName: 'Netflix',
      titleLine1: 'Destaques',
      titleLine2: 'Netflix',
      description: 'Séries e filmes em Dolby Vision prontos para assistir\ndiretamente no aplicativo Netflix da sua TV.',
      packagesCsv: 'com.netflix.ninja,com.netflix.mediaclient',
      deepLink: 'nflx://www.netflix.com',
      iconSrc: './assets/launcher/icon_netflix.png',
      subtitle: 'Netflix • Ultra HD',
    },
    {
      id: 'hero-2',
      provider: 'DISNEY+ ORIGINAL',
      appName: 'Disney+',
      titleLine1: 'Universo',
      titleLine2: 'Disney+',
      description: 'Produções originais, cinema e esportes ao vivo\nintegrados com o seu app Disney+.',
      packagesCsv: 'com.disney.disneyplus',
      deepLink: 'https://www.disneyplus.com',
      iconSrc: './assets/launcher/icon_disney.png',
      subtitle: 'Disney+ • IMAX Enhanced',
    },
    {
      id: 'hero-3',
      provider: 'MAX STREAMING',
      appName: 'Max',
      titleLine1: 'Catálogo',
      titleLine2: 'Max 4K',
      description: 'Grandes estreias do cinema e séries exclusivas\ndisponíveis no app Max instalado.',
      packagesCsv: 'com.wbd.stream,com.hbo.hbonow',
      deepLink: 'https://play.max.com',
      iconSrc: './assets/launcher/icon_max.png',
      subtitle: 'Max • Dolby Atmos',
    },
    {
      id: 'hero-4',
      provider: 'GLOBOPLAY AO VIVO',
      appName: 'Globoplay',
      titleLine1: 'Canais &',
      titleLine2: 'Ao Vivo',
      description: 'Transmissões ao vivo, esportes e novelas\ndiretamente no aplicativo Globoplay.',
      packagesCsv: 'com.globo.globotv',
      deepLink: 'https://globoplay.globo.com',
      iconSrc: './assets/launcher/icon_globoplay.png',
      subtitle: 'Globoplay • Ao Vivo',
    },
  ];

  const appsRow = THIRD_PARTY_STREAMING_APPS;

  // Left Dock items matching the attachment 1:1
  const dockItems = [
    { id: 'dock-inicio', key: 'inicio', label: 'Início', icon: Home },
    { id: 'dock-apps', key: 'apps', label: 'Apps', icon: Grid },
    { id: 'dock-filmes', key: 'filmes', label: 'Filmes e Séries', icon: Clapperboard },
    { id: 'dock-tv', key: 'tv', label: 'TV ao Vivo', icon: Tv },
    { id: 'dock-jogos', key: 'jogos', label: 'Jogos', icon: Gamepad2 },
    { id: 'dock-musica', key: 'musica', label: 'Música', icon: Music },
    { id: 'dock-config', key: 'config', label: 'Configurações', icon: Settings },
  ];

  // Full App Drawer catalog (merges real installed 3rd-party apps on Century TV Stick + default 3rd-party TV apps)
  const allDrawerApps = [
    { name: 'Netflix', pkg: 'com.netflix.ninja,com.netflix.mediaclient', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_netflix.png' },
    { name: 'Prime Video', pkg: 'com.amazon.amazonvideo.livingroom,com.amazon.avod.thirdpartyclient', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_prime.png' },
    { name: 'Disney+', pkg: 'com.disney.disneyplus', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_disney.png' },
    { name: 'YouTube TV', pkg: 'com.google.android.youtube.tv,com.google.android.youtube', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_youtube.png' },
    { name: 'Max', pkg: 'com.wbd.stream,com.hbo.hbonow', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_max.png' },
    { name: 'Globoplay', pkg: 'com.globo.globotv', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_globoplay.png' },
    { name: 'Apple TV', pkg: 'com.apple.atve.androidtv.appletv', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_appletv.png' },
    { name: 'Spotify', pkg: 'com.spotify.tv.android,com.spotify.music', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_spotify.png' },
    ...installedApps.map((a) => ({
      name: a.label,
      pkg: a.packageName,
      tag: a.isThirdParty !== false ? 'App de Terceiro Instalado' : 'App do Sistema',
      iconSrc: resolveThirdPartyBrand(a.packageName).iconSrc,
    })),
    { name: 'SmartTube Next', pkg: 'com.liskovsoft.smarttubetv.beta', tag: 'App de Terceiro', iconSrc: './assets/launcher/icon_youtube.png' },
    { name: 'Stremio 4K', pkg: 'com.stremio.one', tag: 'App de Terceiro', iconSrc: undefined },
    { name: 'Pluto TV Ao Vivo', pkg: 'tv.pluto.android', tag: 'App de Terceiro', iconSrc: undefined },
    { name: 'VLC Media Player', pkg: 'org.videolan.vlc', tag: 'App de Terceiro', iconSrc: undefined },
  ];

  // Launch 3rd-Party App or Deep Link via AndroidTVBridge & update "Continuar Assistindo"
  const launchAppOrContent = useCallback(
    (name: string, packagesCsv: string, deepLink = '', mediaItem?: WatchNextItem, iconSrc?: string) => {
      const bridge = (window as unknown as {
        AndroidTV?: {
          launchDeepLink?: (pkgs: string, uri: string) => boolean;
          launchApp?: (pkgs: string) => boolean;
        };
      }).AndroidTV;

      // Always record 3rd-party app activity into "Continuar Assistindo"
      recordThirdPartyAppActivity(
        mediaItem ? mediaItem.provider : name,
        packagesCsv,
        deepLink,
        iconSrc || mediaItem?.appIconSrc
      );

      if (bridge) {
        const launched = bridge.launchDeepLink
          ? bridge.launchDeepLink(packagesCsv, deepLink)
          : bridge.launchApp?.(packagesCsv);

        if (launched) {
          triggerToast(`Abrindo ${name} • Adicionado ao Continuar Assistindo`);
          return;
        }
      }

      // If running in preview or app not yet installed on TV, open the interactive 3rd-party session modal
      if (mediaItem) {
        setActiveMediaModal(mediaItem);
      } else {
        triggerToast(`Sessão de ${name} registrada em Continuar Assistindo (${packagesCsv.split(',')[0]})`);
      }
    },
    [recordThirdPartyAppActivity, triggerToast]
  );

  // Toggle current Hero item in "Minha Lista" and register its 3rd-party app in "Continuar Assistindo"
  const toggleHeroMyList = useCallback(() => {
    const slide = heroSlides[carouselIndex];
    const fullTitle = `${slide.titleLine1} ${slide.titleLine2}`;
    const exists = myListIds.includes(slide.id);

    if (exists) {
      const updated = myListIds.filter((id) => id !== slide.id);
      setMyListIds(updated);
      try {
        localStorage.setItem('lg26_mylist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      triggerToast(`Removido da Minha Lista: ${fullTitle}`);
    } else {
      const updated = [...myListIds, slide.id];
      setMyListIds(updated);
      try {
        localStorage.setItem('lg26_mylist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      recordThirdPartyAppActivity(slide.appName, slide.packagesCsv, slide.deepLink, slide.iconSrc);
      triggerToast(`✓ Vinculado ao app ${slide.appName} em Continuar Assistindo`);
    }
  }, [carouselIndex, heroSlides, myListIds, recordThirdPartyAppActivity, triggerToast]);

  // Remove a specific 3rd-party card from Continue Watching
  const removeContinueWatchingCard = useCallback(
    (cardId: string) => {
      setWatchNextList((prev) => {
        const filtered = prev.filter((item) => item.id !== cardId);
        if (filtered.length === 0) {
          return buildInitialThirdPartyContinueWatching();
        }
        return filtered.map((item, idx) => ({ ...item, id: `continue-${idx}` }));
      });
      setActiveMediaModal(null);
      triggerToast('Sessão de app de terceiro removida de Continuar Assistindo');
    },
    [triggerToast]
  );

  // Switch HDMI Port
  const handleSelectHdmi = useCallback(
    (port: number) => {
      setActiveHdmi(port);
      const bridge = (window as unknown as {
        AndroidTV?: { switchHdmiInput?: (p: number) => boolean };
      }).AndroidTV;
      if (bridge?.switchHdmiInput) {
        bridge.switchHdmiInput(port);
      }
      triggerToast(`Entrada HDMI ${port} selecionada`);
    },
    [triggerToast]
  );

  // Handle Sidebar Category Activation
  const activateDockCategory = useCallback(
    (dockKey: string) => {
      setActiveDock(dockKey);
      if (dockKey === 'inicio') {
        setCarouselIndex(0);
        triggerToast('Início • Todos os apps e sessões de terceiros');
      } else if (dockKey === 'apps') {
        setDrawerFocusIdx(0);
        setIsAppsDrawerOpen(true);
      } else if (dockKey === 'filmes') {
        setCarouselIndex(1);
        triggerToast('Filmes e Séries • Apps de streaming de terceiros');
      } else if (dockKey === 'tv') {
        setCarouselIndex(4);
        triggerToast('TV ao Vivo • Globoplay, YouTube Ao Vivo e Canais');
      } else if (dockKey === 'jogos') {
        triggerToast('Jogos • Gamepad e Jogos Android TV prontos');
      } else if (dockKey === 'musica') {
        triggerToast('Música • Spotify TV e Áudio Digital');
      } else if (dockKey === 'config') {
        setSettingsFocusIdx(0);
        setIsSettingsModalOpen(true);
      }
    },
    [triggerToast]
  );

  // Complete D-Pad Navigation & OK Action Engine
  const handleRemoteKey = useCallback(
    (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Enter' | 'Escape') => {
      playSound(key === 'Enter' ? 660 : 520);

      // 1. Media Modal open
      if (activeMediaModal) {
        if (key === 'Escape') {
          setActiveMediaModal(null);
        } else if (key === 'Enter') {
          const item = activeMediaModal;
          setActiveMediaModal(null);
          const bridge = (window as unknown as {
            AndroidTV?: {
              launchDeepLink?: (pkgs: string, uri: string) => boolean;
              openPlayStore?: (pkg: string) => boolean;
            };
          }).AndroidTV;
          const firstPkg = item.packagesCsv.split(',')[0];
          if (bridge?.launchDeepLink && bridge.launchDeepLink(item.packagesCsv, item.deepLink)) {
            triggerToast(`Retomando em ${item.provider}...`);
          } else if (bridge?.openPlayStore) {
            bridge.openPlayStore(firstPkg);
          } else {
            triggerToast(`Retomando sessão no app de terceiro: ${item.provider}`);
          }
        }
        return;
      }

      // 2. Settings Modal open
      if (isSettingsModalOpen) {
        if (key === 'Escape') {
          setIsSettingsModalOpen(false);
          return;
        }
        if (key === 'ArrowDown') {
          setSettingsFocusIdx((p) => Math.min(4, p + 1));
          return;
        }
        if (key === 'ArrowUp') {
          setSettingsFocusIdx((p) => Math.max(0, p - 1));
          return;
        }
        if (key === 'Enter') {
          const bridge = (window as unknown as {
            AndroidTV?: { openSettings?: () => void; openWifiSettings?: () => void };
          }).AndroidTV;
          if (settingsFocusIdx === 0) {
            if (bridge?.openSettings) bridge.openSettings();
            else triggerToast('Abrindo Configurações do Android 14 TV...');
          } else if (settingsFocusIdx === 1) {
            if (bridge?.openWifiSettings) bridge.openWifiSettings();
            else triggerToast('Abrindo Configurações de Rede Wi-Fi (192.168.0.117)...');
          } else if (settingsFocusIdx === 2) {
            syncThirdPartyWatchNextFromBridge(true);
          } else if (settingsFocusIdx === 3) {
            setIsSettingsModalOpen(false);
            onOpenSystemPanel?.('termux');
          } else if (settingsFocusIdx === 4) {
            setIsSettingsModalOpen(false);
          }
          return;
        }
        return;
      }

      // 3. Apps Drawer Modal open
      if (isAppsDrawerOpen) {
        if (key === 'Escape') {
          setIsAppsDrawerOpen(false);
          return;
        }
        if (key === 'ArrowRight') {
          setDrawerFocusIdx((p) => Math.min(allDrawerApps.length - 1, p + 1));
          return;
        }
        if (key === 'ArrowLeft') {
          setDrawerFocusIdx((p) => Math.max(0, p - 1));
          return;
        }
        if (key === 'ArrowDown') {
          setDrawerFocusIdx((p) => Math.min(allDrawerApps.length - 1, p + 4));
          return;
        }
        if (key === 'ArrowUp') {
          setDrawerFocusIdx((p) => Math.max(0, p - 4));
          return;
        }
        if (key === 'Enter') {
          const target = allDrawerApps[drawerFocusIdx];
          if (target) {
            setIsAppsDrawerOpen(false);
            launchAppOrContent(target.name, target.pkg, '', undefined, target.iconSrc);
          }
          return;
        }
        return;
      }

      // 4. Escape on Home Screen returns to Netflix / Início
      if (key === 'Escape') {
        setActiveDock('inicio');
        setFocusedId('app-0');
        return;
      }

      // 5. Enter / OK on Home Screen
      if (key === 'Enter') {
        if (focusedId.startsWith('dock-')) {
          const dockKey = focusedId.replace('dock-', '');
          activateDockCategory(dockKey);
          return;
        }
        if (focusedId === 'hero-watch') {
          const slide = heroSlides[carouselIndex];
          launchAppOrContent(slide.appName, slide.packagesCsv, slide.deepLink, undefined, slide.iconSrc);
          return;
        }
        if (focusedId === 'hero-mylist') {
          toggleHeroMyList();
          return;
        }
        if (focusedId === 'widget-weather') {
          const nextIdx = (cityIndex + 1) % cities.length;
          setCityIndex(nextIdx);
          triggerToast(`Clima atualizado: ${cities[nextIdx].name}`);
          return;
        }
        if (focusedId === 'hdmi-1' || focusedId === 'hdmi-2' || focusedId === 'hdmi-3') {
          const port = parseInt(focusedId.replace('hdmi-', ''), 10);
          handleSelectHdmi(port);
          return;
        }
        if (focusedId.startsWith('app-')) {
          const idx = parseInt(focusedId.replace('app-', ''), 10);
          const app = appsRow[idx];
          if (app) {
            if (app.isMoreApps) {
              setDrawerFocusIdx(0);
              setIsAppsDrawerOpen(true);
            } else {
              launchAppOrContent(app.name, app.packagesCsv, app.deepLink, undefined, app.iconSrc);
            }
          }
          return;
        }
        if (focusedId.startsWith('continue-')) {
          const idx = parseInt(focusedId.replace('continue-', ''), 10);
          const item = watchNextList[idx];
          if (item) {
            launchAppOrContent(item.provider, item.packagesCsv, item.deepLink, item, item.appIconSrc);
          }
          return;
        }
      }

      // 6. Directional D-Pad Navigation
      setFocusedId((current) => {
        // --- LEFT SIDEBAR DOCK ---
        if (current.startsWith('dock-')) {
          const idx = dockItems.findIndex((d) => d.id === current);
          if (key === 'ArrowDown') {
            const next = Math.min(dockItems.length - 1, idx + 1);
            return dockItems[next].id;
          }
          if (key === 'ArrowUp') {
            const prev = Math.max(0, idx - 1);
            return dockItems[prev].id;
          }
          if (key === 'ArrowRight') {
            if (idx <= 1) return 'hero-watch';
            if (idx <= 4) return 'app-0';
            return 'continue-0';
          }
          return current;
        }

        // --- HERO BUTTONS ('hero-watch', 'hero-mylist') ---
        if (current === 'hero-watch') {
          if (key === 'ArrowLeft') return 'dock-inicio';
          if (key === 'ArrowRight') return 'hero-mylist';
          if (key === 'ArrowDown') return 'app-0';
          if (key === 'ArrowUp') {
            setCarouselIndex((p) => (p - 1 + heroSlides.length) % heroSlides.length);
            return current;
          }
          return current;
        }
        if (current === 'hero-mylist') {
          if (key === 'ArrowLeft') return 'hero-watch';
          if (key === 'ArrowRight') return 'hdmi-1';
          if (key === 'ArrowDown') return 'app-2';
          if (key === 'ArrowUp') {
            setCarouselIndex((p) => (p + 1) % heroSlides.length);
            return current;
          }
          return current;
        }

        // --- WEATHER WIDGET ---
        if (current === 'widget-weather') {
          if (key === 'ArrowLeft') return 'hero-mylist';
          if (key === 'ArrowDown') return 'hdmi-1';
          return current;
        }

        // --- HDMI INPUTS ('hdmi-1', 'hdmi-2', 'hdmi-3') ---
        if (current === 'hdmi-1') {
          if (key === 'ArrowUp') return 'widget-weather';
          if (key === 'ArrowDown') return 'hdmi-2';
          if (key === 'ArrowLeft') return 'hero-mylist';
          return current;
        }
        if (current === 'hdmi-2') {
          if (key === 'ArrowUp') return 'hdmi-1';
          if (key === 'ArrowDown') return 'hdmi-3';
          if (key === 'ArrowLeft') return 'hero-mylist';
          return current;
        }
        if (current === 'hdmi-3') {
          if (key === 'ArrowUp') return 'hdmi-2';
          if (key === 'ArrowDown') return 'app-7';
          if (key === 'ArrowLeft') return 'hero-mylist';
          return current;
        }

        // --- SEUS APLICATIVOS ROW ('app-0' .. 'app-8') ---
        if (current.startsWith('app-')) {
          const idx = parseInt(current.replace('app-', ''), 10);
          if (key === 'ArrowLeft') {
            return idx === 0 ? 'dock-apps' : `app-${idx - 1}`;
          }
          if (key === 'ArrowRight') {
            return idx < appsRow.length - 1 ? `app-${idx + 1}` : current;
          }
          if (key === 'ArrowUp') {
            if (idx <= 2) return 'hero-watch';
            if (idx <= 6) return 'hero-mylist';
            return 'hdmi-3';
          }
          if (key === 'ArrowDown') {
            const targetContinue = Math.min(
              watchNextList.length - 1,
              Math.floor((idx / appsRow.length) * watchNextList.length)
            );
            return `continue-${targetContinue}`;
          }
          return current;
        }

        // --- CONTINUAR ASSISTINDO ROW ('continue-0' .. 'continue-4') ---
        if (current.startsWith('continue-')) {
          const idx = parseInt(current.replace('continue-', ''), 10);
          if (key === 'ArrowLeft') {
            return idx === 0 ? 'dock-filmes' : `continue-${idx - 1}`;
          }
          if (key === 'ArrowRight') {
            return idx < watchNextList.length - 1 ? `continue-${idx + 1}` : current;
          }
          if (key === 'ArrowUp') {
            const targetApp = Math.min(appsRow.length - 1, idx * 2);
            return `app-${targetApp}`;
          }
          return current;
        }

        return 'app-0';
      });
    },
    [
      activateDockCategory,
      activeMediaModal,
      allDrawerApps,
      appsRow,
      carouselIndex,
      cities,
      cityIndex,
      dockItems,
      drawerFocusIdx,
      focusedId,
      handleSelectHdmi,
      heroSlides,
      isAppsDrawerOpen,
      isSettingsModalOpen,
      launchAppOrContent,
      onOpenSystemPanel,
      playSound,
      settingsFocusIdx,
      syncThirdPartyWatchNextFromBridge,
      toggleHeroMyList,
      triggerToast,
      watchNextList,
    ]
  );

  // Physical Keyboard / TV Remote Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 4) {
        e.preventDefault();
        handleRemoteKey('Escape');
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 23) {
        e.preventDefault();
        handleRemoteKey('Enter');
        return;
      }
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        handleRemoteKey(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRemoteKey]);

  const currentHero = heroSlides[carouselIndex];
  const isCurrentInMyList = myListIds.includes(currentHero.id);

  return (
    <LayoutGroup>
      <div className="relative w-screen h-screen overflow-hidden bg-[#050814] text-white font-sans select-none">
        {/* ========================================================================= */}
        {/* PHOTOREALISTIC COSMIC PLANET, SUNSET MOUNTAINS & LAKE WALLPAPER           */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="./assets/launcher/bg_cosmic_clean.jpg"
            alt=""
            className="w-full h-full object-cover object-center scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040711]/90 via-[#060b19]/25 to-[#060b19]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050812]/90 via-transparent to-[#050814]/35" />
        </div>

        {/* ========================================================================= */}
        {/* MAIN 16:9 FULLSCREEN TV GRID: LEFT GLASS SIDEBAR + RIGHT CONTENT          */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full h-full flex items-stretch p-3 sm:p-5 lg:p-7 gap-4 sm:gap-6">
          {/* ======================================================================= */}
          {/* LEFT UNIFIED TALL FROSTED GLASS CAPSULE (Clock + Divider + 7 Menu Items)*/}
          {/* ======================================================================= */}
          <aside className="w-[185px] sm:w-[215px] lg:w-[235px] shrink-0 h-full">
            <div className="w-full h-full rounded-[28px] backdrop-blur-2xl bg-gradient-to-b from-[#101935]/70 via-[#0a1022]/75 to-[#080d1c]/80 border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.45)] flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden">
              {/* Specular corner rim glow */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Top Clock & Date inside the glass capsule */}
                <div className="px-2 pt-1 pb-3">
                  <div className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-white tracking-tight leading-none drop-shadow">
                    {timeStr}
                  </div>
                  <div className="text-xs sm:text-[13px] text-slate-200/90 font-normal mt-1.5 tracking-wide">
                    {dateStr}
                  </div>
                </div>

                {/* Subtle Horizontal Glass Divider Line */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent mx-1 my-2" />

                {/* 7 Dock Navigation Items with Framer Motion Glass Focus */}
                <nav className="space-y-1.5 sm:space-y-2 mt-3">
                  {dockItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeDock === item.key;
                    const isFocused = focusedId === item.id;
                    const highlight = isActive || isFocused;

                    return (
                      <motion.button
                        key={item.id}
                        layout
                        transition={dpadSpring}
                        animate={{
                          scale: isFocused ? 1.035 : 1,
                          x: isFocused ? 3 : 0,
                          backdropFilter: isFocused ? 'blur(24px) saturate(180%)' : 'blur(8px) saturate(110%)',
                        }}
                        onClick={() => {
                          setFocusedId(item.id);
                          activateDockCategory(item.key);
                        }}
                        onMouseEnter={() => setFocusedId(item.id)}
                        className={`w-full py-2.5 sm:py-3 px-3.5 rounded-[18px] flex items-center gap-3.5 text-left cursor-pointer relative overflow-hidden ${
                          highlight
                            ? 'text-white font-semibold'
                            : 'text-slate-200/90 hover:text-white font-normal'
                        }`}
                      >
                        {highlight && (
                          <motion.div
                            layoutId="dock-active-glass-pill"
                            transition={dpadSpring}
                            className={`absolute inset-0 rounded-[18px] bg-gradient-to-r from-[#1d4ed8]/70 via-[#1e40af]/50 to-[#0f172a]/40 border ${
                              isFocused
                                ? 'border-[#60a5fa] shadow-[0_0_26px_rgba(59,130,246,0.85),inset_0_0_14px_rgba(96,165,250,0.45)]'
                                : 'border-[#60a5fa]/65 shadow-[0_0_18px_rgba(59,130,246,0.5)]'
                            }`}
                          />
                        )}
                        <Icon
                          className={`relative z-10 w-5 h-5 shrink-0 ${
                            highlight
                              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                              : 'text-slate-200/85'
                          }`}
                        />
                        <span className="relative z-10 text-xs sm:text-[15px] tracking-tight truncate">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Subtle Virtual Remote toggle at bottom of sidebar for easy testing */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
                <button
                  onClick={() => setShowRemoteOverlay((prev) => !prev)}
                  className="text-[11px] text-slate-300/80 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition"
                  title="Abrir Controle Remoto Virtual na Tela"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Controle TV</span>
                </button>
                <button
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="text-slate-300/80 hover:text-white cursor-pointer"
                  title="Som do controle"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* RIGHT MAIN CONTENT AREA (Top Row + Seus Aplicativos + Continuar)        */}
          {/* ======================================================================= */}
          <main className="flex-1 flex flex-col justify-between h-full min-w-0 gap-3 sm:gap-4">
            {/* ===================================================================== */}
            {/* TOP ROW: HERO SPOTLIGHT BANNER (Left) + WEATHER & ENTRADAS (Right)    */}
            {/* ===================================================================== */}
            <div className="flex-[1.35] flex gap-4 sm:gap-5 min-h-0">
              {/* 1. HERO SPOTLIGHT BANNER ("O Último Planeta") */}
              <motion.div
                layout
                transition={dpadSpring}
                animate={{
                  borderColor:
                    focusedId === 'hero-watch' || focusedId === 'hero-mylist'
                      ? 'rgba(96, 165, 250, 0.75)'
                      : 'rgba(255, 255, 255, 0.3)',
                }}
                className="flex-1 rounded-[26px] border shadow-[0_18px_45px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.5)] relative overflow-hidden flex flex-col justify-between p-5 sm:p-7 lg:p-8"
              >
                {/* Top rim specular light flare */}
                <div className="absolute top-0 left-12 right-12 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200/90 to-white/95 pointer-events-none" />

                {/* Left dark gradient for crisp white typography while right side shows the cosmic planet & sunset mountains */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#060a18]/85 via-[#070d1e]/45 to-transparent pointer-events-none" />

                {/* Animated Hero Text Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHero.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="relative z-10 space-y-1.5 sm:space-y-2 max-w-md"
                  >
                    <div className="text-[10px] sm:text-xs font-medium tracking-[0.12em] text-slate-200/95 uppercase">
                      {currentHero.provider}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white tracking-tight leading-[1.06] drop-shadow-md">
                      <span className="block">{currentHero.titleLine1}</span>
                      <span className="block">{currentHero.titleLine2}</span>
                    </h1>
                    <p className="text-xs sm:text-[13px] text-slate-200/90 leading-relaxed whitespace-pre-line pt-0.5">
                      {currentHero.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Action Buttons ("▶ Assistir agora" & "+ Minha Lista") + 5 Pagination Dots */}
                <div className="relative z-10 flex items-end justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {/* Button 1: Assistir agora */}
                    <motion.button
                      transition={dpadSpring}
                      animate={{
                        scale: focusedId === 'hero-watch' ? 1.06 : 1,
                        backdropFilter:
                          focusedId === 'hero-watch'
                            ? 'blur(26px) saturate(190%)'
                            : 'blur(14px) saturate(120%)',
                      }}
                      onClick={() => {
                        setFocusedId('hero-watch');
                        launchAppOrContent(
                          currentHero.appName,
                          currentHero.packagesCsv,
                          currentHero.deepLink,
                          undefined,
                          currentHero.iconSrc
                        );
                      }}
                      onMouseEnter={() => setFocusedId('hero-watch')}
                      className={`px-5 sm:px-6 py-2.5 rounded-full flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer relative overflow-hidden ${
                        focusedId === 'hero-watch'
                          ? 'bg-gradient-to-r from-[#1d4ed8]/90 to-[#1e40af]/80 text-white border-2 border-[#60a5fa] shadow-[0_0_28px_rgba(59,130,246,0.95),inset_0_0_12px_rgba(147,197,253,0.5)]'
                          : 'bg-[#101c38]/75 hover:bg-[#16274c]/80 text-white border border-[#60a5fa]/70 shadow-[0_0_18px_rgba(59,130,246,0.5)]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
                      <span>Assistir agora</span>
                    </motion.button>

                    {/* Button 2: + Minha Lista */}
                    <motion.button
                      transition={dpadSpring}
                      animate={{
                        scale: focusedId === 'hero-mylist' ? 1.06 : 1,
                        backdropFilter:
                          focusedId === 'hero-mylist'
                            ? 'blur(26px) saturate(190%)'
                            : 'blur(14px) saturate(120%)',
                      }}
                      onClick={() => {
                        setFocusedId('hero-mylist');
                        toggleHeroMyList();
                      }}
                      onMouseEnter={() => setFocusedId('hero-mylist')}
                      className={`px-5 sm:px-6 py-2.5 rounded-full flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer relative overflow-hidden ${
                        focusedId === 'hero-mylist'
                          ? 'bg-white/25 text-white border-2 border-[#60a5fa] shadow-[0_0_25px_rgba(59,130,246,0.85)]'
                          : 'bg-[#0c1428]/65 hover:bg-white/15 text-slate-100 border border-white/25'
                      }`}
                    >
                      {isCurrentInMyList ? (
                        <>
                          <Check className="w-4 h-4 text-cyan-300" />
                          <span>Minha Lista</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-white" />
                          <span>Minha Lista</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* 5 Carousel Dots at Bottom Center */}
                  <div className="flex items-center gap-2 pb-1">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setCarouselIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          idx === carouselIndex
                            ? 'bg-[#60a5fa] shadow-[0_0_10px_#60a5fa] scale-125'
                            : 'bg-white/45 hover:bg-white/75'
                        }`}
                        title={`${slide.titleLine1} ${slide.titleLine2}`}
                      />
                    ))}
                  </div>

                  <div className="w-24 hidden lg:block" />
                </div>
              </motion.div>

              {/* 2. RIGHT WIDGETS COLUMN: WEATHER (26°C) + ENTRADAS (HDMI 1, 2, 3) */}
              <div className="w-[220px] sm:w-[250px] lg:w-[270px] shrink-0 flex flex-col gap-3.5">
                {/* Weather Card */}
                <motion.div
                  transition={dpadSpring}
                  animate={{
                    scale: focusedId === 'widget-weather' ? 1.03 : 1,
                    backdropFilter:
                      focusedId === 'widget-weather'
                        ? 'blur(28px) saturate(185%)'
                        : 'blur(18px) saturate(120%)',
                  }}
                  onClick={() => {
                    setFocusedId('widget-weather');
                    const nextIdx = (cityIndex + 1) % cities.length;
                    setCityIndex(nextIdx);
                    triggerToast(`Clima: ${cities[nextIdx].name}`);
                  }}
                  onMouseEnter={() => setFocusedId('widget-weather')}
                  className={`rounded-[22px] bg-gradient-to-br from-[#1b243e]/75 to-[#0f1629]/80 p-3.5 sm:p-4 flex items-center justify-between cursor-pointer relative overflow-hidden ${
                    focusedId === 'widget-weather'
                      ? 'border-2 border-[#60a5fa] shadow-[0_0_28px_rgba(59,130,246,0.85)]'
                      : 'border border-white/25 shadow-[0_12px_30px_rgba(0,0,0,0.55)]'
                  }`}
                >
                  <img
                    src="./assets/launcher/weather_sun_cloud.png"
                    alt="Clima"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md shrink-0"
                  />
                  <div className="text-left pl-2 flex-1">
                    <div className="text-[11px] sm:text-xs text-slate-200/90 font-normal">
                      {liveCondition}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
                      {liveTemp}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-300/90 truncate">
                      {cities[cityIndex].name}
                    </div>
                  </div>
                </motion.div>

                {/* Entradas Card (HDMI 1, HDMI 2, HDMI 3) */}
                <div className="flex-1 rounded-[22px] backdrop-blur-2xl bg-gradient-to-br from-[#171f36]/75 to-[#0b1020]/85 border border-white/25 shadow-[0_12px_30px_rgba(0,0,0,0.6)] p-3 flex flex-col justify-between">
                  {/* Header: Entradas */}
                  <div className="flex items-center gap-2.5 px-2.5 py-1 text-xs text-slate-200/90 font-medium">
                    <HdmiPortIcon className="w-4 h-4 text-slate-300" />
                    <span>Entradas</span>
                  </div>

                  {/* HDMI 1, HDMI 2, HDMI 3 Rows */}
                  <div className="space-y-1">
                    {[1, 2, 3].map((port) => {
                      const rowId = `hdmi-${port}`;
                      const isFocused = focusedId === rowId;
                      const isSelected = activeHdmi === port;
                      const highlight = isFocused || isSelected;

                      return (
                        <motion.button
                          key={port}
                          layout
                          transition={dpadSpring}
                          animate={{
                            scale: isFocused ? 1.03 : 1,
                            x: isFocused ? 2 : 0,
                          }}
                          onClick={() => {
                            setFocusedId(rowId);
                            handleSelectHdmi(port);
                          }}
                          onMouseEnter={() => setFocusedId(rowId)}
                          className={`w-full px-3 py-1.5 rounded-xl flex items-center justify-between text-xs cursor-pointer relative overflow-hidden ${
                            highlight ? 'text-white font-semibold' : 'text-slate-300/90 hover:text-white'
                          }`}
                        >
                          {highlight && (
                            <motion.div
                              layoutId="hdmi-active-glass-pill"
                              transition={dpadSpring}
                              className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[#1e40af]/70 to-[#1d4ed8]/45 border ${
                                isFocused
                                  ? 'border-[#60a5fa] shadow-[0_0_20px_rgba(59,130,246,0.85),inset_0_0_10px_rgba(96,165,250,0.45)]'
                                  : 'border-[#60a5fa]/70 shadow-[0_0_14px_rgba(59,130,246,0.55)]'
                              }`}
                            />
                          )}
                          <div className="relative z-10 flex items-center gap-2.5">
                            <HdmiPortIcon className="w-4 h-4 text-slate-200" />
                            <span>HDMI {port}</span>
                          </div>
                          {highlight && <ChevronRight className="relative z-10 w-3.5 h-3.5 text-white" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* MIDDLE ROW: "Seus Aplicativos" (Framer Motion Glassmorphism Cards)    */}
            {/* ===================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow">
                  Seus Aplicativos
                </h2>
              </div>

              <div className="grid grid-cols-9 gap-2.5 sm:gap-3.5">
                {appsRow.map((app) => {
                  const isFocused = focusedId === app.id;
                  const isDimmed =
                    activeDock !== 'inicio' &&
                    activeDock !== 'apps' &&
                    activeDock !== 'config' &&
                    app.category !== 'all' &&
                    app.category !== activeDock;

                  return (
                    <motion.button
                      key={app.id}
                      layout
                      transition={{
                        ...dpadSpring,
                        boxShadow: isFocused
                          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.25 },
                        borderColor: isFocused
                          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.25 },
                      }}
                      animate={{
                        scale: isFocused ? 1.075 : 1,
                        y: isFocused ? -5 : 0,
                        opacity: isDimmed ? 0.42 : 1,
                        backdropFilter: isFocused
                          ? 'blur(30px) saturate(195%)'
                          : 'blur(16px) saturate(125%)',
                        backgroundColor: isFocused
                          ? 'rgba(23, 39, 84, 0.78)'
                          : 'rgba(13, 21, 40, 0.75)',
                        borderColor: isFocused
                          ? [
                              'rgba(96, 165, 250, 0.9)',
                              'rgba(165, 243, 252, 1)',
                              'rgba(96, 165, 250, 0.9)',
                            ]
                          : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: isFocused
                          ? [
                              '0 14px 32px rgba(37, 99, 235, 0.45), 0 0 22px rgba(56, 189, 248, 0.65), inset 0 1.5px 3px rgba(255, 255, 255, 0.6), inset 0 -12px 22px rgba(56, 189, 248, 0.35)',
                              '0 18px 44px rgba(37, 99, 235, 0.85), 0 0 42px rgba(56, 189, 248, 1), 0 0 16px rgba(165, 243, 252, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -18px 32px rgba(56, 189, 248, 0.65)',
                              '0 14px 32px rgba(37, 99, 235, 0.45), 0 0 22px rgba(56, 189, 248, 0.65), inset 0 1.5px 3px rgba(255, 255, 255, 0.6), inset 0 -12px 22px rgba(56, 189, 248, 0.35)',
                            ]
                          : '0 10px 25px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.22)',
                      }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setFocusedId(app.id);
                        if (app.isMoreApps) {
                          setDrawerFocusIdx(0);
                          setIsAppsDrawerOpen(true);
                        } else {
                          launchAppOrContent(app.name, app.packagesCsv, app.deepLink, undefined, app.iconSrc);
                        }
                      }}
                      onMouseEnter={() => setFocusedId(app.id)}
                      className={`group rounded-[22px] border p-2.5 sm:p-3 flex flex-col items-center justify-between aspect-[1/1.05] relative overflow-hidden cursor-pointer ${
                        isFocused ? 'z-20' : 'z-10'
                      }`}
                    >
                      {/* Shared D-Pad Liquid Glass Aura that glides between streaming cards */}
                      {isFocused && (
                        <motion.div
                          layoutId="dpad-streaming-card-aura"
                          transition={dpadSpring}
                          className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-cyan-400/20 via-blue-500/15 to-blue-600/35 pointer-events-none"
                        />
                      )}

                      {/* Pulsating D-Pad Focus Ring Halo inside the Glass Card */}
                      <AnimatePresence>
                        {isFocused && (
                          <motion.div
                            initial={{ opacity: 0.4, scale: 0.98 }}
                            animate={{
                              opacity: [0.45, 0.95, 0.45],
                              scale: [0.98, 1.02, 0.98],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-[22px] ring-2 ring-inset ring-cyan-300/80 shadow-[inset_0_0_20px_rgba(56,189,248,0.65)] pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      {/* Animated Diagonal Specular Glass Reflection responding to D-Pad focus */}
                      <motion.div
                        initial={false}
                        animate={{
                          x: isFocused ? '135%' : '-135%',
                          opacity: isFocused ? 0.75 : 0,
                        }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                      />

                      {/* Top glass specular highlight */}
                      <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                      {/* Bottom pulsating focus neon flare */}
                      <AnimatePresence>
                        {isFocused && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{
                              opacity: [0.65, 1, 0.65],
                              scale: [0.95, 1.3, 0.95],
                            }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-cyan-300/85 rounded-full blur-md pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      {/* Inner Brand Icon with Spring Lift on D-Pad Focus */}
                      <motion.div
                        transition={dpadSpring}
                        animate={{
                          scale: isFocused ? 1.12 : 1,
                          y: isFocused ? -2 : 0,
                        }}
                        className="relative z-10 flex-1 flex items-center justify-center w-full"
                      >
                        {app.isMoreApps ? (
                          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center shadow-inner">
                            <Grid className="w-6 h-6 sm:w-7 sm:h-7 text-slate-100" />
                          </div>
                        ) : (
                          <img
                            src={app.iconSrc}
                            alt={app.name}
                            className="w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]"
                          />
                        )}
                      </motion.div>

                      {/* App Label Inside the Glass Squircle Card */}
                      <span
                        className={`relative z-10 text-[10px] sm:text-xs tracking-tight truncate w-full text-center pt-1 transition-colors ${
                          isFocused ? 'text-white font-semibold drop-shadow' : 'text-slate-200/95 font-normal'
                        }`}
                      >
                        {app.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* BOTTOM ROW: "Continuar Assistindo" (100% Third-Party Apps Only)       */}
            {/* ===================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow">
                    Continuar Assistindo
                  </h2>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 border border-cyan-300/35 text-cyan-200 flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-cyan-300" />
                    <span>Apps de Terceiros</span>
                  </span>
                </div>

                <button
                  onClick={() => syncThirdPartyWatchNextFromBridge(true)}
                  className="text-[11px] text-slate-300/85 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition"
                  title="Sincronizar sessões do Watch Next dos apps de terceiros instalados"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Sincronizar Apps</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout">
                  {watchNextList.map((item, idx) => {
                    const cardId = `continue-${idx}`;
                    const isFocused = focusedId === cardId;

                    return (
                      <motion.button
                        key={`${item.packagesCsv}-${idx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{
                          opacity: 1,
                          scale: isFocused ? 1.05 : 1,
                          y: isFocused ? -5 : 0,
                          backdropFilter: isFocused
                            ? 'blur(28px) saturate(195%)'
                            : 'blur(16px) saturate(125%)',
                          borderColor: isFocused
                            ? [
                                'rgba(96, 165, 250, 0.9)',
                                'rgba(165, 243, 252, 1)',
                                'rgba(96, 165, 250, 0.9)',
                              ]
                            : 'rgba(255, 255, 255, 0.24)',
                          boxShadow: isFocused
                            ? [
                                '0 16px 34px rgba(37, 99, 235, 0.45), 0 0 24px rgba(56, 189, 248, 0.65), inset 0 1.5px 3px rgba(255, 255, 255, 0.55)',
                                '0 20px 46px rgba(37, 99, 235, 0.85), 0 0 44px rgba(56, 189, 248, 1), 0 0 18px rgba(165, 243, 252, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
                                '0 16px 34px rgba(37, 99, 235, 0.45), 0 0 24px rgba(56, 189, 248, 0.65), inset 0 1.5px 3px rgba(255, 255, 255, 0.55)',
                              ]
                            : '0 12px 28px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        transition={{
                          ...dpadSpring,
                          boxShadow: isFocused
                            ? { duration: 1.7, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.25 },
                          borderColor: isFocused
                            ? { duration: 1.7, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.25 },
                        }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setFocusedId(cardId);
                          launchAppOrContent(
                            item.provider,
                            item.packagesCsv,
                            item.deepLink,
                            item,
                            item.appIconSrc
                          );
                        }}
                        onMouseEnter={() => setFocusedId(cardId)}
                        className={`rounded-[20px] border overflow-hidden relative aspect-[16/10] flex flex-col justify-between p-3 sm:p-3.5 text-left cursor-pointer ${
                          isFocused ? 'z-20' : 'z-10'
                        }`}
                      >
                        {/* 3rd-Party App Poster URI (if provided by Android TV WatchNext) OR Liquid Glass 3rd-Party App Ambient Backdrop */}
                        {item.artSrc ? (
                          <img
                            src={item.artSrc}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${
                              item.accentGradient || 'from-[#1e3a8a]/85 via-[#0f172a]/85 to-[#090d1a]/95'
                            }`}
                          />
                        )}

                        {/* Shared D-Pad Glass Focus Overlay for Continue Watching Row */}
                        {isFocused && (
                          <motion.div
                            layoutId="dpad-continue-glass-aura"
                            transition={dpadSpring}
                            className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-cyan-400/10 to-white/10 pointer-events-none"
                          />
                        )}

                        {/* Pulsating D-Pad Glow Halo for Continue Watching Card */}
                        <AnimatePresence>
                          {isFocused && (
                            <motion.div
                              initial={{ opacity: 0.4, scale: 0.99 }}
                              animate={{
                                opacity: [0.4, 0.95, 0.4],
                                scale: [0.99, 1.015, 0.99],
                              }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 1.7,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute inset-0 rounded-[20px] ring-2 ring-inset ring-cyan-300/80 shadow-[inset_0_0_22px_rgba(56,189,248,0.65)] pointer-events-none"
                            />
                          )}
                        </AnimatePresence>

                        {/* Animated Diagonal Specular Sheen on D-Pad Focus */}
                        <motion.div
                          initial={false}
                          animate={{
                            x: isFocused ? '140%' : '-140%',
                            opacity: isFocused ? 0.65 : 0,
                          }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
                        />

                        {/* Frosted Glass Depth Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/95 via-[#080d1f]/45 to-transparent pointer-events-none" />

                        {/* Top Bar: 3rd-Party App Icon & Provider Pill */}
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md border border-white/20 rounded-xl px-2 py-1">
                            {item.appIconSrc ? (
                              <img
                                src={item.appIconSrc}
                                alt={item.provider}
                                className="w-5 h-5 rounded-md object-contain"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-md bg-blue-500/40 flex items-center justify-center text-[10px] font-bold text-white">
                                {item.provider.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-[10px] sm:text-[11px] font-semibold text-white tracking-tight truncate max-w-[95px]">
                              {item.provider}
                            </span>
                          </div>

                          <motion.div
                            animate={{
                              scale: isFocused ? 1.12 : 1,
                              backgroundColor: isFocused
                                ? 'rgba(37, 99, 235, 0.85)'
                                : 'rgba(255, 255, 255, 0.14)',
                            }}
                            transition={dpadSpring}
                            className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md"
                          >
                            <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                          </motion.div>
                        </div>

                        {/* Center watermark icon for 3rd-party app session cards */}
                        {!item.artSrc && item.appIconSrc && (
                          <motion.img
                            src={item.appIconSrc}
                            alt=""
                            animate={{
                              scale: isFocused ? 1.1 : 1,
                              opacity: isFocused ? 0.35 : 0.2,
                            }}
                            transition={dpadSpring}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl object-contain pointer-events-none blur-[0.5px]"
                          />
                        )}

                        {/* Bottom Glass Info & Animated Progress Bar */}
                        <div className="relative z-10 w-full space-y-1">
                          <div className="text-xs sm:text-[13px] font-semibold text-white tracking-tight truncate drop-shadow">
                            {item.title}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-300/95 font-normal truncate">
                            {item.subtitle}
                          </div>

                          {/* Glowing Cyan-Blue Progress Bar */}
                          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                              className="bg-gradient-to-r from-[#38bdf8] to-[#60a5fa] h-full rounded-full shadow-[0_0_10px_#38bdf8]"
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>

        {/* ========================================================================= */}
        {/* ON-SCREEN VIRTUAL TV REMOTE OVERLAY (Toggleable for easy simulation)      */}
        {/* ========================================================================= */}
        {showRemoteOverlay && (
          <div className="absolute bottom-5 right-5 z-40 w-52 bg-[#0a1022]/95 backdrop-blur-2xl border border-[#60a5fa]/60 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">Controle Century TV</span>
              <button
                onClick={() => setShowRemoteOverlay(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-32 h-32 mx-auto rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
              <button
                onClick={() => handleRemoteKey('ArrowUp')}
                className="absolute top-1.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white hover:text-cyan-300 cursor-pointer"
              >
                ▲
              </button>
              <button
                onClick={() => handleRemoteKey('ArrowDown')}
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white hover:text-cyan-300 cursor-pointer"
              >
                ▼
              </button>
              <button
                onClick={() => handleRemoteKey('ArrowLeft')}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 px-2 py-2 text-xs font-bold text-white hover:text-cyan-300 cursor-pointer"
              >
                ◄
              </button>
              <button
                onClick={() => handleRemoteKey('ArrowRight')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-2 text-xs font-bold text-white hover:text-cyan-300 cursor-pointer"
              >
                ►
              </button>
              <button
                onClick={() => handleRemoteKey('Enter')}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold text-xs border border-cyan-300 shadow-[0_0_15px_rgba(59,130,246,0.8)] cursor-pointer"
              >
                OK
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => handleRemoteKey('Escape')}
                className="bg-white/10 hover:bg-white/20 py-1.5 rounded-xl font-medium text-white cursor-pointer"
              >
                ↩ Voltar
              </button>
              <button
                onClick={() => {
                  setActiveDock('inicio');
                  setFocusedId('app-0');
                }}
                className="bg-blue-600/40 hover:bg-blue-600/60 border border-cyan-300/40 py-1.5 rounded-xl font-semibold text-cyan-200 cursor-pointer"
              >
                🏠 Início
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INSTALLED APPS DRAWER MODAL ("Apps" / "Mais Apps")                        */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isAppsDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.94, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 16 }}
                transition={dpadSpring}
                className="bg-[#0c1428]/95 border border-white/25 rounded-[28px] p-6 max-w-3xl w-full shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600/40 border border-cyan-300/50 flex items-center justify-center">
                      <Grid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Aplicativos de Terceiros Instalados</h3>
                      <p className="text-xs text-slate-300">
                        Ao abrir qualquer app de terceiro, ele é integrado automaticamente ao Continuar Assistindo
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAppsDrawerOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-[380px] overflow-y-auto p-1">
                  {allDrawerApps.map((app, idx) => {
                    const isSelected = drawerFocusIdx === idx;
                    return (
                      <motion.button
                        key={`${app.pkg}-${idx}`}
                        transition={{
                          ...dpadSpring,
                          boxShadow: isSelected
                            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.2 },
                        }}
                        animate={{
                          scale: isSelected ? 1.05 : 1,
                          boxShadow: isSelected
                            ? [
                                '0 0 18px rgba(59, 130, 246, 0.65), inset 0 0 12px rgba(56, 189, 248, 0.35)',
                                '0 0 34px rgba(56, 189, 248, 0.98), inset 0 0 22px rgba(165, 243, 252, 0.65)',
                                '0 0 18px rgba(59, 130, 246, 0.65), inset 0 0 12px rgba(56, 189, 248, 0.35)',
                              ]
                            : '0 0 0px rgba(0, 0, 0, 0)',
                        }}
                        onClick={() => {
                          setDrawerFocusIdx(idx);
                          setIsAppsDrawerOpen(false);
                          launchAppOrContent(app.name, app.pkg, '', undefined, app.iconSrc);
                        }}
                        onMouseEnter={() => setDrawerFocusIdx(idx)}
                        className={`rounded-2xl p-3.5 flex flex-col items-center gap-2 cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-blue-600/35 border-2 border-[#60a5fa]'
                            : 'bg-white/[0.06] border border-white/15 hover:border-white/35'
                        }`}
                      >
                        {app.iconSrc ? (
                          <img src={app.iconSrc} alt={app.name} className="w-12 h-12 rounded-xl object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-cyan-300/30 flex items-center justify-center text-lg font-bold text-cyan-200">
                            {app.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="text-xs font-semibold text-white truncate w-full text-center">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-cyan-300/80 truncate w-full text-center">
                          {app.tag}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* THIRD-PARTY CONTINUE WATCHING SESSION MODAL                               */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {activeMediaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.92, y: 18 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 18 }}
                transition={dpadSpring}
                className="bg-[#0c1428]/95 border border-[#60a5fa]/60 rounded-[28px] overflow-hidden max-w-xl w-full shadow-[0_0_50px_rgba(59,130,246,0.4)]"
              >
                <div className="relative h-48 w-full flex items-center justify-center overflow-hidden">
                  {activeMediaModal.artSrc ? (
                    <img
                      src={activeMediaModal.artSrc}
                      alt={activeMediaModal.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${
                        activeMediaModal.accentGradient ||
                        'from-[#1e3a8a] via-[#0f172a] to-[#050814]'
                      }`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1428] via-black/40 to-transparent" />
                  <button
                    onClick={() => setActiveMediaModal(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-4 left-6 right-6 flex items-center gap-4">
                    {activeMediaModal.appIconSrc && (
                      <img
                        src={activeMediaModal.appIconSrc}
                        alt={activeMediaModal.provider}
                        className="w-16 h-16 rounded-2xl object-contain shadow-xl border border-white/20"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600/60 border border-cyan-300/50 text-white">
                        App de Terceiro • {activeMediaModal.provider}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                        {activeMediaModal.title}
                      </h3>
                      <p className="text-xs text-slate-300">{activeMediaModal.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Pacote: {activeMediaModal.packagesCsv.split(',')[0]}</span>
                      <span>{activeMediaModal.progress}% concluído</span>
                    </div>
                    <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#38bdf8] to-[#60a5fa] h-full rounded-full"
                        style={{ width: `${activeMediaModal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => removeContinueWatchingCard(activeMediaModal.id)}
                      className="px-3.5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/35 border border-red-400/30 text-xs font-medium text-red-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover da Fila</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveMediaModal(null)}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={() => handleRemoteKey('Enter')}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir no {activeMediaModal.provider}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SETTINGS & TERMUX TOOLS MODAL ("Configurações")                           */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isSettingsModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.94, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 16 }}
                transition={dpadSpring}
                className="bg-[#0c1428]/95 border border-white/25 rounded-[28px] p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Configurações • Launcher Glass 26</h3>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      label: 'Abrir Configurações Nativas do Android 14 TV',
                      desc: 'Acessa o painel oficial de sistema da Century TV Stick',
                      icon: Settings,
                    },
                    {
                      label: 'Configurações de Rede e Wi-Fi (192.168.0.117)',
                      desc: 'Verificar sinal Wi-Fi e conexão ADB',
                      icon: Wifi,
                    },
                    {
                      label: 'Sincronizar Continuar Assistindo (Apps de Terceiros)',
                      desc: 'Busca sessões ativas do Watch Next dos apps instalados',
                      icon: RefreshCw,
                    },
                    {
                      label: 'Comandos Termux & Debloat 2GB RAM',
                      desc: 'Ver comandos de instalação ADB e otimização 0.5x',
                      icon: Terminal,
                    },
                    {
                      label: 'Voltar para a Tela Inicial',
                      desc: 'Fechar menu de configurações',
                      icon: Home,
                    },
                  ].map((opt, idx) => {
                    const Icon = opt.icon;
                    const isSelected = settingsFocusIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSettingsFocusIdx(idx);
                          handleRemoteKey('Enter');
                        }}
                        onMouseEnter={() => setSettingsFocusIdx(idx)}
                        className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/35 border border-[#60a5fa] shadow-[0_0_20px_rgba(59,130,246,0.65)]'
                            : 'bg-white/[0.05] border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-cyan-300 shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white">{opt.label}</div>
                          <div className="text-[11px] text-slate-300/80">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* FLOATING TOAST NOTIFICATION                                               */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={dpadSpring}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#0a1022]/95 border border-[#60a5fa] text-white px-5 py-2 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.7)] backdrop-blur-xl flex items-center gap-2 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};
