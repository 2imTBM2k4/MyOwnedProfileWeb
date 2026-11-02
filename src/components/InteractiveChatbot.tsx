"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  RefreshCw,
  Bot,
  Copy,
  Check,
  X,
  MessageSquare,
  ChevronDown,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  INITIAL_BOT_MESSAGE,
  findAnswer,
  type QuickAction,
} from "@/data/chatbotKnowledge";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  quickActions?: QuickAction[];
}

export default function InteractiveChatbot() {
  const [isOpen, setIsOpen] = useState(false);
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
  const widgetRef = useRef<HTMLDivElement>(null);

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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Safely scroll message container to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  /**
   * Simulate streaming typing effect for realistic responses
   */
  const streamBotReply = useCallback((fullText: string, actions?: QuickAction[]) => {
    setIsTyping(true);

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
      const step = Math.max(1, Math.floor(fullText.length / 28));
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      typingTimerRef.current = setInterval(() => {
        currentLength += step;
        if (currentLength >= fullText.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, text: fullText, quickActions: actions } : m
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
      }, 16);
    }, 240);
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
    streamBotReply(answer.text, answer.quickActions);
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
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none font-sans"
    >
      {/* ---------------- CHAT WINDOW MODAL ---------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý AI bming"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[420px] h-[520px] max-h-[82vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
          style={{
            boxShadow:
              "0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--line)",
          }}
        >
          {/* Card Header */}
          <div className="px-4 py-3.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--tile)]/60">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--text)]">
                    bming Assistant
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-mono font-medium">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  Hỏi đáp trực tiếp về năng lực & hồ sơ của Minh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-xl hover:bg-[var(--tile)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới trò chuyện"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--tile)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                title="Thu nhỏ"
                aria-label="Đóng khung chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages List - Hidden Scrollbar */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5 scroll-smooth text-xs sm:text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-[var(--accent)] text-[var(--bg)] font-medium rounded-tr-xs"
                      : "bg-[var(--tile)] text-[var(--text)] rounded-tl-xs border border-[var(--line)]"
                  }`}
                >
                  {msg.text}

                  {/* Quick actions for personal info (GitHub, LinkedIn, Mail) */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--line)] flex-wrap">
                      {msg.quickActions.map((action) => (
                        <a
                          key={action.label}
                          href={action.url}
                          target={action.type === "mail" ? undefined : "_blank"}
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--text)] transition-all hover:scale-105 active:scale-95 shadow-2xs"
                        >
                          {action.type === "github" && (
                            <Github className="w-3.5 h-3.5 text-[var(--text)]" />
                          )}
                          {action.type === "linkedin" && (
                            <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
                          )}
                          {action.type === "mail" && (
                            <Mail className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span>{action.label}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--muted)] opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Copy button for bot response */}
                  {msg.sender === "bot" && msg.text && (
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="absolute -right-7 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] transition-all hover:scale-105"
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
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[var(--tile)] border border-[var(--line)] w-fit rounded-tl-xs">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60 animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[var(--line)] bg-[var(--surface)]">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isTyping}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-[var(--bg)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 p-1.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] disabled:opacity-30 hover:opacity-90 transition-all shadow-2xs font-semibold"
                aria-label="Gửi câu hỏi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- LAUNCHER BUTTON ---------------- */}
      <div className="relative flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-[var(--line)] ${
            isOpen
              ? "w-12 h-12 bg-[var(--surface)] text-[var(--text)]"
              : "w-14 h-14 bg-[var(--surface)] text-[var(--accent)] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
          }`}
          aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot hỗ trợ"}
          title={isOpen ? "Đóng chatbot" : "Trò chuyện cùng bming Assistant"}
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent)] border-2 border-[var(--surface)]" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
