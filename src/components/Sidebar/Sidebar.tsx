import { RefreshCw, ClipboardList, Settings } from 'lucide-react'
import type { PageId } from '../../App'
import './Sidebar.css'

interface SidebarProps {
  expanded: boolean
  aktivSeite: PageId
  onNavigate: (seiteId: PageId) => void
}

interface NavItem {
  id: PageId
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

function Sidebar({ expanded, aktivSeite, onNavigate }: SidebarProps) {
  return (
    <aside 
      className={`sidebar ${expanded ? 'expanded' : ''}`} 
      id="sidebar-navigation"
    >
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${aktivSeite === item.id ? 'active' : ''}`}
            title={item.beschreibung}
            aria-label={item.label}
            id={`nav-${item.id}`}
            onClick={() => onNavigate(item.id)}
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
