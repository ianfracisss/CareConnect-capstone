"use client"

import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md border px-3 py-2 text-sm"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}
