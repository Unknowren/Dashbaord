import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import { Menu, Settings, MessageSquare, Zap, Search } from "lucide-react";
import "./App.css";
import WorkflowsPage from "./components/WorkflowsPage";
import "./components/WorkflowsPage.css";
import EinstellungenPage from "./components/Pages/EinstellungenPage";
import "./components/Pages/EinstellungenPage.css";
import WorkflowDetailPage from "./components/Pages/WorkflowDetailPage";
import FeedbackPage from "./components/Pages/FeedbackPage";

function AppShell() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset Suche, wenn wir die Workflows-Seite verlassen
  useEffect(() => {
    if (!location.pathname.startsWith("/workflows")) {
      setSearchQuery("");
    }
  }, [location.pathname]);

  const showSearch = location.pathname === "/workflows";

  const getSearchPlaceholder = () => {
    if (location.pathname === "/workflows") {
      return "Workflows durchsuchen...";
    }
    return "Suchen...";
  };

  if (!mounted) {
    return <div>Lädt...</div>;
  }

  return (
    <div className="app">
      <div className="container">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header">
            <div className="logo">
              <Zap size={24} />
              {sidebarOpen && <span>BrainTest</span>}
            </div>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Sidebar ein-/ausklappen"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/workflows"
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
            >
              <Zap size={18} />
              {sidebarOpen && <span>Workflows</span>}
            </NavLink>
            <NavLink
              to="/feedback"
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
            >
              <MessageSquare size={18} />
              {sidebarOpen && <span>Feedback</span>}
            </NavLink>
            <NavLink
              to="/einstellungen"
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
            >
              <Settings size={18} />
              {sidebarOpen && <span>Einstellungen</span>}
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <header className="header">
            {showSearch && (
              <div className="header-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </header>

          <div className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/workflows" replace />} />
              <Route
                path="/workflows"
                element={<WorkflowsPage searchQuery={searchQuery} />}
              />
              <Route
                path="/workflows/:processId"
                element={<WorkflowDetailPage />}
              />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/einstellungen" element={<EinstellungenPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
