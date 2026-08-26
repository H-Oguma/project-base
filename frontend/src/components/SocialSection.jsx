import { SOCIAL_LINKS } from "../constants/links";
import styles from "./SocialSection.module.css";

/**
 * ソーシャルリンクセクションコンポーネント
 */
export function SocialSection() {
  return (
    <div className={styles.social}>
      <svg className={styles.icon} role="presentation" aria-hidden="true">
        <use href="/icons.svg#social-icon" />
      </svg>
      <h2>Connect with us</h2>
      <p>Join the Vite community</p>
      <ul className={styles.linkList}>
        {SOCIAL_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <svg
                className={styles.buttonIcon}
                role="presentation"
                aria-hidden="true"
              >
                <use href={link.iconSymbol} />
              </svg>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
