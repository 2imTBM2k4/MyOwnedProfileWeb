"use client";

import { useState, useEffect, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
  locale?: "vi" | "en";
  layoutId?: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  targetEmail = "2004.tranbinhminh@gmail.com",
  locale = "vi",
  layoutId = "say-hi-contact-modal",
}: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const reducedMotion = useReducedMotion();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  const isEn = locale === "en";

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (status === "success") {
        setStatus("idle");
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim()) {
      setStatus("error");
      setErrorMessage(isEn ? "Please enter your name." : "Vui lòng nhập tên của bạn.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage(
        isEn
          ? "Please enter a valid email address so I can reply."
          : "Vui lòng nhập email hợp lệ để mình có thể phản hồi."
      );
      return;
    }

    if (!message.trim()) {
      setStatus("error");
      setErrorMessage(
        isEn ? "Please enter a message." : "Vui lòng nhập nội dung tin nhắn."
      );
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to send message." : "Gửi tin nhắn không thành công."));
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err.message ||
          (isEn
            ? "An error occurred. You can still email directly!"
            : "Có lỗi xảy ra khi gửi tin nhắn. Bạn có thể gửi mail trực tiếp!")
      );
    } finally {
      setLoading(false);
    }
  };

  const reveal = (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: reducedMotion
      ? { duration: 0 }
      : {
          opacity: { duration: 0.25, delay },
          y: { type: "spring", stiffness: 300, damping: 26, delay },
        },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contact-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <motion.div
            layoutId={reducedMotion ? undefined : layoutId}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl p-6 sm:p-8 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] shadow-2xl font-sans select-none transition-colors duration-300"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            transition={reducedMotion ? { duration: 0 } : {
              layout: { type: "spring", stiffness: 260, damping: 28, mass: 0.85 },
              opacity: { duration: 0.22 },
              scale: { type: "spring", stiffness: 260, damping: 28, mass: 0.85 },
              y: { type: "spring", stiffness: 260, damping: 28, mass: 0.85 },
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--line)",
            }}
          >
            {/* Modal Close Button */}
            <motion.button
              whileHover={reducedMotion ? undefined : { scale: 1.08, rotate: 90 }}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] bg-[var(--tile)] hover:bg-[var(--line)] border border-[var(--line)] transition-colors cursor-pointer"
              aria-label={isEn ? "Close modal" : "Đóng cửa sổ"}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Modal Header */}
            <motion.div {...reveal(0.1)} className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Direct Transmission
                </span>
              </div>
              <h2
                id="contact-modal-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] font-sans"
              >
                Say Hi to bming
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                {isEn
                  ? "Send a secure message directly without logging in. I will receive it in my inbox."
                  : "Gửi tin nhắn trực tiếp không cần đăng nhập. Mình sẽ nhận được email ngay lập tức."}
              </p>
            </motion.div>

            {/* Success State */}
            {status === "success" ? (
              <motion.div {...reveal(0.16)} className="py-8 flex flex-col items-center text-center space-y-4">
                <motion.div
                  initial={reducedMotion ? false : { scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text)]">
                    {isEn ? "Message Sent Successfully!" : "Tin nhắn đã được gửi!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-sm">
                    {isEn
                      ? "Thank you for reaching out! I'll get back to your email as soon as possible."
                      : "Cảm ơn bạn đã liên hệ. Mình sẽ phản hồi qua email bạn đã cung cấp sớm nhất có thể!"}
                  </p>
                </div>
                <motion.button
                  whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  {isEn ? "Close" : "Đóng cửa sổ"}
                </motion.button>
              </motion.div>
            ) : (
              <motion.form {...reveal(0.16)} onSubmit={handleSubmit} className="space-y-4">
                {/* Error message */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Row: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Input.Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={nameId}
                      className="block text-xs font-mono text-[var(--accent)] tracking-wide font-medium"
                    >
                      Input.Name
                    </label>
                    <div className="relative">
                      <input
                        id={nameId}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--tile)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Input.Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={emailId}
                      className="block text-xs font-mono text-[var(--accent)] tracking-wide font-medium"
                    >
                      Input.Email
                    </label>
                    <div className="relative">
                      <input
                        id={emailId}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--tile)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Input.Message */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={messageId}
                    className="block text-xs font-mono text-[var(--accent)] tracking-wide font-medium"
                  >
                    Input.Message
                  </label>
                  <div className="relative">
                    <textarea
                      id={messageId}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Transmission content..."
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--tile)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-xs sm:text-sm resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button (Send Secure Message) */}
                <div className="pt-2 flex flex-col items-center gap-3">
                  <motion.button
                    whileHover={reducedMotion ? undefined : { scale: 1.015 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-bold text-xs sm:text-sm tracking-wide transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--bg)]" />
                        <span>Encrypting & Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Secure Message</span>
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-between w-full text-[11px] text-[var(--muted)] pt-1 font-mono">
                    <span>Direct to: {targetEmail}</span>
                    <a
                      href={`mailto:${targetEmail}?subject=Hello%20from%20Portfolio`}
                      className="hover:text-[var(--accent)] underline underline-offset-2 transition-colors"
                    >
                      {isEn ? "Open Email App" : "Mở ứng dụng Email"}
                    </a>
                  </div>
                </div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
