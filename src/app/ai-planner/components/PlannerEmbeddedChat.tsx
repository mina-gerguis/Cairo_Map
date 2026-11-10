"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import VoiceInputButton from "@/components/VoiceInputButton";

export interface PlannerChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PlannerEmbeddedChatProps {
  planContext?: {
    startingZone?: string;
    placesCount?: number;
    selectedPlaces?: Array<{ name: string; category?: string }>;
    budget?: number;
    hours?: number;
  };
  onApplySuggestion?: (promptText: string) => void;
}

const QUICK_PROMPTS = [
  "اقترحلي كافيه هادي للمذاكرة في مصر الجديدة ☕",
  "خروجة رومانسية على النيل بميزانية 800 جنيه ❤️",
  "أماكن ألعاب وملاهي للأطفال في التجمع 🎠",
  "إزاي أروح برج القاهرة والمتحف بالمترو؟ 🚇",
];

export default function PlannerEmbeddedChat({
  planContext,
  onApplySuggestion,
}: PlannerEmbeddedChatProps) {
  const [messages, setMessages] = useState<PlannerChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "أهلاً بك! أنا مساعد القاهرة الذكي المعتمد على Google Gemini 🤖. اكتب لي أي استفسار عن خطط الخروجات، كافيهات، مطاعم، أو تفاصيل الانتقال بالمواصلات، أو اسألني لأقترح لك خطة متكاملة لليوم!",
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMsg: PlannerChatMessage = {
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
          context: planContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر الحصول على رد من الذكاء الاصطناعي");
      }

      const botMsg: PlannerChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "عذراً، لم أستطع تكوين رد.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setIsLoading(false);
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
    <div className="planner-embedded-chat w-full rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass-card)] backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[var(--border-glass)] bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[var(--color-fg)] flex items-center gap-1.5">
                شات مساعد القاهرة الذكي
              </h3>
              <span className="text-[10px] bg-blue-500/15 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              اطرح أسئلتك بحرية أو اطلب اقتراحات خاصة بخطتك
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Link to Fullscreen chat */}
          <Link
            href="/ai-planner/chat"
            className="p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 font-medium"
            title="فتح الشات في شاشة كاملة"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">شاشة كاملة</span>
          </Link>

          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="مسح سجل المحادثة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-fg)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? "طي المحادثة" : "توسيع المحادثة"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <>
          {/* Quick suggestions pills */}
          <div className="px-3 py-2 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-glass)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-[var(--text-secondary)] shrink-0 font-medium flex items-center gap-1">
              💡 اقتراحات:
            </span>
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-glass-card)] hover:bg-blue-500/10 hover:text-blue-500 border border-[var(--border-glass)] text-[var(--color-fg)] shrink-0 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="p-3 sm:p-4 space-y-3.5 overflow-y-auto max-h-[360px] min-h-[180px] text-sm scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                      isUser
                        ? "bg-slate-700"
                        : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 relative group text-xs sm:text-sm leading-relaxed break-words ${
                      isUser
                        ? "bg-[var(--color-primary)] text-white rounded-br-xs"
                        : "bg-[var(--bg-secondary,rgba(255,255,255,0.06))] text-[var(--color-fg)] rounded-bl-xs border border-[var(--border-glass)] shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/10 text-[10px] opacity-70">
                      <span>{m.timestamp}</span>

                      {!isUser && (
                        <div className="flex items-center gap-2">
                          {onApplySuggestion && (
                            <button
                              type="button"
                              onClick={() => onApplySuggestion(m.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-400 flex items-center gap-1 cursor-pointer font-medium"
                              title="تطبيق كمقترح لجدول الرحلة"
                            >
                              <span>استخدم في الخطة ✨</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
                            title="نسخ"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">تم</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[var(--bg-secondary,rgba(255,255,255,0.06))] rounded-2xl rounded-bl-xs px-3.5 py-2.5 border border-[var(--border-glass)] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-[var(--text-secondary)] mr-2">جاري التفكير والتجهيز...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Field Form */}
          <div className="p-3 border-t border-[var(--border-glass)] bg-black/[0.02] dark:bg-white/[0.02]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex flex-col gap-2 bg-[var(--bg-glass-card)] rounded-xl border border-[var(--border-glass)] focus-within:border-blue-500/50 transition-colors p-2"
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسأل Gemini عن أي خروجة، مطعم، أسعار أو وسائل مواصلات..."
                disabled={isLoading}
                className="w-full bg-transparent border-none resize-none text-xs sm:text-sm text-[var(--color-fg)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                dir="auto"
              />

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-glass)]">
                <div className="flex items-center gap-1.5">
                  <VoiceInputButton
                    onTranscript={(spokenText) => {
                      setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
                    }}
                  />
                  <span className="text-[10px] text-[var(--text-secondary)] hidden sm:inline">
                    Enter للإرسال • Shift+Enter لسطر جديد
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    input.trim() && !isLoading
                      ? "bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm"
                      : "text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <span>إرسال</span>
                  <Send className="w-3 h-3 -rotate-90" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
