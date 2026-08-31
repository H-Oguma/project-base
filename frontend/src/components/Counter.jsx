import { useState } from "react";
import styles from "./Counter.module.css";

/**
 * カウンターコンポーネント
 */
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      className={styles.counter}
      onClick={() => setCount((prev) => prev + 1)}
    >
      Count is {count}
    </button>
  );
}
