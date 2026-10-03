import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { useSessions } from "./hooks/useSessions";
import styles from "./App.module.css";

export default function App() {
  const { sessions, activeId, activeSession, newSession, switchSession, appendMessage, deleteSession } =
    useSessions();

  const [theme, setTheme] = useState(() => localStorage.getItem("lakeura_theme") ?? "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lakeura_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "dark" ? "light" : "dark");
  }

  return (
    <div className={styles.app}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNew={newSession}
        onSwitch={switchSession}
        onDelete={deleteSession}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <ChatArea
        session={activeSession}
        sessionTitle={activeSession?.title ?? "New Session"}
        onMessage={appendMessage}
      />
    </div>
  );
}
