import { useState, useEffect } from "react";
import { Menu, Settings, MessageSquare, Zap, Search } from "lucide-react";
import "./App.css";
import WorkflowsPage from "./components/WorkflowsPage";
import "./components/WorkflowsPage.css";

function App() {
  const [page, setPage] = useState("workflows");
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePageChange = (newPage: string) => {
    console.log("Changing page to:", newPage);
    setPage(newPage);
    setSearchQuery(""); // Reset search when changing page
  };

  // Dynamischer Suchplatzhalter je nach Seite
  const getSearchPlaceholder = () => {
    switch (page) {
      case "workflows":
        return "Workflows durchsuchen...";
      case "feedback":
        return "Feedback durchsuchen...";
      case "einstellungen":
        return "Einstellungen durchsuchen...";
      default:
        return "Suchen...";
    }
  };

  // Dynamischer Seitentitel
  const getPageTitle = () => {
    switch (page) {
      case "workflows":
        return "Workflows";
      case "feedback":
        return "Feedback";
      case "einstellungen":
        return "Einstellungen";
      default:
        return "Dashboard";
    }
  };

  let content;
  if (page === "feedback") {
    content = (
      <div>
        <h2>Feedback</h2>
        <p>Feedback-System für Benutzer</p>
      </div>
    );
  } else if (page === "einstellungen") {
    content = (
      <div>
        <h2>Einstellungen</h2>
        <p>Konfiguration und Verwaltung</p>
      </div>
    );
  } else {
    content = <WorkflowsPage searchQuery={searchQuery} />;
  }

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
              title="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-btn ${page === "workflows" ? "active" : ""}`}
              onClick={() => handlePageChange("workflows")}
              title="Workflows"
            >
              <Zap size={20} />
              {sidebarOpen && <span>Workflows</span>}
            </button>
            <button
              type="button"
              className={`nav-btn ${page === "feedback" ? "active" : ""}`}
              onClick={() => handlePageChange("feedback")}
              title="Feedback"
            >
              <MessageSquare size={20} />
              {sidebarOpen && <span>Feedback</span>}
            </button>
            <button
              type="button"
              className={`nav-btn ${page === "einstellungen" ? "active" : ""}`}
              onClick={() => handlePageChange("einstellungen")}
              title="Einstellungen"
            >
              <Settings size={20} />
              {sidebarOpen && <span>Einstellungen</span>}
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <header className="header">
            <div className="header-left">
              <h1>{getPageTitle()}</h1>
            </div>
            <div className="header-search">
              <Search size={18} />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>
          <div className="content">{content}</div>
        </main>
      </div>
    </div>
  );
}

export default App;
