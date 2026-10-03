import styles from "./Sidebar.module.css";

export default function Sidebar({ sessions, activeId, onNew, onSwitch, onDelete, theme, onToggleTheme }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Lakeura</span>
          <span className={styles.logoTag}>°‧ 𓆝 𓆟 𓆞 ·｡</span>
        </div>
        <button className={styles.iconBtn} onClick={onNew} title="New session">＋</button>
      </div>

      <span className={styles.label}>Sessions</span>

      <ul className={styles.list}>
        {sessions.map((s) => (
          <li
            key={s.id}
            className={`${styles.item} ${s.id === activeId ? styles.active : ""}`}
            onClick={() => onSwitch(s.id)}
            title={s.title}
          >
            <span className={styles.itemTitle}>{s.title}</span>
            <button
              className={styles.deleteBtn}
              title="Delete session"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Theme toggle — bottom left */}
      <div className={styles.themeToggle}>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "○" : "●"}
        </button>
        <span className={styles.themeLabel}>{theme === "dark" ? "Dark" : "Light"}</span>
      </div>
    </aside>
  );
}
