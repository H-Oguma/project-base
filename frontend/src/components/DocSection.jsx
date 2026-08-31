import { DOC_LINKS } from "../constants/links";
import styles from "./DocSection.module.css";

/**
 * ドキュメンテーションセクションコンポーネント
 */
export function DocSection() {
  return (
    <div className={styles.docs}>
      <svg className={styles.icon} role="presentation" aria-hidden="true">
        <use href="/icons.svg#documentation-icon" />
      </svg>
      <h2>Documentation</h2>
      <p>Your questions, answered</p>
      <ul className={styles.linkList}>
        {DOC_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <img
                className={link.isLogo ? styles.logo : styles.buttonIcon}
                src={link.icon}
                alt=""
              />
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
