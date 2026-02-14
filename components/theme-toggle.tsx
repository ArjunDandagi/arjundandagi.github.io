"use client";

import { useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Color theme">
      <button
        type="button"
        className={`theme-option ${theme === "light" ? "is-active" : ""}`}
        role="radio"
        aria-checked={theme === "light"}
        aria-label="Light mode"
        title="Light mode"
        onClick={() => {
          setTheme("light");
          document.documentElement.setAttribute("data-theme", "light");
        }}
      >
        <span className="theme-icon" aria-hidden>
          ☀
        </span>
      </button>
      <button
        type="button"
        className={`theme-option ${theme === "dark" ? "is-active" : ""}`}
        role="radio"
        aria-checked={theme === "dark"}
        aria-label="Dark mode"
        title="Dark mode"
        onClick={() => {
          setTheme("dark");
          document.documentElement.setAttribute("data-theme", "dark");
        }}
      >
        <span className="theme-icon" aria-hidden>
          ☾
        </span>
      </button>
      <span
        className={`theme-thumb ${theme === "dark" ? "is-dark" : ""}`}
        aria-hidden
      />
    </div>
  );
}
