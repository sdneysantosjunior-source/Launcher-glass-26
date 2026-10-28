# Custom Smart TV Launcher & Automação Termux (Century TV Stick 2GB)

Construção da **Custom Smart TV Launcher** idêntica ao vídeo e ao print fornecido pelo usuário (estilo *Neon Glass* com dock lateral, cartões vibrantes de streaming com arte de fundo e bordas luminosas), integrada ao instalador e automador via **Termux** no celular utilizando **Google Gemini AI** para realizar todas as tarefas no Century TV Stick (2GB RAM).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas com o Usuário:**
> 1. **Tipo de Launcher**: Aplicativo Android dedicado / Launcher Web em tela cheia com pacote APK e instalador via Termux.
> 2. **Nome de Usuário na Saudação**: Totalmente personalizável a qualquer momento pelo controle remoto (com modal na TV para definir o nome, ex: "Sidney", "Lucas", etc.).
> 3. **Serviços em Destaque**: Réplica fiel do print: **Netflix**, **Prime Video**, **YouTube**, **Disney+**, **Max**, **Globoplay**, com barra inferior para **Spotify**, **Apple TV**, **Paramount+**, **Crunchyroll** e botão **Todos os Apps**.
> 4. **Automação Estilo Claude**: O script do Termux realiza as etapas automaticamente sem que o usuário precise digitar comandos complexos manualmente.

---

## 1. Overview & Core Concept

- **O que é**: Uma Smart TV Launcher de última geração com estética *Cyber Neon Glass* inspirada na captura de tela do usuário e no vídeo do Tech World BR. Substitui os launchers lentos e cheios de anúncios por uma interface ultrarrápida (60 FPS), limpa e com acesso direto aos serviços de streaming e canais.
- **Público & Dispositivo**: Usuários do **Century TV Stick (2GB RAM)** que querem a experiência visual moderna do vídeo sem travamentos.
- **Diferencial Gemini vs. Claude**: Execução direta das regras de otimização de memória RAM para os 2GB do Century TV Stick, scripts prontos com tratamento de erros de permissão ADB e comandos 100% reversíveis.

---

## 2. User Experience & Visual Design (Fidelidade ao Print)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  19:32                                                                                                 │
│  Seg, 26 de Mai   Olá, [Nome do Usuário] ✏️                                       [🔍] [📶] [⚙️] [👤]  │
│                   O que vamos assistir hoje?                                                           │
│  ┌──────────┐     Filmes, séries, apps e muito mais em um só lugar.                                    │
│  │ 🏠 Início│                                                                                          │
│  │ 🎬 Filmes│     ┌────────────────────────────┐      ┌────────────────────────────┐                   │
│  │ 📺 Séries│     │ [POSTERS]                  │      │ [POSTERS]                  │                   │
│  │ 📱 Apps  │     │       NETFLIX              │      │       prime video          │                   │
│  │ 🎮 Jogos │     │ (Borda Neon Vermelha)      │      │ (Borda Neon Azul Elétrico) │                   │
│  │ 🎵 Música│     └────────────────────────────┘      └────────────────────────────┘                   │
│  │ ⚙️ Config│     ┌────────────────────────────┐      ┌────────────────────────────┐                   │
│  │ 🔍 Buscar│     │ [THUMBNAILS]               │      │ [POSTERS]                  │                   │
│  └──────────┘     │       YouTube              │      │       Disney+              │                   │
│                   │ (Borda Neon Coral)         │      │ (Borda Neon Ciano/Azul)    │                   │
│                   └────────────────────────────┘      └────────────────────────────┘                   │
│                   ┌────────────────────────────┐      ┌────────────────────────────┐                   │
│                   │ [POSTERS]                  │      │ [POSTERS]                  │                   │
│                   │         max                │      │       globoplay            │                   │
│                   │ (Borda Neon Roxo/Índigo)   │      │ (Borda Neon Dourado/Rubi)  │                   │
│                   └────────────────────────────┘      └────────────────────────────┘                   │
│                                                                                                        │
│                   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│                   │ Spotify  │ │ Apple TV │ │Paramount+│ │Crunchy.. │ │Todos Apps│                     │
│                   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Elementos Visuais Específicos:
1. **Dock Lateral Esquerda (Menu Flutuante em Vidro)**:
   - Relógio em tempo real (`19:32`) e data por extenso (`Seg, 26 de Mai`).
   - Ícones verticais com efeito *Liquid Glass*: `Início` (cápsula com brilho azul ativo), `Filmes`, `Séries`, `Apps`, `Jogos`, `Música`, `Config.` e `Pesquisar`.
   - Suporte completo a navegação via controle remoto (setas D-Pad cima/baixo e Enter/OK).

