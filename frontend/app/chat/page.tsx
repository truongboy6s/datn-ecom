"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { chatService } from "@/services/chat.service";
import type { ChatMessage } from "@/types/domain";

const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";

const SUGGESTIONS = [
  "Laptop dưới 20 triệu",
  "Tai nghe chống ồn tốt nhất",
  "Phụ kiện gaming bán chạy",
  "Điện thoại chụp ảnh đẹp",
  "Combo bàn phím chuột",
  "Màn hình cho thiết kế"
];

export default function ChatPage() {
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
    <main className="container page">
      <h1>🤖 AI Chatbot gợi ý sản phẩm</h1>
      <p className="page-subtitle">
        Trợ lý AI giúp bạn tìm sản phẩm phù hợp nhu cầu. Hãy đặt câu hỏi!
      </p>

      <section className="chat-box" style={{ minHeight: 360 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--muted)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: 10 }}>🤖</p>
            <h2>Xin chào! Tôi là AI trợ lý mua sắm</h2>
            <p style={{ fontSize: ".9rem", marginBottom: 16 }}>
              Hãy đặt câu hỏi như &quot;Laptop dưới 20 triệu&quot; hoặc chọn gợi ý bên dưới
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-chip" onClick={() => void sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((msg, index) => (
          <article
            key={`${msg.role}-${index}`}
            className={`chat-msg ${msg.role === "USER" ? "chat-msg--user" : "chat-msg--assistant"}`}
          >
            <p className="chat-msg__role">{msg.role === "USER" ? "Bạn" : "AI Trợ lý"}</p>
            <p>{msg.message}</p>
          </article>
        ))}
        {loading ? (
          <div className="chat-msg chat-msg--assistant">
            <p className="chat-msg__role">AI Trợ lý</p>
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          </div>
        ) : null}
        <div ref={chatEndRef} />
      </section>

      <form onSubmit={onSubmit} className="chat-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Đang gửi..." : "Gửi →"}
        </button>
      </form>
    </main>
  );
}
