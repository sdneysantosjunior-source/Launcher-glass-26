import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, Check, HelpCircle, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

export const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 Olá! Eu sou o seu **Copiloto Gemini AI** especializado em otimização de Smart TVs e automação no **Termux**.

Você pode me perguntar qualquer dúvida sobre comandos ADB, códigos de erro (como *device unauthorized* ou *connection refused*), como parear no Android 11+, ou tirar dúvidas sobre pacotes específicos da sua TV!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Como resolver erro "device unauthorized" no Termux?',
    'Como parear no Android 11/12 com código de 6 dígitos?',
    'O controle parou de abrir a tela inicial, como resolver?',
    'Como listar todos os apps e salvar em arquivo no Termux?',
    'Qual a vantagem do Gemini em relação ao Claude na TV?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Erro na resposta');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro momentâneo ao conectar com o Gemini AI. Verifique sua conexão e tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px] max-h-[80vh]">
      {/* Chat Header */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Copiloto Gemini AI
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Especialista em Android TV, Mi Stick, ADB e Termux no Celular
            </p>
          </div>
        </div>

        <div className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full font-semibold hidden sm:block">
          gemini-3.8-flash
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(m.content, m.id)}
                      className="flex items-center gap-1 hover:text-cyan-400 transition cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-950 border border-slate-800/80 p-3 rounded-2xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gemini pensando na melhor resposta...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Dúvidas:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg whitespace-nowrap border border-slate-700/60 transition cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao Gemini (ex: comando para forçar 60fps, erro ADB, etc.)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-2.5 rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
