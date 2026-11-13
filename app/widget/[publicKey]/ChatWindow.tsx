// app/widget/[publicKey]/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./ChatWindow.module.css";

// The widget runs inside an iframe, so links must open in a new tab instead of inside the chat.
const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};
type Message = { role: "user" | "assistant"; content: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Returns the saved id, or null if there isn't a valid one
function readSessionId(publicKey: string): string | null {
  try {
    const existing = localStorage.getItem(`smile-ai:session:${publicKey}`);
    return existing && UUID_RE.test(existing) ? existing : null;
  } catch {
    return null;
  }
}

function getOrCreateSessionId(publicKey: string): string {
  const key = `smile-ai:session:${publicKey}`;
  try {
    const existing = readSessionId(publicKey);
    if (existing) return existing;

    const fresh = crypto.randomUUID();
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    // Storage blocked (e.g. third-party iframe, private mode): session lasts only this page load
    return crypto.randomUUID();
  }
}

export default function ChatWindow({
  businessName,
  publicKey,
}: {
  businessName: string;
  publicKey: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm the ${businessName} assistant. I can answer questions about our services and prices, or book an appointment for you.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);
  // On load: if a session id was saved before, fetch that conversation
  useEffect(() => {
    const existing = readSessionId(publicKey);
    if (!existing) return;
    sessionIdRef.current = existing;

    let cancelled = false;
    const qs = new URLSearchParams({ publicKey, sessionId: existing });

    fetch(`/api/chat/history?${qs}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: Message[] } | null) => {
        if (cancelled || !data?.messages?.length) return;
        // welcome first, then history, then anything typed while history was loading
        setMessages((prev) => [prev[0], ...data.messages!, ...prev.slice(1)]);
      })
      .catch(() => {}); // history is optional; the chat still works without it

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    sessionIdRef.current ??= getOrCreateSessionId(publicKey);
    const sessionId = sessionIdRef.current;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, sessionId, message: text }),
      });
      const data = await res.json();
      if (res.status === 429) {
  setMessages((prev) => [...prev, { role: "assistant", content: data.error }]);
  return;
}
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

   
      console.log(data);
      
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  
  
return (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.avatar}>
        {businessName.charAt(0).toUpperCase()}
      </div>

      <div className={styles.headerInfo}>
        <h3>{businessName}</h3>
        <p>AI Assistant · Online</p>
      </div>
    </header>

    <div className={styles.messages}>
      {messages.map((m, i) => (
        <div
          key={i}
          className={`${styles.messageRow} ${
            m.role === "user" ? styles.userRow : styles.assistantRow
          }`}
        >
          <div
            className={`${styles.bubble} ${
              m.role === "user"
                ? styles.userBubble
                : styles.assistantBubble
            }`}
          >
            {m.role === "assistant" ? (
              // Assistant replies are Markdown (bold, lists). react-markdown ignores raw HTML, so this is safe.
              <div className={styles.markdown}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {m.content}
                </ReactMarkdown>
              </div>
            ) : (
              // Visitor messages stay plain text.
              m.content
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className={styles.messageRow}>
          <div className={`${styles.bubble} ${styles.assistantBubble}`}>
            <span className={styles.typing}>Typing...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
    >
      <input
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        maxLength={1000}
      />

      <button
        className={styles.sendButton}
        type="submit"
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </form>
  </div>
);

}