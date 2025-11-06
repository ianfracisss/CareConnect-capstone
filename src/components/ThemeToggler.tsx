"use client";

import "@theme-toggles/react/css/Within.css";
import { Within } from "@theme-toggles/react";
import { useState, useEffect } from "react";

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("theme") as "dark" | "light") || "dark";
}

export function ThemeToggler() {
  const [isDark, setIsDark] = useState(() => {
    // Only access localStorage during client-side initialization
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
      return savedTheme === "dark";
    }
    return true; // Default to dark theme on server
  });

  // Apply theme to DOM on mount and when theme changes
  useEffect(() => {
    const savedTheme = getInitialTheme();
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div
      className="theme-toggler"
      suppressHydrationWarning
      style={{
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Within
        duration={750}
        toggled={isDark}
        toggle={toggleTheme}
        reversed
        style={{
          color: "var(--text)",
          cursor: "pointer",
          width: 50,
          height: 50,
        }}
      />
    </div>
  );
}
