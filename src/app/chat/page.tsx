"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  User as UserIcon,
  Mic,
  Paperclip,
  Square,
  Plus,
  ChevronLeft,
  Sparkles,
  FileText,
  MessageSquare,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SiteHeader } from "@/components/SiteHeader";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
}

const AI_RESPONSES = [
  "Resposta clara. Para a tornar ainda mais forte numa entrevista de direção, quantifique o resultado utilizando o método STAR (Situação, Tarefa, Ação, Resultado). Avançamos para o próximo desafio técnico?",
  "A analisar o resumo do seu perfil: a formulação atual é demasiado genérica. Considere destacar resultados quantificáveis e a sua principal especialização arquitetural. Quer uma sugestão de reformulação?",
  "Pergunta de cenário técnico: quando surgem compromissos de engenharia com prazos de lançamento apertados, que metodologia utiliza para definir prioridades entre dívida técnica e objetivos do negócio?",
  "Com base no seu CV, tem uma sólida experiência prática em desenvolvimento. Acrescentar metodologias de testes específicas e métricas de infraestrutura cloud melhoraria significativamente a sua pontuação ATS.",
  "Boa estrutura de resposta. O seu foco no alinhamento da equipa e no impacto mensurável demonstra maturidade de liderança. Quer praticar perguntas comportamentais ou técnicas?",
];

const SUGGESTIONS = [
  { icon: FileText,      label: "Analisar o meu CV",   text: "Quais são os maiores pontos fracos do meu CV?" },
  { icon: MessageSquare, label: "Reformular experiência",  text: "Reformule a minha experiência profissional mais recente" },
  { icon: Sparkles,      label: "Pergunta de entrevista",  text: "Gere uma pergunta de entrevista realista" },
  { icon: TrendingUp,    label: "Melhorar pontuação ATS",   text: "Como posso melhorar a minha pontuação ATS?" },
];

const PAST_CHATS = [
  { id: "1", label: "Feedback ao CV - jun. 2026" },
  { id: "2", label: "Prática de entrevista simulada" },
  { id: "3", label: "Análise de palavras-chave ATS" },
];

