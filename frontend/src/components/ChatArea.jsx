import { useEffect, useRef, useState, useCallback } from "react";
import ThinkingIndicator from "./ThinkingIndicator";
import styles from "./ChatArea.module.css";

const BACKEND = "http://127.0.0.1:8080/chat";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Parse a markdown table block into a React <table> */
function parseTable(lines, key) {
  const rows = lines.filter(l => !l.match(/^\s*\|[-:| ]+\|\s*$/));
  const parsed = rows.map(r =>
    r.replace(/^\||\|$/g, "").split("|").map(c => c.trim())
  );
  const [head, ...body] = parsed;
  return (
    <div key={key} className={styles.tableWrap}>
      <table className={styles.mdTable}>
        <thead>
          <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tokenise inline markdown: **bold**, *italic*, `code` */
function inlineTokens(line) {
  const tokens = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m, key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push(line.slice(last, m.index));
    if (m[2] !== undefined) tokens.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] !== undefined) tokens.push(<em key={key++}>{m[3]}</em>);
    else if (m[4] !== undefined) tokens.push(<code key={key++} className={styles.inlineCode}>{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < line.length) tokens.push(line.slice(last));
  return tokens;
}

/** Full markdown → React nodes. Handles tables, bold, italic, code, line breaks. */
function renderMarkdown(text) {
  const lines = text.split("\n");
  const nodes = [];
  let i = 0, nodeKey = 0;

  while (i < lines.length) {
    // detect table block: current line has pipes and next is a separator row
    const isSep = (l) => /^\s*\|[-:| ]+\|\s*$/.test(l);
    if (lines[i].includes("|") && lines[i + 1] && isSep(lines[i + 1])) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      nodes.push(parseTable(tableLines, nodeKey++));
      continue;
    }

    // normal line with inline tokens
    const tokens = inlineTokens(lines[i]);
    nodes.push(...tokens);
    if (i < lines.length - 1) nodes.push(<br key={`br-${nodeKey++}`} />);
    i++;
  }

  return nodes;
}

function Message({ role, text, ts }) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.bubble}>
        {role === "assistant" ? renderMarkdown(text) : text}
      </div>
      <span className={styles.meta}>{formatTime(ts)}</span>
    </div>
  );
}

export default function ChatArea({ session, onMessage, sessionTitle }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, loading]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    onMessage("user", text);

    try {
      const res = await fetch(BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      onMessage("assistant", data.response ?? "(no response)");
    } catch (err) {
      onMessage("assistant", `⚠ ${err.message}`);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const messages = session?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <div className={styles.area}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.title}>{sessionTitle ?? "New Session"}</span>
        <span className={styles.tag}>AI Data Assistant</span>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {isEmpty && !loading ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>◈</div>
            <h2 className={styles.welcomeTitle}>Welcome to Lakeura</h2>
            <p className={styles.welcomeSub}>
              Ask me anything about your data warehouse.
              <br />I can query, onboard, and inspect your tables.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <Message key={i} role={m.role} text={m.text} ts={m.ts} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Thinking indicator */}
      <ThinkingIndicator visible={loading} />

      {/* Input */}
      <div className={styles.inputBar}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoResize(); }}
          onKeyDown={handleKey}
          placeholder="Ask Lakeura something…"
          rows={1}
          disabled={loading}
          autoComplete="off"
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={loading || !input.trim()}
          title="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
