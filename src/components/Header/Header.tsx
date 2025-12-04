import { Search, Menu } from 'lucide-react'
import { useState } from 'react'
import './Header.css'

interface HeaderProps {
  onSuche: (begriff: string) => void
  onMenuToggle: () => void
}

function Header({ onSuche, onMenuToggle }: HeaderProps) {
  const [suchInput, setSuchInput] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSuchInput(value)
    onSuche(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuche(suchInput)
  }

  return (
    <header className="header" id="header-bereich">
      <div className="header-left">
        <button 
          className="hamburger-menu" 
          onClick={onMenuToggle}
          aria-label="Menü öffnen/schließen"
          id="hamburger-menu"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="header-center">
        <form className="suchfeld-container" onSubmit={handleSubmit}>
          <Search size={18} className="such-icon" />
          <input
            type="text"
            className="suchfeld"
            placeholder="Suchen..."
            value={suchInput}
            onChange={handleInputChange}
            id="header-suche"
          />
        </form>
      </div>
      
      <div className="header-right">
        {/* Platzhalter für zukünftige Header-Elemente (z.B. Benachrichtigungen, Profil) */}
      </div>
    </header>
  )
}

export default Header
