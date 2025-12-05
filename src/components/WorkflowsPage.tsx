/**
 * WorkflowsPage Komponente
 * =========================
 * Zeigt alle Prozesse aus der Datenbank an
 * Mit Suchfunktion und Status-Badges
 */

import { useState, useEffect } from "react";
import { Zap, RefreshCw, AlertCircle } from "lucide-react";
import { getProcesses, searchProcesses, Process } from "../services/processService";

interface WorkflowsPageProps {
  searchQuery: string;
}

function WorkflowsPage({ searchQuery }: WorkflowsPageProps) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prozesse laden
  const loadProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery 
        ? await searchProcesses(searchQuery)
        : await getProcesses();
      setProcesses(data);
    } catch (err) {
      setError("Fehler beim Laden der Prozesse");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial laden
  useEffect(() => {
    loadProcesses();
  }, []);

  // Bei Suche neu laden (mit Debounce-Effekt)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProcesses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Status Badge Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "draft":
        return "status-draft";
      case "paused":
        return "status-paused";
      case "archived":
        return "status-archived";
      default:
        return "";
    }
  };

  // Status Label übersetzen
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "draft":
        return "Entwurf";
      case "paused":
        return "Pausiert";
      case "archived":
        return "Archiviert";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <RefreshCw className="spin" size={24} />
        <span>Lade Prozesse...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertCircle size={24} />
        <span>{error}</span>
        <button onClick={loadProcesses}>Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="workflows-page">
      <div className="workflows-header">
        <p className="workflows-count">
          {processes.length} {processes.length === 1 ? "Prozess" : "Prozesse"} gefunden
          {searchQuery && <span> für "{searchQuery}"</span>}
        </p>
      </div>

      {processes.length === 0 ? (
        <div className="workflows-empty">
          <Zap size={48} />
          <p>Keine Prozesse gefunden</p>
        </div>
      ) : (
        <div className="workflows-grid">
          {processes.map((process) => (
            <div key={process.id} className="workflow-card">
              <div className="workflow-card-header">
                <span className="workflow-id">#{process.process_id}</span>
                <span className={`workflow-status ${getStatusColor(process.status)}`}>
                  {getStatusLabel(process.status)}
                </span>
              </div>
              <h3 className="workflow-name">{process.name}</h3>
              {process.description && (
                <p className="workflow-description">{process.description}</p>
              )}
              <div className="workflow-meta">
                {process.category && (
                  <span className="workflow-category">{process.category}</span>
                )}
                {process.execution_count !== undefined && process.execution_count > 0 && (
                  <span className="workflow-executions">
                    {process.execution_count}x ausgeführt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkflowsPage;
