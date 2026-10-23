"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  RefreshCw,
  Terminal,
  User,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import {
  CHAT_TOPICS,
  INITIAL_BOT_MESSAGE,
  findAnswer,
} from "@/data/chatbotKnowledge";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export default function InteractiveChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: INITIAL_BOT_MESSAGE,
      timestamp: getFormattedTime(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  function getFormattedTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Safely scroll message container to bottom without scrolling window
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * Simulate streaming typing effect for realistic responses
   */
  const streamBotReply = useCallback((fullText: string) => {
    setIsTyping(true);

    // Initial slight pause before typing starts
    setTimeout(() => {
      const messageId = "bot-" + Date.now();
      const timestamp = getFormattedTime();

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          sender: "bot",
          text: "",
          timestamp,
        },
      ]);
      setIsTyping(false);

      let currentLength = 0;
      const step = Math.max(1, Math.floor(fullText.length / 30));
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      typingTimerRef.current = setInterval(() => {
        currentLength += step;
        if (currentLength >= fullText.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, text: fullText } : m
            )
          );
        } else {
          const partial = fullText.slice(0, currentLength);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, text: partial } : m
            )
          );
        }
      }, 15);
    }, 280);
  }, []);

  /**
   * Handle user submitting a question
   */
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");

    const answer = findAnswer(text);
    streamBotReply(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setMessages([
      {
        id: "initial-" + Date.now(),
        sender: "bot",
        text: INITIAL_BOT_MESSAGE,
        timestamp: getFormattedTime(),
      },
    ]);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl glass-liquid shadow-2xl transition-all duration-300 flex flex-col h-[520px] overflow-hidden select-none border border-black/[0.06] dark:border-white/[0.08]">
      {/* ---------------- CARD HEADER ---------------- */}
      <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-[var(--ink)]">
                Trợ lý Kỹ thuật & Hồ sơ
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Hỏi đáp trực tiếp về năng lực backend của Minh
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="p-2 rounded-xl glass-liquid-subtle hover:bg-white/80 dark:hover:bg-slate-800/80 text-[var(--muted)] hover:text-[var(--ink)] transition-colors active:scale-95"
          title="Làm mới cuộc trò chuyện"
          aria-label="Làm mới trò chuyện"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ---------------- MESSAGE LIST ---------------- */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/20"
                  : "bg-white/85 dark:bg-slate-800/85 text-[var(--ink)] rounded-tl-none border border-black/[0.04] dark:border-white/[0.08] shadow-xs"
              }`}
            >
              {msg.text}

              {/* Copy button for bot response */}
              {msg.sender === "bot" && msg.text && (
                <button
                  onClick={() => copyText(msg.id, msg.text)}
                  className="absolute -right-7 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 text-[var(--muted)] hover:text-[var(--ink)] transition-all hover:scale-105"
                  title="Sao chép câu trả lời"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            <span className="text-[10px] text-[var(--muted)] mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-black/[0.04] dark:border-white/[0.08] w-fit rounded-tl-none">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>

      {/* ---------------- QUICK PROMPT PILLS ---------------- */}
      <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.06] bg-white/20 dark:bg-slate-900/20">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CHAT_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSend(topic.label)}
              disabled={isTyping}
              className="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium glass-liquid-subtle hover:bg-white/90 dark:hover:bg-slate-800/90 text-[var(--ink)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- INPUT BAR ---------------- */}
      <div className="p-3 sm:p-4 border-t border-black/[0.05] dark:border-white/[0.08] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về kỹ năng, CSDL, xử lý lỗi..."
            disabled={isTyping}
            className="w-full pl-4 pr-11 py-2.5 rounded-2xl text-xs sm:text-sm bg-white/80 dark:bg-slate-800/80 border border-black/[0.08] dark:border-white/[0.1] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-sm"
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
