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
} from "lucide-react";
import { Logo, BrandLogo } from "@/components/ui/Logo";

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
  "Clear response. To make it even stronger in an executive interview, quantify the outcome using the STAR framework (Situation, Task, Action, Result). Shall we proceed to the next technical challenge?",
  "Reviewing your profile summary: the current phrasing is too generic. Consider highlighting quantifiable outcomes and your primary architectural specialization. Would you like a suggested revision?",
  "Technical scenario question: When engineering tradeoffs arise under tight release deadlines, what methodology do you use to prioritize technical debt against business deliverables?",
  "Based on your resume, you have strong hands-on development experience. Adding specific testing methodologies and cloud infrastructure metrics would significantly improve your ATS ranking score.",
  "Solid answer structure. Your focus on team alignment and measurable impact demonstrates strong leadership maturity. Would you like to practice behavioral or technical questions next?",
];

const SUGGESTIONS = [
  { icon: FileText,      label: "Analyze my resume",   text: "What are the biggest weaknesses in my resume?" },
  { icon: MessageSquare, label: "Rewrite experience",  text: "Rewrite my most recent job experience" },
  { icon: Sparkles,      label: "Interview question",  text: "Generate a realistic interview question" },
  { icon: TrendingUp,    label: "Improve ATS score",   text: "How can I improve my ATS score?" },
];

const PAST_CHATS = [
  { id: "1", label: "Resume feedback - Jun 2026" },
  { id: "2", label: "Mock interview practice" },
  { id: "3", label: "ATS keyword analysis" },
];

function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCVFile] = useState("Software_Engineer_Resume.pdf");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const responseIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim() || `Attached file: ${selectedFile?.name}`,
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
      window.alert("Audio recording is not supported in this browser.");
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
      window.alert("Microphone access is required to record audio.");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  return (
    <div className="chat-page-enter h-screen bg-[#f4efe6] text-gray-900 flex flex-col overflow-hidden font-sans">
      {/* Top Nav */}
      <nav className="chat-nav-enter sticky top-0 z-50 flex-shrink-0 h-[66px] border-b border-black/[0.08] bg-[#f4efe6]/80 backdrop-blur-[2px] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="flex h-full w-full items-center gap-3 px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" aria-label="CVViews Home" className="flex items-center gap-2.5 shrink-0">
              <BrandLogo size={25} textColor="text-gray-950" iconColor="#111111" />
            </Link>
          </div>

          <div className="h-5 w-px bg-black/10" />

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>

          <button
            onClick={() => { setMessages([]); responseIndexRef.current = 0; }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New chat
          </button>

          <div className="hidden lg:flex items-center gap-6 ml-5">
            <Link href="/#pricing" className="text-xs font-medium text-gray-500 hover:text-gray-950 transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="text-xs font-medium text-gray-500 hover:text-gray-950 transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="text-xs font-medium text-gray-500 hover:text-gray-950 transition-colors">
              About
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-white border border-black/[0.08] px-2.5 py-1.5 rounded-lg text-gray-700 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <Paperclip className="w-3 h-3 text-gray-500 shrink-0" />
              <span className="max-w-[180px] truncate font-medium">{activeCVFile}</span>
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <Link
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.open("/login", "_blank", "noopener,noreferrer");
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 text-gray-700 hover:text-gray-950 transition-colors cursor-pointer border border-black/[0.12] rounded-lg hover:bg-gray-100/80 inline-flex items-center"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.open("/signup", "_blank", "noopener,noreferrer");
                }
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-white transition-all cursor-pointer inline-flex items-center"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 flex flex-col border-r border-black/[0.08] bg-[#f4efe6] text-gray-900 transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-64" : "w-0 border-r-0"}`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-1 min-w-[256px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 mb-2">Recent</p>
            {PAST_CHATS.map((c) => (
              <button key={c.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-950 text-sm transition-colors cursor-pointer text-left">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                <span className="truncate">{c.label}</span>
              </button>
            ))}

            <div className="mt-4 border-t border-black/[0.06] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 mb-2">Quick Start</p>
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
                  <p className="text-xs font-semibold text-gray-950">Guest User</p>
                  <p className="text-[10px] text-gray-500">Free plan</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-transparent">

          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto chat-scroll">
            {messages.length === 0 && !isTyping ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center gap-7 px-6 py-12 select-none max-w-[760px] mx-auto w-full">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-black/[0.08] flex items-center justify-center shadow-sm">
                    <Logo size={28} color="#0a0a0a" />
                  </div>
                  <h1 className="text-[38px] font-bold tracking-[-0.06em] text-gray-950 leading-none">CVViews Assistant</h1>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                    Your AI-powered resume coach and interview practice partner.
                    Start by uploading your resume or asking a question.
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
          <div className="flex-shrink-0 border-t border-black/[0.07] bg-[#f4efe6] px-4 py-4 backdrop-blur-[1px]">
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
                  aria-label="Attach file"
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
                  placeholder="Ask anything about your resume or practice an interview answer..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-950 placeholder-gray-400 outline-none resize-none max-h-36 py-0.5 leading-relaxed"
                />

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    aria-label={isRecording ? "Stop recording" : "Record audio"}
                    onClick={toggleRecording}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isRecording ? "bg-red-50 text-red-600" : "hover:bg-black/[0.06] text-gray-400 hover:text-gray-700"
                    }`}>
                    {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleSend()}
                    aria-label="Send"
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
                  <span className="truncate">Attached: {selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer" aria-label="Remove attachment">×</button>
                </div>
              )}
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