2. **Cabeçalho Superior com Saudação Personalizada**:
   - Saudação: *"Olá, [Nome]"* com botão de edição rápida (abre teclado/modal na tela para trocar o nome).
   - Título principal: *"O que vamos assistir hoje?"*.
   - Subtítulo: *"Filmes, séries, apps e muito mais em um só lugar."*.
   - Ícones de status no canto superior direito: Pesquisa, Indicador de Wi-Fi, Configurações e Avatar do Usuário.

3. **Grade Principal com 6 Banners Luminosos**:
   - **Netflix**: Borda neon vermelha vibrante (`#E50914`), posters de *Stranger Things*, *Round 6*, *Bridgerton* e logo centralizado.
   - **Prime Video**: Borda neon azul elétrico (`#00A8E1`), posters de *Fallout*, *The Boys*, *Rings of Power* e logo oficial.
   - **YouTube**: Borda neon coral/vermelha, thumbnails de tecnologia e automóveis, logo com botão play vermelho.
   - **Disney+**: Borda neon ciano estelar (`#113CCF`), posters de *The Mandalorian*, *Frozen*, *Marvel* e logo oficial.
   - **Max**: Borda neon púrpura/índigo (`#002BE7`), posters de *The Last of Us*, *Harry Potter*, *Duna* e logo oficial.
   - **Globoplay**: Borda neon dourada/laranja degradê, posters de novelas (*Vale Tudo*, *Renascer*) e *BBB*.

4. **Barra Inferior de Atalhos Rápidos**:
   - **Spotify** (verde neon + capa de álbum).
   - **Apple TV** (branco prateado + arte de *Silo*).
   - **Paramount+** (azul profundo).
   - **Crunchyroll** (laranja vibrante + anime).
   - **Todos os Apps** (botão com ícone de grade que abre gaveta de aplicativos instalados).

5. **Modo TV / D-Pad & Teclas de Atalho**:
   - Foco visual nítido com anel de luz expansivo ao selecionar itens pelo controle remoto.
   - Suporte para tela cheia nativa (Full Screen Kiosk).

---

## 3. Key Product Decisions & Trade-Offs

- **Arquitetura da Launcher**:
  - Implementaremos a interface diretamente no app em tela cheia com visual de TV 1080p/4K 16:9, além de gerar o **APK empacotado e o instalador ADB automatizado** para o Century TV Stick.
  - O script do Termux fará o download e a configuração do launcher como app padrão via serviço de inicialização ou WebView Kiosk no Century TV Stick.
- **Automação "Estilo Claude" com Gemini**:
  - Em vez de o usuário precisar digitar múltiplos comandos manuais, o script `gemini_tv.sh` no Termux detecta o Century TV Stick, roda o debloat dos aplicativos pesados, instala a nova launcher e aplica o modo de aceleração de 0.5x de forma 100% autônoma.
- **Segurança Absoluta do Controle Century**:
  - Bloqueio estrito para nunca desativar `com.android.bluetooth` ou os serviços de entrada do controle remoto da Century.

---

## 4. Technical Architecture & Termux Pipeline

```
┌─────────────────────────┐          Wi-Fi ADB          ┌───────────────────────────────────┐
│     Termux (Celular)    │ ──────────────────────────> │   Century TV Stick (2GB RAM)      │
│                         │                             │                                   │
│  1. gemini_tv.sh        │  pm disable-user --user 0   │  - Launcher antigo desativado     │
│  2. Detecção automática │ ──────────────────────────> │  - Anúncios Google TV removidos   │
│  3. Instalação Launcher │                             │  - Animações ajustadas em 0.5x    │
│  4. Gemini AI Analyzer  │  install custom_launcher    │  - Nova Launcher Neon Glass Ativa │
│                         │ ──────────────────────────> │  - 1.2 GB RAM Livres a 60 FPS      │
└─────────────────────────┘                             └───────────────────────────────────┘
```

### Componentes a Implementar no Código:
1. `src/components/CustomTvLauncher.tsx`: Réplica visual e funcional completa do print da launcher (com navegação por D-Pad, dock lateral, cartões neon com arte de fundo, seletor de perfil e gaveta de todos os apps).
2. `src/components/TermuxQuickStart.tsx`: Modo de automação direta de 1 toque (execução autônoma estilo Claude com Gemini).
3. `src/App.tsx`: Aba dedicada "Minha Nova Launcher (Print do Vídeo)" e botão para entrar no modo TV Fullscreen imediatamente.
4. `server.ts`: Endpoint do instalador autônomo e pacotes específicos do Century TV Stick.

---

## 5. Plano de Verificação

1. **Compilação**: `compile_applet` sem erros de TypeScript e Tailwind CSS.
2. **Navegação D-Pad**: Teste de navegação pelas setas do teclado e cliques do controle remoto.
3. **Personalização**: Verificação do modal de alteração de nome de perfil na TV.
4. **Resiliência do Script**: Verificação do script `gemini_tv.sh` executando automaticamente no Termux.
