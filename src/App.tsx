import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("workflows");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePageChange = (newPage: string) => {
    console.log("Changing page to:", newPage);
    setPage(newPage);
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
    content = (
      <div>
        <h2>Workflows</h2>
        <p>Workflow-Verwaltung und Automatisierung</p>
      </div>
    );
  }

  if (!mounted) {
    return <div>Lädt...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <button type="button" onClick={() => alert("Menu clicked!")}>
          Menu
        </button>
        <h1>BrainTestStudio</h1>
      </header>

      <div className="container">
        <aside className="sidebar">
          <nav>
            <button type="button" onClick={() => handlePageChange("workflows")}>
              Workflows
            </button>
            <button type="button" onClick={() => handlePageChange("feedback")}>
              Feedback
            </button>
            <button
              type="button"
              onClick={() => handlePageChange("einstellungen")}
            >
              Einstellungen
            </button>
          </nav>
        </aside>

        <main className="content">{content}</main>
      </div>
    </div>
  );
}

export default App;
