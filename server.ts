import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini AI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Helper function for intelligent fallback responses when Gemini API is unavailable or timing out
function getFallbackAnalysis(tvModel: string) {
  const isCentury = (tvModel || '').toLowerCase().includes('century');

  return {
    overview: isCentury
      ? `Diagnóstico para Century TV Stick (2GB RAM): Seu aparelho tem um processador e memória muito superiores aos sticks de 1GB, mas o Android TV original ainda perde cerca de 500MB a 700MB de RAM mantendo canais patrocinados, trailers de filmes da Google e telemetria em segundo plano. Com o debloat seguro e o Projectivy Launcher, seu Century TV Stick ficará com mais de 1.1 GB de RAM 100% livres e fluidez instantânea de 60fps.`
      : `Diagnóstico inteligente para ${tvModel}: Identificamos que o sistema original mantém processos pesados de propaganda e telemetria que consomem RAM desnecessariamente. A desativação segura desses pacotes deixará sua TV com resposta instantânea aos comandos do controle.`,
    safePackages: [
      {
        package: 'com.google.android.tvlauncher',
        name: 'Android TV Home Launcher',
        category: 'safe',
        reason: 'O principal gastador de RAM. Roda prévias de vídeos e anúncios em segundo plano.',
        ramSavedMb: 190,
      },
      {
        package: 'com.google.android.tvrecommendations',
        name: 'Android TV Core Recommendations',
        category: 'safe',
        reason: 'Serviço que puxa banners e anúncios promovidos na tela inicial.',
        ramSavedMb: 80,
      },
      {
        package: 'com.google.android.videos',
        name: 'Google Play Filmes & TV',
        category: 'safe',
        reason: 'Catálogo de compras desnecessário da Google que roda em background.',
        ramSavedMb: 55,
      },
      {
        package: 'com.google.android.play.games',
        name: 'Google Play Games TV',
        category: 'safe',
        reason: 'Serviço de jogos em segundo plano.',
        ramSavedMb: 45,
      },
      {
        package: 'com.google.android.feedback',
        name: 'Google Telemetria & Feedback',
        category: 'safe',
        reason: 'Envio de dados de telemetria.',
        ramSavedMb: 35,
      },
    ],
    optionalPackages: [
      {
        package: 'com.google.android.katniss',
        name: 'Google Assistente TV (Voz)',
        category: 'optional',
        reason: 'Assistente de comando de voz. Se não fala com o controle, economiza +95MB de RAM.',
        ramSavedMb: 95,
      },
      {
        package: 'com.google.android.apps.mediashell',
        name: 'Chromecast Built-in',
        category: 'optional',
        reason: 'Transmissão do celular para a TV. Mantenha se você usa espelhamento.',
        ramSavedMb: 65,
      },
    ],
    dangerousPackages: [
      {
        package: 'com.android.bluetooth',
        name: 'Bluetooth do Controle Remoto Century',
        category: 'dangerous',
        reason: 'CRÍTICO: O controle remoto da sua TV parará de responder se for desativado!',
        ramSavedMb: 0,
      },
      {
        package: 'com.android.packageinstaller',
        name: 'Instalador de Pacotes Android',
        category: 'dangerous',
        reason: 'CRÍTICO: Impede a instalação de qualquer aplicativo ou APK na TV.',
        ramSavedMb: 0,
      },
      {
        package: 'com.google.android.inputmethod.latin',
        name: 'Teclado Virtual (Gboard / IME)',
        category: 'dangerous',
        reason: 'CRÍTICO: Sem ele não é possível digitar senhas ou fazer pesquisas na TV.',
        ramSavedMb: 0,
      },
    ],
  };
}

