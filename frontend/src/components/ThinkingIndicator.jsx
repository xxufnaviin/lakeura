const PHRASES = [
  "Querying the lake",
  "Scanning catalog",
  "Consulting the warehouse",
  "Running the agent",
  "Calling MCP tools",
  "Reading your tables",
  "Crunching Iceberg data",
  "Traversing partitions",
  "Inspecting schemas",
  "Executing query",
];

import { useEffect, useRef, useState } from "react";
import styles from "./ThinkingIndicator.module.css";

export default function ThinkingIndicator({ visible }) {
  const [label, setLabel] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)]
  );
  const [fading, setFading] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!visible) return;
    idxRef.current = Math.floor(Math.random() * PHRASES.length);
    setLabel(PHRASES[idxRef.current]);

    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % PHRASES.length;
        setLabel(PHRASES[idxRef.current]);
        setFading(false);
      }, 200);
    }, 2200);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.orbs}>
        <span className={`${styles.orb} ${styles.o1}`} />
        <span className={`${styles.orb} ${styles.o2}`} />
        <span className={`${styles.orb} ${styles.o3}`} />
      </div>
      <div className={styles.text}>
        <span
          className={styles.label}
          style={{ opacity: fading ? 0 : 1 }}
        >
          {label}
        </span>
        <span className={styles.dots}>
          <span /><span /><span />
        </span>
      </div>
    </div>
  );
}
