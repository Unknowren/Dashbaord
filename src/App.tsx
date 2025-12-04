import { useState } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import './App.css'

function App() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const handleSuche = (begriff: string) => {
    setSuchbegriff(begriff)
    // Hier später Webhook-Integration für Filterung
    console.log('Suche nach:', begriff)
  }

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  return (
    <div className="app-container">
      <Header 
        onSuche={handleSuche} 
        onMenuToggle={toggleSidebar}
      />
      <div className="app-body">
        <Sidebar expanded={sidebarExpanded} />
        <MainContent suchbegriff={suchbegriff} />
      </div>
    </div>
  )
}

export default App