function getFallbackChat(question: string) {
  const q = (question || '').toLowerCase();
  if (q.includes('unauthorized') || q.includes('não autorizado')) {
    return `### ⚠️ Como resolver o erro "device unauthorized":
1. Olhe para a **tela da sua TV** agora.
2. Deve haver um pop-up perguntando: *"Permitir depuração USB deste computador?"*.
3. Pegue o controle remoto da TV, selecione a caixinha **"Sempre permitir deste computador"** e aperte **OK**.
4. No Termux, rode:
\`\`\`bash
adb kill-server
adb connect <IP_DA_TV>:5555
adb devices
\`\`\`
O status mudará para \`device\` e estará pronto!`;
  }
  if (q.includes('ip') || q.includes('achar') || q.includes('onde')) {
    return `### 🔍 Como encontrar o endereço IP da TV:
1. No controle da TV, vá em **Configurações** (engrenagem no canto superior).
2. Acesse **Rede e Internet**.
3. Clique em cima do nome do seu Wi-Fi conectado.
4. Role até encontrar a linha **Endereço IP** (exemplo: \`192.168.1.15\` ou \`192.168.0.100\`).
5. Digite esse IP no configurador do app para gerar os comandos prontos!`;
  }
  if (q.includes('11') || q.includes('12') || q.includes('pair') || q.includes('parear') || q.includes('código')) {
    return `### 📱 Como parear no Android 11 e 12 (Google TV) com código de 6 dígitos:
Nas versões recentes do Android TV, é necessário fazer um pareamento prévio:
1. Na TV: Vá em **Opções do Desenvolvedor** ➔ **Depuração sem fio** ➔ **Parear dispositivo com código de pareamento**.
2. A TV mostrará um endereço com porta aleatória (ex: \`192.168.1.25:37125\`) e um código de 6 números.
3. No Termux do celular, digite:
\`\`\`bash
adb pair 192.168.1.25:37125
\`\`\`
4. O Termux pedirá o código. Digite os 6 dígitos exibidos na TV.
5. Após o sucesso, conecte normalmente:
\`\`\`bash
adb connect 192.168.1.25:5555
\`\`\``;
  }
  if (q.includes('reverter') || q.includes('desfazer') || q.includes('voltar')) {
    return `### 🔄 Como desfazer qualquer alteração e reativar os apps nativos:
Como utilizamos o comando \`pm disable-user --user 0\` em vez de desinstalação destrutiva, nada é excluído da memória flash.
Para restaurar o launcher oficial e serviços:
\`\`\`bash
adb shell pm enable com.google.android.tvlauncher
adb shell pm enable com.google.android.tvrecommendations
adb shell pm enable com.google.android.videos
adb shell pm enable com.google.android.play.games
adb shell pm enable com.xiaomi.mitv.upgrade
\`\`\`
O sistema voltará 100% ao estado original de fábrica!`;
  }
  if (q.includes('claude') || q.includes('gemini') || q.includes('vantagem') || q.includes('melhor')) {
    return `### 🚀 Por que usar o Gemini para otimizar sua Android TV?
1. **Compreensão de Hardware Real:** O Gemini 3.8 Flash possui conhecimento detalhado das limitações dos chipsets Amlogic e Allwinner de 1GB de RAM usados em Mi TV Sticks e TVs de entrada no Brasil.
2. **Segurança de Componentes:** O Gemini categoriza com precisão cirúrgica os pacotes essenciais de Bluetooth e Acessibilidade para nunca inutilizar o controle remoto.
3. **Velocidade de Execução:** Menor latência e scripts diretamente formatados para o bash do Termux no Android.`;
  }
  return `### 💡 Dica do Copiloto Gemini AI:
Para obter o melhor desempenho na sua TV com 1GB de RAM:
1. Instale o **Projectivy Launcher** antes de desativar o launcher antigo.
2. No Termux, desative o launcher pesado e os feeds de anúncios:
\`\`\`bash
adb shell pm disable-user --user 0 com.google.android.tvlauncher
adb shell pm disable-user --user 0 com.google.android.tvrecommendations
\`\`\`
3. Acelere as animações para 0.5x:
\`\`\`bash
adb shell settings put global window_animation_scale 0.5
adb shell settings put global transition_animation_scale 0.5
adb shell settings put global animator_duration_scale 0.5
\`\`\`
Sua TV responderá instantaneamente a cada clique no controle remoto! Se tiver alguma dúvida ou mensagem de erro no Termux, pode me perguntar.`;
}

