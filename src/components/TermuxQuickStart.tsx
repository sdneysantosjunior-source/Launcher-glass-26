import React, { useState } from 'react';
import { Terminal, Copy, Check, Wifi, AlertTriangle, ShieldCheck, Download, ChevronRight, Zap } from 'lucide-react';

export const TermuxQuickStart: React.FC = () => {
  const [tvIp, setTvIp] = useState('192.168.0.117');
  const [tvPort, setTvPort] = useState('5555');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const autoScriptCommand = `curl -sL ${currentHost}/api/script/gemini_tv.sh | bash`;

  return (
    <div className="space-y-6">
      {/* Hero card: Automated 1-Click Termux Script */}
      <div className="bg-gradient-to-br from-cyan-950/70 via-slate-900 to-indigo-950/80 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Instalação Direta no Century TV Stick (192.168.0.117)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Comandos Prontos para o Termux
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Como seu celular já está conectado à TV, basta copiar e colar os comandos diretos abaixo no Termux sem precisar baixar scripts externos:
            </p>
          </div>
        </div>

        {/* Copy paste command box */}
        <div className="mt-4 bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Solução para o erro "Não tenho app para fazer isso":</span>
            <span className="text-[11px] text-slate-400">Century TV Stick (192.168.0.117)</span>
          </div>
          
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200">
            💡 <strong>Por que deu esse erro na TV?</strong> A Century TV Stick não vem de fábrica com nenhum navegador para abrir links. Para resolver de vez, instalamos o aplicativo APK direto pelo Termux!
          </div>

          <div className="font-mono text-xs text-cyan-300 whitespace-pre overflow-x-auto select-all bg-black/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
{`# 1. Baixar o APK da Launcher Glass 26 (do seu repositório no GitHub):
curl -L -o Launcher-glass-26.apk "https://github.com/sdneysantosjunior-source/Launcher-glass-26/releases/download/v1.0.0/Launcher-glass-26.apk"

# 2. Conectar e Instalar o APK na TV Century (IP 192.168.0.117):
adb connect 192.168.0.117:5555
adb install -r Launcher-glass-26.apk

# 3. Abrir a Launcher Glass 26 imediatamente na TV:
adb shell monkey -p com.sdneysantos.launcherglass 1

# 4. Desativar a Launcher pesada antiga e anúncios da TV:
adb shell pm disable-user --user 0 com.google.android.tvlauncher
adb shell pm disable-user --user 0 com.google.android.tvrecommendations
adb shell pm disable-user --user 0 com.google.android.videos
adb shell pm disable-user --user 0 com.google.android.play.games
adb shell pm disable-user --user 0 com.google.android.feedback

# 5. Turbinar a velocidade (0.5x e RAM livre para 2GB):
adb shell settings put global window_animation_scale 0.5
adb shell settings put global transition_animation_scale 0.5
adb shell settings put global animator_duration_scale 0.5
adb shell setprop persist.sys.purgeable_assets 1`}
          </div>

          <button
            onClick={() => copyToClipboard(`curl -L -o Launcher-glass-26.apk "https://github.com/sdneysantosjunior-source/Launcher-glass-26/releases/download/v1.0.0/Launcher-glass-26.apk" && adb connect 192.168.0.117:5555 && adb install -r Launcher-glass-26.apk && adb shell monkey -p com.sdneysantos.launcherglass 1 && adb shell pm disable-user --user 0 com.google.android.tvlauncher && adb shell pm disable-user --user 0 com.google.android.tvrecommendations && adb shell pm disable-user --user 0 com.google.android.videos && adb shell pm disable-user --user 0 com.google.android.play.games && adb shell pm disable-user --user 0 com.google.android.feedback && adb shell settings put global window_animation_scale 0.5 && adb shell settings put global transition_animation_scale 0.5 && adb shell settings put global animator_duration_scale 0.5 && adb shell setprop persist.sys.purgeable_assets 1`, 888)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {copiedIndex === 888 ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Comando Completo Copiado! Cole no Termux</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>Copiar Comando Completo para o Termux (1 Clique)</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          👉 Cole no Termux e dê Enter. Ele baixa o APK, instala na TV e já abre na tela da Century TV Stick!
        </p>
      </div>

      {/* IP & Connection Settings Helper */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3">
          <Wifi className="w-5 h-5 text-cyan-400" />
          Configurador de IP do Century TV Stick
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-4">
          Digite o endereço IP da sua TV para que todos os comandos manuais fiquem customizados com o seu endereço real:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Endereço IP da TV (ex: 192.168.1.15):
            </label>
            <input
              type="text"
              value={tvIp}
              onChange={(e) => setTvIp(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Porta ADB (Padrão 5555):
            </label>
            <input
              type="text"
              value={tvPort}
              onChange={(e) => setTvPort(e.target.value)}
              placeholder="5555"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        <div className="mt-3 text-xs bg-slate-800/60 text-slate-300 p-3 rounded-xl border border-slate-700/60 flex items-center gap-2">
          <span className="text-cyan-400 font-bold shrink-0">Onde ver o IP na TV?</span>
          <span>Configurações ➔ Rede e Internet ➔ Selecione a sua rede Wi-Fi conectada ➔ Veja a linha "Endereço IP".</span>
        </div>
      </div>

      {/* Detailed Step by Step Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          Passo a Passo Manual no Termux (Para quem prefere rodar comando por comando)
        </h3>

        {/* Step 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h4 className="font-semibold text-white text-base">
              Ativar o Modo Desenvolvedor e Depuração USB na TV
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 pl-10">
            Na sua TV ou Mi TV Stick, pegue o controle remoto e faça:
          </p>
          <ul className="text-xs sm:text-sm text-slate-400 pl-10 space-y-1 list-disc list-inside">
            <li>Abra <strong>Configurações</strong> (ícone da engrenagem).</li>
            <li>Vá em <strong>Preferências do Dispositivo</strong> ➔ <strong>Sobre</strong>.</li>
            <li>Role até <strong>Número da Versão / Número de Compilação</strong> e clique <strong>7 vezes seguidas</strong> no botão central do controle até aparecer: <em>"Você agora é um desenvolvedor!"</em>.</li>
            <li>Volte uma tela, entre no novo menu <strong>Opções do Desenvolvedor</strong>.</li>
            <li>Ative a opção <strong>Depuração USB</strong> (ou <strong>Depuração por Wi-Fi</strong>).</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h4 className="font-semibold text-white text-base">
                Instalar ferramentas ADB no Termux do Celular
              </h4>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 pl-10">
            Abra o Termux no seu celular Android e execute este comando para instalar o ADB:
          </p>
          <div className="pl-10">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <code className="text-xs sm:text-sm text-green-400 font-mono">
                pkg update -y && pkg install android-tools curl -y
              </code>
              <button
                onClick={() => copyToClipboard('pkg update -y && pkg install android-tools curl -y', 2)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Copiar"
              >
                {copiedIndex === 2 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h4 className="font-semibold text-white text-base">
                Conectar o Celular na TV via Wi-Fi
              </h4>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 pl-10">
            Certifique-se de que o celular e a TV estão conectados na mesma rede Wi-Fi e execute:
          </p>
          <div className="pl-10 space-y-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <code className="text-xs sm:text-sm text-cyan-300 font-mono">
                adb connect {tvIp}:{tvPort}
              </code>
              <button
                onClick={() => copyToClipboard(`adb connect ${tvIp}:${tvPort}`, 3)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Copiar"
              >
                {copiedIndex === 3 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-amber-950/30 border border-amber-600/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção na tela da TV:</strong> No primeiro comando, a TV vai exibir um aviso: <em>"Permitir depuração USB?"</em>.
                Pegue o controle remoto, marque a caixinha <strong>"Sempre permitir deste computador"</strong> e clique em <strong>OK</strong>!
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                4
              </span>
              <h4 className="font-semibold text-white text-base">
                Verificar se a TV está Autorizada
              </h4>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 pl-10">
            Rode este comando para garantir que a TV está conectada:
          </p>
          <div className="pl-10">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <code className="text-xs sm:text-sm text-indigo-300 font-mono">
                adb devices
              </code>
              <button
                onClick={() => copyToClipboard('adb devices', 4)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Copiar"
              >
                {copiedIndex === 4 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Se aparecer <code className="text-emerald-400 font-semibold">{tvIp}:{tvPort} device</code>, está tudo pronto para o debloat e otimização!
            </p>
          </div>
        </div>

        {/* Special Note for Android 14 Pairing */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Century TV Stick no Android 14 (Dica de Pareamento Sem Fio se solicitar)</span>
          </div>
          <p>
            No Android 14, se a TV solicitar pareamento por porta aleatória com código de 6 dígitos:
            Vá em <em>Opções do Desenvolvedor ➔ Depuração sem fio ➔ Parear dispositivo com código</em>.
            No Termux, use: <code className="text-slate-200 bg-black/50 px-1 py-0.5 rounded font-mono">adb pair 192.168.0.117:&lt;porta-da-tv&gt; &lt;codigo-6-digitos&gt;</code> e depois <code className="text-slate-200 bg-black/50 px-1 py-0.5 rounded font-mono">adb connect 192.168.0.117:5555</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
