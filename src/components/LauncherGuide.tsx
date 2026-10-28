import React, { useState } from 'react';
import { Smartphone, Download, Copy, Check, Star, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';

export const LauncherGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const launcherGlassInstallAdb = `# Baixar o APK oficial da Launcher Glass 26 compilado no GitHub:
curl -L -o Launcher-glass-26.apk "https://github.com/sdneysantosjunior-source/Launcher-glass-26/releases/download/v1.0.0/Launcher-glass-26.apk"

# Conectar e Instalar no Century TV Stick (Android 14 - 192.168.0.117):
adb connect 192.168.0.117:5555
adb install -r Launcher-glass-26.apk

# Iniciar a Launcher Glass 26:
adb shell monkey -p com.sdneysantos.launcherglass 1`;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Launcher Glass 26 (Própria & Otimizada)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Nossa interface personalizada com visual Glassmorphism, planeta cósmico, suporte 100% ao controle remoto e otimizada para o Century TV Stick (Android 14, 2GB RAM).
            </p>
          </div>
        </div>
      </div>

      {/* Main Choice: Launcher Glass 26 */}
      <div className="bg-gradient-to-br from-cyan-950/50 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
              <Star className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Nossa Launcher Oficial</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Launcher Glass 26 (Android 14)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Consumo ultrabaixo de RAM (~40MB), renderização fluida em 60 FPS, cards translúcidos de streaming (Netflix, Prime Video, YouTube, Disney+, Max, Globoplay, Apple TV) e zero anúncios.
            </p>
          </div>
        </div>

        {/* Comparison Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Consumo de RAM</div>
            <div className="text-base font-bold text-emerald-400">~40 MB</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Taxa de Quadros</div>
            <div className="text-base font-bold text-cyan-400">60 FPS Fluido</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Anúncios / Bloatware</div>
            <div className="text-base font-bold text-cyan-400">Zero (0)</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Compatibilidade</div>
            <div className="text-base font-bold text-amber-400">Android 14 TV</div>
          </div>
        </div>

        {/* Installation via Termux */}
        <div className="space-y-2 mt-2">
          <div className="text-xs font-semibold text-slate-300">
            Comando para baixar e instalar diretamente pelo Termux no Century TV Stick (192.168.0.117):
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 whitespace-pre overflow-x-auto">
            {launcherGlassInstallAdb}
          </div>
          <button
            onClick={() => copyToClipboard(launcherGlassInstallAdb, 1)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {copiedIndex === 1 ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Comando de Instalação Copiado! Cole no Termux</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>Copiar Comando de Instalação para o Termux</span>
              </>
            )}
          </button>
        </div>

        {/* Setup guide */}
        <div className="mt-4 bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Como definir a Launcher Glass 26 como Home Padrão na TV:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>Instale o APK pelo Termux com o comando acima.</li>
            <li>Ao apertar o botão Home do controle, a Century TV perguntará qual launcher usar.</li>
            <li>Selecione <strong>Launcher Glass 26</strong> e escolha <strong>"Sempre"</strong>.</li>
            <li>Pronto! Toda vez que você ligar o Century Stick ou apertar a tecla Home, ela abrirá instantaneamente sem travamentos.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
