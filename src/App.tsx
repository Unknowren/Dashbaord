import { useState } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import WorkflowsPage from './components/Pages/WorkflowsPage'
import FeedbackPage from './components/Pages/FeedbackPage'
import EinstellungenPage from './components/Pages/EinstellungenPage'
import './App.css'

export type PageId = 'workflows' | 'feedback' | 'einstellungen'

function App() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [aktivSeite, setAktivSeite] = useState<PageId>('workflows')

  const handleSuche = (begriff: string) => {
    setSuchbegriff(begriff)
    // Hier später Webhook-Integration für Filterung
    console.log('Suche nach:', begriff)
  }

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const handleNavigation = (seiteId: PageId) => {
    setAktivSeite(seiteId)
  }

  const renderSeite = () => {
    switch (aktivSeite) {
      case 'workflows':
        return <WorkflowsPage suchbegriff={suchbegriff} />
      case 'feedback':
        return <FeedbackPage suchbegriff={suchbegriff} />
      case 'einstellungen':
        return <EinstellungenPage />
      default:
        return <WorkflowsPage suchbegriff={suchbegriff} />
    }
  }

  return (
    <div className="app-container">
      <Header 
        onSuche={handleSuche} 
        onMenuToggle={toggleSidebar}
      />
      <div className="app-body">
        <Sidebar 
          expanded={sidebarExpanded} 
          aktivSeite={aktivSeite}
          onNavigate={handleNavigation}
        />
        {renderSeite()}
      </div>
    </div>
  )
}

export default App
