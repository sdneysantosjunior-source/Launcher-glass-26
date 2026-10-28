import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, Copy, Check, RotateCcw, Cpu, Layers, RefreshCw } from 'lucide-react';
import { TV_PRESETS } from '../data/tvPresets';
import { PackageItem, AnalysisResult } from '../types';

export const PackageAnalyzer: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState('century-tv-stick');
  const [packages, setPackages] = useState<PackageItem[]>(
    TV_PRESETS.find((p) => p.id === 'century-tv-stick')?.recommendedPackages || []
  );
  const [customPackageText, setCustomPackageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiResult, setGeminiResult] = useState<AnalysisResult | null>(null);
  const [copiedDebloat, setCopiedDebloat] = useState(false);
  const [copiedRestore, setCopiedRestore] = useState(false);

  const activePreset = TV_PRESETS.find((p) => p.id === selectedPresetId);

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = TV_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPackages(preset.recommendedPackages);
    }
  };

  const togglePackageSelection = (pkgName: string) => {
    setPackages((prev) =>
      prev.map((item) =>
        item.package === pkgName ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Run real Gemini API analysis
  const handleAnalyzeWithGemini = async () => {
    setIsAnalyzing(true);
    setGeminiResult(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tvModel: activePreset ? `${activePreset.name} (${activePreset.ram})` : 'Android TV',
          packageList: customPackageText || packages.map((p) => p.package).join('\n'),
          customNotes: 'Quero liberar o máximo de RAM e tirar todas as propagandas do launcher sem quebrar o controle remoto.',
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setGeminiResult(res.data);
        if (res.data.safePackages && Array.isArray(res.data.safePackages)) {
          // Merge packages
          const newPackages: PackageItem[] = [
            ...res.data.safePackages.map((p: any) => ({
              package: p.package,
              name: p.name || p.package,
              category: 'safe' as const,
              reason: p.reason || 'Recomendado para desativação segura por Gemini AI.',
              ramSavedMb: p.ramSavedMb || 40,
              selected: true,
            })),
            ...(res.data.optionalPackages || []).map((p: any) => ({
              package: p.package,
              name: p.name || p.package,
              category: 'optional' as const,
              reason: p.reason || 'Opcional.',
              ramSavedMb: p.ramSavedMb || 50,
              selected: false,
            })),
            ...(res.data.dangerousPackages || []).map((p: any) => ({
              package: p.package,
              name: p.name || p.package,
              category: 'dangerous' as const,
              reason: p.reason || 'NÃO MEXER: Essencial para o sistema.',
              ramSavedMb: 0,
              selected: false,
            })),
          ];
          setPackages(newPackages);
        }
      }
    } catch (err) {
      console.error('Failed to analyze with Gemini', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate RAM saved
  const selectedPackages = packages.filter((p) => p.selected && p.category !== 'dangerous');
  const totalRamSaved = selectedPackages.reduce((acc, curr) => acc + (curr.ramSavedMb || 0), 0);

  // Generate Termux command lines
  const debloatCommands = selectedPackages
    .map((p) => `adb shell pm disable-user --user 0 ${p.package}`)
    .join('\n');

  const restoreCommands = selectedPackages
    .map((p) => `adb shell pm enable ${p.package}`)
    .join('\n');

  const handleCopyDebloat = () => {
    navigator.clipboard.writeText(debloatCommands);
    setCopiedDebloat(true);
    setTimeout(() => setCopiedDebloat(false), 2000);
  };

  const handleCopyRestore = () => {
    navigator.clipboard.writeText(restoreCommands);
    setCopiedRestore(true);
    setTimeout(() => setCopiedRestore(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Análise Inteligente com Gemini 3.8 Flash</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Analisador & Debloater de TV
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Desative o launcher oficial pesado, feeds de propagandas e serviços inúteis em segundo plano com 100% de segurança e comandos reversíveis no Termux.
            </p>
          </div>

          {/* RAM stats box */}
          <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-300 font-medium">Economia Estimada</div>
              <div className="text-2xl font-black text-white">
                +{totalRamSaved} <span className="text-sm font-semibold text-emerald-400">MB RAM</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedPackages.length} pacotes selecionados
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Selecione o modelo do seu aparelho de TV:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TV_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm truncate">{preset.name}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.ram}</div>
                </button>
              );
            })}
          </div>

          {activePreset && (
            <p className="text-xs text-slate-400 mt-2 italic">
              ℹ️ {activePreset.description}
            </p>
          )}
        </div>
      </div>

      {/* Custom Packages Accordion / Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-semibold text-slate-300 hover:text-white">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Deseja colar a lista exata de pacotes da sua TV para o Gemini analisar? (Opcional)
            </span>
            <span className="text-xs text-cyan-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 space-y-3 pt-2">
            <p className="text-xs text-slate-400">
              No Termux, você pode rodar <code className="bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">adb shell pm list packages</code>, copiar o resultado e colar aqui abaixo para o Gemini categorizar com precisão milimétrica:
            </p>
            <textarea
              rows={4}
              value={customPackageText}
              onChange={(e) => setCustomPackageText(e.target.value)}
              placeholder="Cole aqui a saída de 'pm list packages' (ex: package:com.google.android.tvlauncher...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </details>

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAnalyzeWithGemini}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Gemini Analisando Pacotes...' : 'Analisar com Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Summary if generated */}
      {geminiResult?.overview && (
        <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 text-sm text-cyan-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Diagnóstico do Gemini AI</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {geminiResult.overview}
          </p>
        </div>
      )}

      {/* Packages List Divided by Category */}
      <div className="space-y-4">
        {/* SAFE PACKAGES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>100% Seguro Desativar (Bloatwares & Anúncios)</span>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Recomendado
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Estes pacotes são os maiores causadores de travamentos no Mi TV Stick e Android TV. Desativá-los não afeta canais ou streaming.
          </p>

          <div className="space-y-2 pt-1">
            {packages
              .filter((p) => p.category === 'safe')
              .map((pkg) => (
                <div
                  key={pkg.package}
                  onClick={() => togglePackageSelection(pkg.package)}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                    pkg.selected
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-white">
                        {pkg.name}
                      </span>
                      {pkg.ramSavedMb && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-medium">
                          +{pkg.ramSavedMb}MB
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 truncate max-w-xs sm:max-w-md">
                      {pkg.package}
                    </div>
                    <div className="text-xs text-slate-400">{pkg.reason}</div>
                  </div>

                  <input
                    type="checkbox"
                    checked={!!pkg.selected}
                    onChange={() => {}}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer mt-1 shrink-0"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* OPTIONAL PACKAGES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Opcional (Desative apenas se não usar)</span>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Avalie seu uso
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {packages
              .filter((p) => p.category === 'optional')
              .map((pkg) => (
                <div
                  key={pkg.package}
                  onClick={() => togglePackageSelection(pkg.package)}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                    pkg.selected
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-white">
                        {pkg.name}
                      </span>
                      {pkg.ramSavedMb && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono font-medium">
                          +{pkg.ramSavedMb}MB
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-amber-300 truncate max-w-xs sm:max-w-md">
                      {pkg.package}
                    </div>
                    <div className="text-xs text-slate-400">{pkg.reason}</div>
                  </div>

                  <input
                    type="checkbox"
                    checked={!!pkg.selected}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer mt-1 shrink-0"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* DANGEROUS / CRITICAL PACKAGES */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>NUNCA DESATIVAR (Componentes Críticos Protegidos)</span>
          </div>
          <p className="text-xs text-slate-300">
            Estes pacotes são mantidos travados pelo Gemini Optimizer. Se forem desativados, você perderá a conexão do controle remoto Bluetooth ou o teclado!
          </p>

          <div className="space-y-2 pt-1">
            {packages
              .filter((p) => p.category === 'dangerous')
              .map((pkg) => (
                <div
                  key={pkg.package}
                  className="p-3 rounded-xl border border-rose-900/50 bg-slate-950/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-rose-200">
                      {pkg.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {pkg.package}
                    </div>
                    <div className="text-xs text-rose-300/80 mt-0.5">{pkg.reason}</div>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold shrink-0">
                    BLOQUEADO
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Ready-to-copy Action Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Copy className="w-5 h-5 text-cyan-400" />
          Comandos Gerados para o Termux
        </h3>

        {/* Debloat Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Comando de Otimização (Desativar {selectedPackages.length} pacotes):</span>
            <span className="text-emerald-400 font-semibold">100% Reversível</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 max-h-36 overflow-y-auto whitespace-pre select-all">
            {debloatCommands || '# Nenhum pacote selecionado'}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopyDebloat}
              disabled={selectedPackages.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {copiedDebloat ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Comandos de Otimização</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyRestore}
              disabled={selectedPackages.length === 0}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3 px-4 rounded-xl text-sm transition cursor-pointer"
            >
              {copiedRestore ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Script de Restauração Copiado!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Copiar Script de Restauração (Desfazer)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
