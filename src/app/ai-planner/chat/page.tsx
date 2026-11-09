"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { 
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
  ArrowRight,
  Sun,
  Moon,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw
} from "lucide-react";

// Figma custom SVG icon
function FigmaIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 57" fill="currentColor">
      <path fill="#EA4C1D" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
      <path fill="#F24E1E" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/>
      <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
      <path fill="#1ABCFE" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
      <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
    </svg>
  );
}
import { cn } from "@/lib/utils";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-full border border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer text-xs shrink-0"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextDark);
      document.documentElement.classList.toggle("light", !nextDark);
      localStorage.setItem("dftry_theme", nextDark ? "dark" : "light");
      window.dispatchEvent(new CustomEvent("themechange", { detail: nextDark ? "dark" : "light" }));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const text = (customText || value).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setValue("");
    adjustHeight(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر الحصول على رد");

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "عذراً، لم أستطع تكوين رد.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${err.message || "حدث خطأ بالاتصال"}`,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full border-b border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-black/60 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-planner"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>AI Planner</span>
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">v0 Chat</span>
        </div>

        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1.5 text-neutral-500 hover:text-red-500 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="مسح المحادثة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            title="تبديل الثيم"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 justify-center">
        {/* Messages Stream */}
        {messages.length > 0 && (
          <div className="w-full space-y-6 mb-8 overflow-y-auto max-h-[60vh] pr-2">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 relative group text-sm sm:text-base leading-relaxed break-words",
                      isUser
                        ? "bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                        : "bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-800 dark:text-neutral-100"
                    )}
                    dir="auto"
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-400">
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Hero Title (Matches your original v0 prompt exactly) */}
        {messages.length === 0 && (
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-black dark:text-white">
              What can I help you ship?
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              أو اسأل دليلك الذكي عن أي مكان، مطعم، خروجة، أو خط سير مواصلات في مصر.
            </p>
          </div>
        )}

        {/* Exact v0 Input Container */}
        <div className="w-full">
          <div className="relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-md dark:shadow-2xl transition-all focus-within:border-neutral-400 dark:focus-within:border-neutral-700">
            <div className="overflow-y-auto">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask v0 or Cairo AI Planner a question..."
                className={cn(
                  "w-full px-4 py-3",
                  "resize-none",
                  "bg-transparent",
                  "border-none",
                  "text-black dark:text-white text-sm",
                  "focus:outline-none",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:text-sm",
                  "min-h-[60px]"
                )}
                style={{
                  overflow: "hidden",
                }}
                dir="auto"
              />
            </div>

            <div className="flex items-center justify-between p-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("خاصية إرفاق الصور والملفات ستتوفر قريباً!")}
                  className="group p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 text-neutral-600 dark:text-white" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden group-hover:inline transition-opacity">
                    Attach
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSend("اقترحلي خطة يوم كامل للتنقل وزيارة معالم في القاهرة")}
                  className="px-2 py-1 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 transition-colors border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-1 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  Project
                </button>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!value.trim() || isLoading}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm transition-all border flex items-center justify-center cursor-pointer",
                    value.trim() && !isLoading
                      ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm active:scale-95"
                      : "text-zinc-400 dark:text-zinc-500 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-zinc-700 cursor-not-allowed opacity-50"
                  )}
                >
                  <ArrowUpIcon
                    className={cn(
                      "w-4 h-4",
                      value.trim() && !isLoading
                        ? "text-white dark:text-black"
                        : "text-zinc-400 dark:text-zinc-500"
                    )}
                  />
                  <span className="sr-only">Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Row (Exact match to your layout & icons) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 flex-wrap">
            <ActionButton
              icon={<ImageIcon className="w-4 h-4" />}
              label="Clone a Screenshot"
              onClick={() => handleSend("ازاي اعمل تصميم واجهة مستخدم بنفس أسلوب v0 مع Next.js و Tailwind؟")}
            />
            <ActionButton
              icon={<FigmaIcon className="w-4 h-4" />}
              label="Import from Figma"
              onClick={() => handleSend("ازاي احول تصميم من فيجما إلى كود ريأكت نظيف؟")}
            />
            <ActionButton
              icon={<FileUp className="w-4 h-4" />}
              label="Upload a Project"
              onClick={() => handleSend("عايز ارفع مشروع جديد على Vercel أو Supabase، ايه الخطوات؟")}
            />
            <ActionButton
              icon={<MonitorIcon className="w-4 h-4" />}
              label="Landing Page"
              onClick={() => handleSend("اقترحلي أفكار وتوزيع سكاشن لصفحة هبوط Landing Page عصرية")}
            />
            <ActionButton
              icon={<CircleUserRound className="w-4 h-4" />}
              label="Sign Up Form"
              onClick={() => handleSend("اعملي كود صفحة تسجيل دخول Login و Sign Up بشكل مودرن")}
            />
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="py-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
        v0 Style Chatbot • Powered by Google Gemini
      </footer>
    </div>
  );
}
