"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Compass, 
  AlertCircle,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import VoiceInputButton from "@/components/VoiceInputButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PlannerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanContext?: any;
}

const QUICK_SUGGESTIONS = [
  "اقترحلي خروجة رايقة النهاردة في الزمالك ☕",
  "إزاي أروح المتحف المصري الكبير بالمترو؟ 🚇",
  "خروجة عائلية بميزانية متوسطة في المعادي 🌳",
  "أفضل أماكن تصوير وفوتوسيشن في وسط البلد 📸",
];

export default function PlannerChatModal({
  isOpen,
  onClose,
  currentPlanContext,
}: PlannerChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "أهلاً بك يا فندم! 👋 أنا دليلك الذكي في القاهرة ومصر معتمد على Google Gemini. اسألني عن أي خروجة، أفضل المطاعم، معالم أثرية، أو كيفية التنقل بالمترو والمواصلات لأي مكان، وأنا في خدمتك!",
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        textareaRef.current?.focus();
      }, 200);
    }
  }, [isOpen, messages]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: currentPlanContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر الحصول على رد من الذكاء الاصطناعي");
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "عذراً، لم أستطع الرد.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMsg(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      {/* Modal Container */}
      <div 
        className="w-full h-full sm:max-w-4xl sm:h-[88vh] sm:rounded-3xl bg-[var(--color-bg,#0f172a)] border border-[var(--border-glass,rgba(255,255,255,0.1))] shadow-2xl flex flex-col overflow-hidden text-[var(--color-fg,#f8fafc)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-glass,rgba(255,255,255,0.1))] bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-[var(--color-fg)]">
                  شات دليل القاهرة الذكي
                </h2>
                <span className="text-[11px] bg-blue-500/15 text-blue-500 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Google Gemini
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)]">
                اسأل بحرية عن أي مكان، أسعار، خروجة متكاملة، أو خطوط المترو والمواصلات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-planner/chat"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              title="الانتقال لصفحة الشات المنفصلة"
            >
              <Maximize2 className="w-4 h-4" />
              <span>صفحة مستقلة</span>
            </Link>

            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                title="مسح سجل المحادثة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-fg)] hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="إغلاق الشات"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm sm:text-base scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm ${
                    isUser
                      ? "bg-slate-700 shadow-sm"
                      : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 shadow-md"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 relative group text-sm leading-relaxed break-words ${
                    isUser
                      ? "bg-[var(--color-primary,#2563eb)] text-white rounded-br-xs shadow-md"
                      : "bg-[var(--bg-glass-card,rgba(255,255,255,0.05))] text-[var(--color-fg)] rounded-bl-xs border border-[var(--border-glass,rgba(255,255,255,0.1))] shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5 dark:border-white/10 text-[10px] opacity-70">
                    <span>{m.timestamp}</span>

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer font-medium"
                        title="نسخ"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shrink-0 text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[var(--bg-glass-card,rgba(255,255,255,0.05))] rounded-2xl rounded-bl-xs px-4 py-3 border border-[var(--border-glass,rgba(255,255,255,0.1))] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-[var(--text-secondary,#94a3b8)] mr-2 font-medium">
                  جاري التفكير وصياغة أفضل رد...
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-5 py-2.5 bg-black/10 border-t border-[var(--border-glass,rgba(255,255,255,0.1))] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs text-[var(--text-secondary,#94a3b8)] shrink-0 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              اقتراحات:
            </span>
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug)}
                disabled={isLoading}
                className="text-xs bg-[var(--bg-glass-card,rgba(255,255,255,0.06))] hover:bg-blue-500/15 hover:text-blue-400 border border-[var(--border-glass,rgba(255,255,255,0.1))] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-glass,rgba(255,255,255,0.1))] bg-black/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col gap-2.5 bg-[var(--bg-glass-card,rgba(255,255,255,0.04))] rounded-2xl border border-[var(--border-glass,rgba(255,255,255,0.1))] focus-within:border-blue-500/60 transition-all p-3"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب استفسارك هنا (مثلاً: اقترحلي خطة يوم في الزمالك، كافيهات هادية، أو مسار المترو)..."
              disabled={isLoading}
              className="w-full bg-transparent border-none resize-none text-sm text-[var(--color-fg)] placeholder:text-[var(--text-secondary,#94a3b8)] focus:outline-none"
              dir="auto"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-glass,rgba(255,255,255,0.08))]">
              <div className="flex items-center gap-2">
                <VoiceInputButton
                  onTranscript={(spokenText) => {
                    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                  }}
                />
                <span className="text-[11px] text-[var(--text-secondary,#94a3b8)] hidden sm:inline">
                  اضغط Enter للإرسال • Shift+Enter لسطر جديد
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95"
                    : "text-[var(--text-secondary,#94a3b8)] bg-white/5 cursor-not-allowed opacity-50"
                }`}
              >
                <span>إرسال</span>
                <Send className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