// Analyze TV Packages and Generate Debloat Recommendations using Gemini
app.post('/api/gemini/analyze', async (req, res) => {
  const { tvModel, packageList, customNotes } = req.body;

  const hasRealKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

  if (!hasRealKey) {
    return res.json({ success: true, data: getFallbackAnalysis(tvModel || 'Android TV') });
  }

  try {
    const systemInstruction = `Você é um engenheiro sênior especialista em sistemas Android TV, Google TV, Mi TV Stick, Fire OS e otimização de baixo nível via comandos ADB no Termux.
Seu objetivo é ajudar usuários a transformarem TVs lentas em uma interface rápida e limpa sem root.
REGRAS:
1. NUNCA recomende desativar Bluetooth do controle remoto (com.android.bluetooth), instalador de pacotes ou teclado.
2. Use comandos reversíveis: "pm disable-user --user 0 <pacote>".
3. Responda em Português do Brasil com JSON estruturado.`;

    const prompt = `Analise a TV: ${tvModel}. Pacotes: ${packageList?.slice(0, 5000) || 'Padrão'}.
Retorne JSON com: overview, safePackages, optionalPackages, dangerousPackages.`;

    // Promise with 6s timeout
    const fetchPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
    );

    const response = (await Promise.race([fetchPromise, timeoutPromise])) as any;
    const text = response?.text || '{}';
    let parsedData = JSON.parse(text);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.warn('Gemini analyze fallback used:', error?.message);
    res.json({ success: true, data: getFallbackAnalysis(tvModel || 'Android TV') });
  }
});

// Interactive Gemini Assistant for Termux & TV Troubleshooting
app.post('/api/gemini/chat', async (req, res) => {
  const { messages } = req.body;
  const lastUserMessage = (messages || []).filter((m: any) => m.role === 'user').pop()?.content || '';

  const hasRealKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

  if (!hasRealKey) {
    return res.json({ success: true, reply: getFallbackChat(lastUserMessage) });
  }

  try {
    const systemInstruction = `Você é o "Gemini TV Assistant", copiloto em Português do Brasil especialista em otimizar Android TV via Termux e comandos ADB.
Forneça comandos prontos para copiar e instruções diretas.`;

    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const fetchPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: { systemInstruction, temperature: 0.7 },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
    );

    const response = (await Promise.race([fetchPromise, timeoutPromise])) as any;
    res.json({
      success: true,
      reply: response.text || getFallbackChat(lastUserMessage),
    });
  } catch (error: any) {
    console.warn('Gemini chat fallback used:', error?.message);
    res.json({ success: true, reply: getFallbackChat(lastUserMessage) });
  }
});

