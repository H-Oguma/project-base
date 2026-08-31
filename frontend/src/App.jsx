import { Counter } from "./components/Counter";
import { DocSection } from "./components/DocSection";
import { Hero } from "./components/Hero";
import { SocialSection } from "./components/SocialSection";
import styles from "./App.module.css";

/**
 * アプリケーションのメインコンポーネント
 */
function App() {
  return (
    <>
      <section className={styles.center}>
        <Hero />
        <Counter />
      </section>

      <div className={styles.ticks} />

      <section className={styles.nextSteps}>
        <DocSection />
        <SocialSection />
      </section>

      <div className={styles.ticks} />
      <section className={styles.spacer} />
    </>
  );
}

export default App;
