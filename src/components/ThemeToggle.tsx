import { useState, useEffect, useRef } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "system";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = () => {
    if (theme === "light") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    }
    if (theme === "dark") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  };

  return (
    <div className="theme-toggle" ref={containerRef}>
      <button className="theme-toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
        {getIcon()}
      </button>
      {menuOpen && (
        <div className="theme-menu">
          <button
            className={`theme-option ${theme === "light" ? "active" : ""}`}
            onClick={() => { setTheme("light"); setMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Light
          </button>
          <button
            className={`theme-option ${theme === "dark" ? "active" : ""}`}
            onClick={() => { setTheme("dark"); setMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Dark
          </button>
          <button
            className={`theme-option ${theme === "system" ? "active" : ""}`}
            onClick={() => { setTheme("system"); setMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            System
          </button>
        </div>
      )}
    </div>
  );
}

