import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App コンポーネント", () => {
  it("Get started のテキストが表示されること", () => {
    render(<App />);
    const headerElement = screen.getByText(/Get started/i);
    expect(headerElement).toBeInTheDocument();
  });

  it("ボタンをクリックするとカウントが増加すること", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole("button", { name: /Count is 0/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole("button", { name: /Count is 1/i })).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole("button", { name: /Count is 2/i })).toBeInTheDocument();
  });

  it("外部リンクが正しい属性（rel=\"noopener noreferrer\", target=\"_blank\"）で描画されること", () => {
    render(<App />);

    const expectedLinks = [
      { name: /Explore Vite/i, href: "https://vite.dev/" },
      { name: /Learn more/i, href: "https://react.dev/" },
      { name: /GitHub/i, href: "https://github.com/vitejs/vite" },
      { name: /Discord/i, href: "https://chat.vite.dev/" },
      { name: /X\.com/i, href: "https://x.com/vite_js" },
      { name: /Bluesky/i, href: "https://bsky.app/profile/vite.dev" },
    ];

    expectedLinks.forEach(({ name, href }) => {
      const link = screen.getByRole("link", { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
