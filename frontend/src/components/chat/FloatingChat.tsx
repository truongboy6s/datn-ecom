"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { chatService } from "@/services/chat.service";
import type { ChatMessage } from "@/types/domain";

const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";

const SUGGESTIONS = [
  "Laptop dưới 20 triệu",
  "Tai nghe chống ồn",
  "Phụ kiện gaming",
  "Điện thoại chụp ảnh đẹp"
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: ChatMessage = { role: "USER", message: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        userId: DEMO_USER_ID,
        message: userMessage.message
      });
      setMessages((prev) => [...prev, { role: "ASSISTANT", message: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ASSISTANT", message: "Hệ thống tạm thời không phản hồi. Vui lòng thử lại sau." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Chat AI">
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <div className="chat-popup">
          <header className="chat-popup__header">
            <h2>🤖 AI Chatbot</h2>
            <button onClick={() => setIsOpen(false)} style={{ border: "none", background: "transparent", fontSize: "1.1rem", cursor: "pointer" }}>✕</button>
          </header>

          <section className="chat-box">
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--muted)" }}>
                <p style={{ fontSize: "1.5rem", marginBottom: "8px" }}>👋</p>
                <p style={{ fontWeight: 600 }}>Xin chào! Tôi là AI trợ lý mua sắm.</p>
                <p style={{ fontSize: ".85rem" }}>Hãy đặt câu hỏi như: &quot;Laptop dưới 20 triệu&quot;</p>
              </div>
            ) : null}
            {messages.map((msg, index) => (
              <article
                key={`${msg.role}-${index}`}
                className={`chat-msg ${msg.role === "USER" ? "chat-msg--user" : "chat-msg--assistant"}`}
              >
                <p className="chat-msg__role">{msg.role === "USER" ? "Bạn" : "AI"}</p>
                <p>{msg.message}</p>
              </article>
            ))}
            {loading ? (
              <div className="chat-msg chat-msg--assistant">
                <p className="chat-msg__role">AI</p>
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            ) : null}
            <div ref={chatEndRef} />
          </section>

          {messages.length === 0 ? (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-chip" onClick={() => void sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="chat-form">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
            />
            <button type="submit" disabled={loading} className="btn-primary">
              Gửi
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
