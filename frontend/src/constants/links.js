import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";

/**
 * ドキュメンテーションリンクのデータ定義
 */
export const DOC_LINKS = [
  {
    title: "Explore Vite",
    url: "https://vite.dev/",
    icon: viteLogo,
    isLogo: true,
  },
  {
    title: "Learn more",
    url: "https://react.dev/",
    icon: reactLogo,
    isLogo: false,
  },
];

/**
 * ソーシャルリンクのデータ定義
 */
export const SOCIAL_LINKS = [
  {
    title: "GitHub",
    url: "https://github.com/vitejs/vite",
    iconSymbol: "/icons.svg#github-icon",
  },
  {
    title: "Discord",
    url: "https://chat.vite.dev/",
    iconSymbol: "/icons.svg#discord-icon",
  },
  {
    title: "X.com",
    url: "https://x.com/vite_js",
    iconSymbol: "/icons.svg#x-icon",
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/vite.dev",
    iconSymbol: "/icons.svg#bluesky-icon",
  },
];