function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCVFile] = useState("CV_Engenheiro_Software.pdf");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const responseIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const desktopLayout = window.matchMedia("(min-width: 768px)");
    const syncSidebarWithViewport = () => setSidebarOpen(desktopLayout.matches);

    syncSidebarWithViewport();
    desktopLayout.addEventListener("change", syncSidebarWithViewport);
    return () => desktopLayout.removeEventListener("change", syncSidebarWithViewport);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim() || `Ficheiro anexado: ${selectedFile?.name}`,
      timestamp: getTimestamp(),
      attachment: selectedFile
        ? { name: selectedFile.name, type: selectedFile.type, url: URL.createObjectURL(selectedFile) }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setSelectedFile(null);
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setTimeout(() => {
      setIsTyping(false);
      const replyText = AI_RESPONSES[responseIndexRef.current % AI_RESPONSES.length];
      responseIndexRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "ai", text: replyText, timestamp: getTimestamp() },
      ]);
    }, 1100 + Math.random() * 500);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
    event.target.value = "";
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      window.alert("A gravação de áudio não é suportada neste navegador.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setSelectedFile(new File([blob], `voice-message-${Date.now()}.webm`, { type: blob.type }));
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      window.alert("É necessário permitir o acesso ao microfone para gravar áudio.");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  return (
    <div className="chat-page-enter portugal-atmosphere h-dvh min-h-0 bg-[#f4efe6] text-gray-900 flex flex-col overflow-hidden font-sans">
      <SiteHeader compact />

      {/* Chat controls */}
      <div className="chat-nav-enter sticky top-[66px] z-40 flex-shrink-0 h-[54px] border-b border-black/[0.08] bg-[#f4efe6]/75 backdrop-blur-md px-4 md:px-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
            aria-label={sidebarOpen ? "Fechar barra lateral" : "Abrir barra lateral"}
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5 md:hidden" aria-hidden="true" /> : <Menu className="w-5 h-5 md:hidden" aria-hidden="true" />}
            <ChevronLeft className={`hidden md:block w-4 h-4 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => { setMessages([]); responseIndexRef.current = 0; }}
            className="flex min-h-11 items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo chat
          </button>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] bg-white border border-black/[0.08] px-2.5 py-1.5 rounded-lg text-gray-700 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
            <Paperclip className="w-3 h-3 text-gray-500 shrink-0" />
            <span className="max-w-[180px] truncate font-medium">{activeCVFile}</span>
            <span className="text-green-600 font-bold text-xs">✓</span>
          </div>
      </div>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside
          id="chat-sidebar"
          aria-label="Conversas e atalhos"
          className={`absolute inset-y-0 left-0 z-30 flex w-[min(86vw,18rem)] flex-col border-r border-black/[0.08] bg-[#f4efe6] text-gray-900 shadow-xl transition-transform duration-300 overflow-hidden md:relative md:inset-auto md:z-auto md:flex-shrink-0 md:bg-[#f4efe6]/70 md:shadow-none md:transition-[width] ${sidebarOpen ? "translate-x-0 md:w-64" : "-translate-x-full md:w-0 md:border-r-0"}`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-1 min-w-[256px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 mb-2">Recentes</p>
            {PAST_CHATS.map((c) => (
              <button key={c.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-950 text-sm transition-colors cursor-pointer text-left">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                <span className="truncate">{c.label}</span>
              </button>
            ))}

            <div className="mt-4 border-t border-black/[0.06] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 mb-2">Início rápido</p>
              {SUGGESTIONS.map((s) => (
                <button key={s.label}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-950 text-sm transition-colors cursor-pointer text-left w-full">
                  <s.icon className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-black/[0.06] pt-4">
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 border border-black/[0.06] flex items-center justify-center shrink-0">
                  <UserIcon className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-950">Utilizador convidado</p>
                  <p className="text-[10px] text-gray-500">Plano gratuito</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Fechar barra lateral"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-20 bg-black/25 md:hidden"
          />
        )}

        {/* Main Chat Area */}
        <main className="min-w-0 flex-1 flex flex-col overflow-hidden bg-transparent">

          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto chat-scroll">
            {messages.length === 0 && !isTyping ? (
              /* Empty state */
              <div className="min-h-full flex flex-col items-center justify-center gap-6 sm:gap-7 px-4 sm:px-6 py-8 sm:py-12 max-w-[760px] mx-auto w-full">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-black/[0.08] flex items-center justify-center shadow-sm">
                    <Logo size={28} color="#0a0a0a" />
                  </div>
                  <h1 className="font-hero-title text-3xl sm:text-5xl font-black text-gray-950 leading-[1.08] text-balance">Assistente CVViews</h1>
                  <p className="font-serif-italic text-xl sm:text-2xl text-gray-900 max-w-lg leading-snug">
                    O seu orientador de CV e parceiro de preparação para entrevistas com IA.
                  </p>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                    Comece por carregar o seu CV ou fazer uma pergunta.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[620px]">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.text)}
                      className="group flex items-start gap-3 p-4 rounded-2xl border border-black/[0.08] bg-white/75 hover:border-black/[0.18] hover:bg-gray-50 transition-all text-left cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center shrink-0 transition-colors">
                        <s.icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} msg-enter`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.sender === "ai"
                        ? "bg-gray-100 border border-black/[0.08]"
                        : "bg-gray-900 border border-black"
                    }`}>
                      {msg.sender === "ai"
                        ? <Logo size={16} color="#0a0a0a" />
                        : <UserIcon className="w-3.5 h-3.5 text-white" />
                      }
                    </div>
                    {/* Bubble + timestamp */}
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === "user"
                          ? "bg-gray-950 text-white rounded-tr-sm"
                          : "bg-gray-50 border border-black/[0.07] text-gray-900 rounded-tl-sm"
                      }`}>
                        {msg.text}
                        {msg.attachment && (
                          msg.attachment.type.startsWith("audio/") ? (
                            <audio controls src={msg.attachment.url} className="mt-3 max-w-full" aria-label={msg.attachment.name} />
                          ) : (
                            <a
                              href={msg.attachment.url}
                              download={msg.attachment.name}
                              className="mt-3 flex items-center gap-2 underline underline-offset-2"
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{msg.attachment.name}</span>
                            </a>
                          )
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 msg-enter">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-black/[0.08] flex items-center justify-center shrink-0">
                      <Logo size={16} color="#0a0a0a" />
                    </div>
                    <div className="bg-gray-50 border border-black/[0.07] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="flex-shrink-0 border-t border-black/[0.07] bg-[#f4efe6]/90 px-3 sm:px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:py-4 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-end gap-2 bg-white/65 border border-black/[0.08] rounded-2xl px-3 py-3 backdrop-blur-[1px] focus-within:border-gray-400 focus-within:bg-white/85 focus-within:shadow-md transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,image/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  aria-label="Anexar ficheiro"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-black/[0.06] flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                  <Paperclip className="w-4 h-4" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Pergunte qualquer coisa sobre o seu CV ou pratique uma resposta de entrevista..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-950 placeholder-gray-400 outline-none resize-none max-h-36 py-0.5 leading-relaxed"
                />

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    aria-label={isRecording ? "Parar gravação" : "Gravar áudio"}
                    onClick={toggleRecording}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isRecording ? "bg-red-50 text-red-600" : "hover:bg-black/[0.06] text-gray-400 hover:text-gray-700"
                    }`}>
                    {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleSend()}
                    aria-label="Enviar"
                    disabled={!input.trim() && !selectedFile}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      input.trim() || selectedFile
                        ? "bg-gray-950 hover:bg-gray-800 text-white shadow-sm"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between gap-3 mt-2 px-3 py-2 rounded-lg bg-gray-50 border border-black/[0.07] text-xs text-gray-600">
                  <span className="truncate">Anexado: {selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer" aria-label="Remover anexo">×</button>
                </div>
              )}
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Enter para enviar · Shift+Enter para uma nova linha
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
