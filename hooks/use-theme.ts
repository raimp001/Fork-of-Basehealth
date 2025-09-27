"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem("theme") as Theme || "system"
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === "system") {
      // Use system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setResolvedTheme(systemTheme)
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }

      handleChange() // Set initial value
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Use manual theme
      setResolvedTheme(theme)
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [theme])

  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return {
    theme,
    setTheme: setThemeAndSave,
    resolvedTheme
  }
}
