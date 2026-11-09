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
  CornerDownLeft,
  Compass,
  MessageSquare,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  "اقترحلي خروجة رايقة النهاردة في الزمالك ☕",
  "إزاي أروح المتحف المصري الكبير بالمترو؟ 🚇",
  "خروجة عائلية بميزانية متوسطة في المعادي 🌳",
  "أفضل أماكن تصوير وفوتوسيشن في وسط البلد 📸",
];

interface AiChatDrawerProps {
  currentPlanContext?: any;
}

export default function AiChatDrawer({ currentPlanContext }: AiChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "أهلاً بك يا فندم! 👋 أنا دليلك الذكي في القاهرة ومصر. اسألني عن أي خروجة، أفضل المطاعم، معالم أثرية، أو كيفية التنقل بالمترو والمواصلات لأي مكان، وأنا في خدمتك!",
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, messages]);

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
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
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

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ في الاتصال");
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
    if (confirm("هل تريد مسح سجل المحادثة؟")) {
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: "تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setErrorMsg(null);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="مساعد القاهرة الذكي"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group font-medium border border-white/20"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide">دردشة مع الـ AI</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* Chat Panel / Modal */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-full sm:w-[460px] bg-slate-900 border-r border-slate-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                دليل القاهرة الذكي
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Gemini
                </span>
              </h3>
              <p className="text-xs text-slate-400">مساعدك الذكي للتخطيط والمواصلات والخروجات</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="مسح المحادثة"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isUser
                      ? "bg-slate-700"
                      : "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-sm"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 relative group ${
                    isUser
                      ? "bg-amber-600 text-white rounded-br-xs"
                      : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/70"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words text-sm">
                    {m.content}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                        title="نسخ الرد"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
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

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0 text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-bl-xs px-4 py-3 border border-slate-700/70 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-400 mr-2">جاري التفكير وكتابة الرد...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{errorMsg}</p>
                <p className="mt-1 text-[11px] text-red-300/80">
                  تأكد من وضع المفتاح المجاني GEMINI_API_KEY داخل ملف .env.local
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40">
            <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> اقتراحات سريعة:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-right"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative bg-neutral-900 rounded-xl border border-neutral-800 focus-within:border-neutral-700 transition-colors p-2"
          >
            <textarea
              ref={inputRef as any}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب استفسارك هنا..."
              disabled={isLoading}
              className="w-full bg-transparent border-none resize-none text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
              <span className="text-[10px] text-neutral-500">Enter للإرسال</span>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center ${
                  input.trim() && !isLoading
                    ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                    : "text-neutral-500 bg-neutral-800 cursor-not-allowed opacity-50"
                }`}
                title="إرسال"
              >
                <Send className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
