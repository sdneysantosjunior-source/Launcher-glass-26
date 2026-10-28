import React, { useState } from 'react';
import { Zap, Copy, Check, RotateCcw, Gauge, Cpu, CheckCircle } from 'lucide-react';

export const SpeedTweaks: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = useState<'0.5' | '0.25' | '0'>('0.5');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const animationCommands = `adb shell settings put global window_animation_scale ${animationSpeed}
adb shell settings put global transition_animation_scale ${animationSpeed}
adb shell settings put global animator_duration_scale ${animationSpeed}`;

  const ramOptimizationCommands = `# Limitar drenagem de RAM pelo Google Play Services em background
adb shell cmd appops set com.google.android.gms RUN_IN_BACKGROUND ignore

# Desativar relatórios e telemetria contínua
adb shell settings put global send_action_app_error 0
adb shell settings put secure send_action_app_error 0

# Forçar liberação de memória de texturas não utilizadas
adb shell setprop persist.sys.purgeable_assets 1`;

  const restoreCommands = `adb shell settings put global window_animation_scale 1.0
adb shell settings put global transition_animation_scale 1.0
adb shell settings put global animator_duration_scale 1.0
adb shell cmd appops set com.google.android.gms RUN_IN_BACKGROUND default`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Aceleração de Resposta e Memória RAM
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Ajustes de baixo nível via ADB para eliminar atrasos nos cliques do controle remoto.
            </p>
          </div>
        </div>
      </div>

      {/* Animation Scale Tweaks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <span>Escala de Velocidade das Animações</span>
          </div>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-semibold border border-cyan-500/30">
            Resposta Imediata
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          No Android TV tradicional, as janelas demoram 1 segundo inteiro para abrir. Reduzindo para 0.5x, o sistema abre menus instantaneamente sem engasgos.
        </p>

        {/* Speed Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setAnimationSpeed('0.5')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer ${
              animationSpeed === '0.5'
                ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-base sm:text-lg">0.5x</div>
            <div className="text-[11px] text-cyan-400 font-medium">Recomendado (Fluido)</div>
          </button>

          <button
            onClick={() => setAnimationSpeed('0.25')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer ${
              animationSpeed === '0.25'
                ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-base sm:text-lg">0.25x</div>
            <div className="text-[11px] text-cyan-400 font-medium">Ultra Rápido</div>
          </button>

          <button
            onClick={() => setAnimationSpeed('0')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer ${
              animationSpeed === '0'
                ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-base sm:text-lg">0.0x (Desligadas)</div>
            <div className="text-[11px] text-cyan-400 font-medium">Máximo Desempenho</div>
          </button>
        </div>

        {/* Animation Code Box */}
        <div className="space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 whitespace-pre">
            {animationCommands}
          </div>
          <button
            onClick={() => copyToClipboard(animationCommands, 1)}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {copiedIndex === 1 ? (
              <>
                <Check className="w-4 h-4" />
                <span>Comando de Animação Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Comando de Animação para o Termux</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RAM & Google Play Services Optimization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Otimização Profunda de Processos em Segundo Plano</span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
            +150MB RAM Livre
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          O <em>Google Play Services</em> costuma consumir de 100MB a 200MB de RAM mesmo enquanto você apenas assiste a um vídeo. Este comando restringe o consumo em segundo plano sem desativar a sua conta Google:
        </p>

        <div className="space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 whitespace-pre">
            {ramOptimizationCommands}
          </div>
          <button
            onClick={() => copyToClipboard(ramOptimizationCommands, 2)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md shadow-emerald-500/20"
          >
            {copiedIndex === 2 ? (
              <>
                <Check className="w-4 h-4" />
                <span>Comandos de RAM Copiados!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Otimização de RAM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Deseja restaurar as animações e processos para o padrão de fábrica da Google?
        </div>
        <button
          onClick={() => copyToClipboard(restoreCommands, 3)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
        >
          {copiedIndex === 3 ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Restaurador Copiado!</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Copiar Comandos de Restauração</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
