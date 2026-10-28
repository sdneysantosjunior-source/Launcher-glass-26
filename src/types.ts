export interface PackageItem {
  package: string;
  name: string;
  category: 'safe' | 'optional' | 'dangerous';
  reason: string;
  ramSavedMb?: number;
  selected?: boolean;
}

export interface TvPreset {
  id: string;
  name: string;
  brand: string;
  androidVersion: string;
  ram: string;
  description: string;
  recommendedPackages: PackageItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AnalysisResult {
  overview?: string;
  safePackages?: PackageItem[];
  optionalPackages?: PackageItem[];
  dangerousPackages?: PackageItem[];
  termuxScript?: string;
  revertScript?: string;
  animationTweaks?: string;
  estimatedRamSavedMb?: number;
  rawText?: string;
}