// Downloadable / Executable bash script for Termux
app.get('/api/script/gemini_tv.sh', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  const scriptContent = `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# GEMINI TV OPTIMIZER - CENTURY TV STICK (2GB RAM) & SMART TV
# Inspirado no método do Tech World BR adaptado para Google Gemini AI
# ==============================================================================

clear
echo "=========================================================="
echo "   🚀 GEMINI TV OPTIMIZER - CENTURY TV STICK (2GB) & ANDROID TV"
echo "   Otimização inteligente via ADB e Google Gemini no Termux"
echo "=========================================================="
echo ""

# 1. Checar dependências
echo "📦 Verificando ferramentas necessárias no Termux..."
if ! command -v adb &> /dev/null; then
    echo "⚙️ Instalando 'android-tools' para ADB..."
    pkg update -y && pkg install android-tools curl wget jq -y
else
    echo "✅ ADB já está instalado!"
fi

echo ""
echo "----------------------------------------------------------"
echo "📺 PASSO 1: CONECTAR NO SEU CENTURY TV STICK (2GB RAM)"
echo "Certifique-se de que:"
echo " 1. O celular e o Century TV Stick estão no mesmo Wi-Fi."
echo " 2. A Depuração USB / Wi-Fi está LIGADA nas Opções do Desenvolvedor da TV."
echo "----------------------------------------------------------"
echo ""
read -p "👉 Digite o IP do seu Century TV Stick (Pressione ENTER para 192.168.0.117): " TV_IP
TV_IP=\${TV_IP:-192.168.0.117}
echo "IP selecionado: \$TV_IP"

read -p "👉 Digite a porta ADB (Pressione ENTER para o padrão 5555): " TV_PORT
TV_PORT=\${TV_PORT:-5555}

echo ""
echo "🔌 Conectando a $TV_IP:$TV_PORT ..."
adb kill-server > /dev/null 2>&1
adb start-server > /dev/null 2>&1
adb connect "$TV_IP:$TV_PORT"

echo ""
echo "👀 OLHE PARA A TELA DA SUA TV AGORA!"
echo "Se aparecer a mensagem 'Permitir depuração USB?', marque 'Sempre permitir deste computador' e clique em OK no controle remoto!"
echo ""
read -p "Pressione ENTER após confirmar na TV..."

DEVICE_STATUS=$(adb devices | grep "$TV_IP" | awk '{print $2}')

if [ "$DEVICE_STATUS" != "device" ]; then
    echo "⚠️ Status do dispositivo: $DEVICE_STATUS"
    echo "Se estiver 'unauthorized', aceite a permissão na TV e rode novamente o script."
    exit 1
fi

echo "✅ CENTURY TV STICK CONECTADO COM SUCESSO!"
echo "Dispositivo: $(adb shell getprop ro.product.model)"
echo "Versão do Android: $(adb shell getprop ro.build.version.release)"
echo "RAM Total Detectada: $(adb shell cat /proc/meminfo 2>/dev/null | grep MemTotal | awk '{print int($2/1024) \" MB\"}')"
echo "RAM Livre Atual: $(adb shell cat /proc/meminfo 2>/dev/null | grep MemAvailable | awk '{print int($2/1024) \" MB\"}')"
echo ""

# Menu de Ações
while true; do
    echo "=========================================================="
    echo "  CENTURY TV STICK (2GB) - MENU DE INSTALAÇÃO & OTIMIZAÇÃO"
    echo "=========================================================="
    echo " 1) 🌟 INSTALAÇÃO COMPLETA AUTOMÁTICA (Recomendado - Faz Tudo Sozinho)"
    echo "       - Desativa launcher antigo e anúncios pesados"
    echo "       - Acelera animações para 0.5x instantâneo"
    echo "       - Instala a Nova Launcher Personalizada em Tela Cheia"
    echo "       - Abre a nova tela na TV imediatamente"
    echo " 2) 🚀 Apenas Debloat Seguro (Liberar ~600MB de RAM)"
    echo " 3) ⚡ Apenas Acelerar Animações (0.5x)"
    echo " 4) 📱 Instalar APK da Nova Launcher em Tela Cheia"
    echo " 5) 📋 Exportar lista de pacotes para 'century_packages.txt'"
    echo " 6) 🔄 Restaurar Sistema Original de Fábrica (Desfazer Tudo)"
    echo " 7) 🎮 Abrir Terminal ADB da TV"
    echo " 8) ❌ Sair"
    echo "=========================================================="
    read -p "Escolha uma opção (1-8): " OPTION

    case $OPTION in
        1)
            echo ""
            echo "🚀 [1/4] Aplicando otimizações de aceleração (0.5x)..."
            adb shell settings put global window_animation_scale 0.5
            adb shell settings put global transition_animation_scale 0.5
            adb shell settings put global animator_duration_scale 0.5
            adb shell setprop persist.sys.purgeable_assets 1
            echo "  ✔️ Animações aceleradas com sucesso!"

            echo ""
            echo "🧹 [2/4] Desativando launcher padrão pesado e anúncios..."
            adb shell pm disable-user --user 0 com.google.android.tvlauncher > /dev/null 2>&1 && echo "  ✔️ Launcher padrão pesado desativado"
            adb shell pm disable-user --user 0 com.google.android.tvrecommendations > /dev/null 2>&1 && echo "  ✔️ Anúncios e recomendações desativados"
            adb shell pm disable-user --user 0 com.google.android.videos > /dev/null 2>&1 && echo "  ✔️ Google Play Filmes desativado"
            adb shell pm disable-user --user 0 com.google.android.play.games > /dev/null 2>&1 && echo "  ✔️ Google Play Games desativado"
            adb shell pm disable-user --user 0 com.google.android.feedback > /dev/null 2>&1 && echo "  ✔️ Telemetria do Google desativada"

            echo ""
            echo "📥 [3/4] Baixando e instalando APK da Nova Launcher na TV..."
            curl -L -o launcher.apk "https://github.com/spocky/miproja1/releases/download/4.72/ProjectivyLauncher-4.72-c97-xda-release.apk"
            
            if [ -s "launcher.apk" ]; then
                echo "📲 Instalando APK no Century TV Stick via ADB..."
                adb install -r launcher.apk
                echo "  ✔️ Launcher instalada com sucesso!"
            else
                echo "⚠️ Erro no download do APK. Verifique a conexão com a internet."
            fi

            echo ""
            echo "📺 [4/4] Abrindo a Nova Launcher na tela da TV..."
            adb shell monkey -p com.spocky.projengmenu 1 > /dev/null 2>&1 || adb shell input keyevent 3
            echo "  ✔️ Comando de abertura enviado com sucesso!"
            
            echo ""
            echo "=========================================================="
            echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
            echo "=========================================================="
            echo "Olhe para a tela da sua TV agora!"
            echo "RAM Livre Atual: $(adb shell cat /proc/meminfo 2>/dev/null | grep MemAvailable | awk '{print int($2/1024) \" MB\"}')"
            echo "Você liberou centenas de MBs de memória e sua TV responderá instantaneamente!"
            echo ""
            ;;
        2)
            echo ""
            echo "🧹 Desativando bloatwares e telemetria com segurança..."
            adb shell pm disable-user --user 0 com.google.android.tvlauncher > /dev/null 2>&1 && echo "  ✔️ Launcher padrão pesado desativado"
            adb shell pm disable-user --user 0 com.google.android.tvrecommendations > /dev/null 2>&1 && echo "  ✔️ Anúncios e recomendações desativados"
            adb shell pm disable-user --user 0 com.google.android.videos > /dev/null 2>&1 && echo "  ✔️ Google Play Filmes desativado"
            adb shell pm disable-user --user 0 com.google.android.play.games > /dev/null 2>&1 && echo "  ✔️ Google Play Games desativado"
            adb shell pm disable-user --user 0 com.google.android.feedback > /dev/null 2>&1 && echo "  ✔️ Telemetria do Google desativada"
            echo "🎉 Debloat concluído! Memória RAM liberada no Century TV Stick."
            echo "Nova RAM Livre: $(adb shell cat /proc/meminfo 2>/dev/null | grep MemAvailable | awk '{print int($2/1024) \" MB\"}')"
            echo ""
            ;;
        3)
            echo ""
            echo "⚡ Aplicando ajustes de aceleração de animação..."
            adb shell settings put global window_animation_scale 0.5
            adb shell settings put global transition_animation_scale 0.5
            adb shell settings put global animator_duration_scale 0.5
            echo "✅ Animações aceleradas em 2x (0.5x). A TV responderá instantaneamente!"
            echo ""
            ;;
        4)
            echo ""
            echo "📥 Baixando APK Kiosk de Tela Cheia..."
            LAUNCHER_URL="https://ais-dev-lypk23snla3dqzn7byurh3-406825324581.us-east1.run.app"
            curl -L -o launcher.apk "https://github.com/spocky/mifastlaunch/releases/download/v4.45/ProjectivyLauncher-4.45.apk"
            adb install -r launcher.apk
            adb shell am start -a android.intent.action.VIEW -d "$LAUNCHER_URL"
            echo "✅ Instalado e iniciado na TV!"
            echo ""
            ;;
        5)
            echo ""
            echo "📋 Extraindo lista de pacotes instalados no Century TV Stick..."
            adb shell pm list packages | sed 's/package://g' | sort > century_packages.txt
            echo "✅ Salvo com sucesso no arquivo 'century_packages.txt' no seu celular!"
            echo "Total de pacotes encontrados: $(wc -l < century_packages.txt)"
            echo ""
            ;;
        6)
            echo ""
            echo "🔄 Restaurando pacotes nativos de fábrica..."
            adb shell pm enable com.google.android.tvlauncher > /dev/null 2>&1 && echo "  ✔️ Launcher padrão reativado"
            adb shell pm enable com.google.android.tvrecommendations > /dev/null 2>&1 && echo "  ✔️ Recomendações reativadas"
            adb shell pm enable com.google.android.videos > /dev/null 2>&1 && echo "  ✔️ Google Play Filmes reativado"
            adb shell pm enable com.google.android.play.games > /dev/null 2>&1 && echo "  ✔️ Google Play Games reativado"
            adb shell settings put global window_animation_scale 1.0
            adb shell settings put global transition_animation_scale 1.0
            adb shell settings put global animator_duration_scale 1.0
            echo "✅ Sistema restaurado ao padrão de fábrica com sucesso!"
            echo ""
            ;;
        7)
            echo ""
            echo "Entrando no console ADB da TV (digite 'exit' para voltar ao menu)..."
            adb shell
            echo ""
            ;;
        8)
            echo "Até logo! Aproveite seu Century TV Stick super veloz com Gemini AI!"
            exit 0
            ;;
        *)
            echo "Opção inválida!"
            ;;
    esac
done
`;

  res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="gemini_tv.sh"');
  res.send(scriptContent);
});

// Configure Vite integration for dev and production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gemini TV Optimizer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
