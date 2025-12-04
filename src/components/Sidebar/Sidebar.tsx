import { RefreshCw, ClipboardList, Settings } from 'lucide-react'
import './Sidebar.css'

interface SidebarProps {
  expanded: boolean
}

interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  beschreibung: string
}

const navigationItems: NavItem[] = [
  {
    id: 'workflows',
    icon: <RefreshCw size={24} />,
    label: 'Workflows',
    beschreibung: 'Aktive Workflows verwalten'
  },
  {
    id: 'feedback',
    icon: <ClipboardList size={24} />,
    label: 'Feedback',
    beschreibung: 'Feedback zu Workflows einsehen'
  },
  {
    id: 'einstellungen',
    icon: <Settings size={24} />,
    label: 'Einstellungen',
    beschreibung: 'Pipeline-Einstellungen konfigurieren'
  }
]

function Sidebar({ expanded }: SidebarProps) {
  return (
    <aside 
      className={`sidebar ${expanded ? 'expanded' : ''}`} 
      id="sidebar-navigation"
    >
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className="nav-item"
            title={item.beschreibung}
            aria-label={item.label}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {expanded && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
