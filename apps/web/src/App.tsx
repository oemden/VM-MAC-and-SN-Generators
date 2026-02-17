import { useState, useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { MacGenerator } from './components/MacGenerator'
import { SnGenerator } from './components/SnGenerator'
import { SavedResults } from './pages/SavedResults'

type Theme = 'light' | 'dark' | 'system'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored ?? 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (theme === 'system') {
      root.setAttribute('data-theme', systemDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'system'
      return 'light'
    })
  }

  const getThemeIcon = () => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'System'
  }

  return (
    <>
      <header className="header">
        <h1>VM Generator</h1>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/">Generate</Link>
          <Link to="/saved">Saved</Link>
          <button className="theme-toggle" onClick={cycleTheme}>
          {getThemeIcon()}
        </button>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="generators">
                <MacGenerator />
                <SnGenerator />
              </div>
            }
          />
          <Route path="/saved" element={<SavedResults />} />
        </Routes>
      </main>

      <footer className="footer">
        VM MAC & SN Generator v0.6.0
      </footer>
    </>
  )
}

export default App
