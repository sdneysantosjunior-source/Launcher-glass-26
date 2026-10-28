import React, { useState } from 'react';
import { Smartphone, Download, Copy, Check, Star, ExternalLink, ShieldCheck, CheckCircle } from 'lucide-react';

export const LauncherGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const projectivyInstallAdb = `# Baixar APK oficial mais recente do Projectivy Launcher no Termux
curl -L -o projectivy.apk "https://github.com/spocky/mifastlaunch/releases/download/v4.45/ProjectivyLauncher-4.45.apk"

# Instalar na sua TV via ADB
adb install -r projectivy.apk`;

  const flauncherInstallAdb = `# Baixar e instalar FLauncher (100% Código Aberto e Super Leve)
curl -L -o flauncher.apk "https://github.com/4nn0n/FLUI/releases/latest/download/app-release.apk"
adb install -r flauncher.apk`;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Launchers Recomendados (Sem Anúncios)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              O segredo da transformação do vídeo: trocar a tela inicial pesada por um launcher moderno e fluido.
            </p>
          </div>
        </div>
      </div>

      {/* Main Choice: Projectivy Launcher */}
      <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Star className="w-3.5 h-3.5 fill-purple-400" />
              <span>O Favorito da Comunidade & do Vídeo</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Projectivy Launcher
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Consome apenas <strong>~35MB de RAM</strong> (contra 220MB do sistema original). Visual estilo <em>Liquid Glass</em>, suporte a papéis de parede animados, organização de categorias e zero propagandas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.spocky.projengmenu"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl transition"
            >
              <span>Ver na Play Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </a>
          </div>
        </div>

        {/* Comparison Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Consumo de RAM</div>
            <div className="text-base font-bold text-emerald-400">~35 MB</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Taxa de Quadros</div>
            <div className="text-base font-bold text-cyan-400">60 FPS Estáveis</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Anúncios / Ads</div>
            <div className="text-base font-bold text-purple-400">Zero (0)</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Substituição do Botão Home</div>
            <div className="text-base font-bold text-amber-400">Integrada</div>
          </div>
        </div>

        {/* Installation via Termux */}
        <div className="space-y-2 mt-2">
          <div className="text-xs font-semibold text-slate-300">
            Comando para baixar e instalar diretamente pelo Termux do celular:
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-purple-300 whitespace-pre">
            {projectivyInstallAdb}
          </div>
          <button
            onClick={() => copyToClipboard(projectivyInstallAdb, 1)}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md shadow-purple-600/20"
          >
            {copiedIndex === 1 ? (
              <>
                <Check className="w-4 h-4" />
                <span>Comando de Instalação Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Comando de Instalação para o Termux</span>
              </>
            )}
          </button>
        </div>

        {/* Setup guide */}
        <div className="mt-4 bg-slate-950/50 border border-purple-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-purple-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span>Como definir como padrão na TV sem root:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>Abra o <strong>Projectivy Launcher</strong> que você acabou de instalar na TV.</li>
            <li>Abra as <strong>Configurações do Projectivy</strong> (ícone de engrenagem no canto superior).</li>
            <li>Vá em <strong>Geral</strong> ➔ <strong>Substituir Inicializador Atual</strong>.</li>
            <li>A TV abrirá a tela de <strong>Acessibilidade</strong>: basta ativar a chave do <strong>Projectivy Launcher</strong>.</li>
            <li>Pronto! Toda vez que você apertar o botão Home ou ligar a TV, abrirá na velocidade da luz!</li>
          </ol>
        </div>
      </div>

      {/* Alternative: FLauncher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Opção Alternativa: FLauncher
            </h3>
            <p className="text-xs text-slate-400">
              Para quem busca o extremo minimalismo. Aplicativo 100% open source feito em Flutter.
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
            Open Source
          </span>
        </div>

        <div className="space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 whitespace-pre">
            {flauncherInstallAdb}
          </div>
          <button
            onClick={() => copyToClipboard(flauncherInstallAdb, 2)}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {copiedIndex === 2 ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Comando do FLauncher</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
