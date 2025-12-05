/**
 * WorkflowsPage Komponente
 * =========================
 * Zeigt alle Prozesse aus der Datenbank an
 * Mit Suchfunktion, Status-Badges und Filter-Chips
 * Lädt Standardfilter aus den Einstellungen
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, RefreshCw, AlertCircle, X, ChevronDown } from "lucide-react";
import {
  getProcesses,
  searchProcesses,
  Process,
} from "../services/processService";
import { getDefaultWorkflowFilters } from "../services/settingsService";

interface WorkflowsPageProps {
  searchQuery: string;
}

// Filter-Typen
type StatusFilter = "active" | "draft" | "paused" | "archived";
type CategoryFilter = string;

function WorkflowsPage({ searchQuery }: WorkflowsPageProps) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter States
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    CategoryFilter[]
  >([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Flag um zu verhindern dass Default-Filter mehrfach geladen werden
  const defaultFiltersLoaded = useRef(false);

  // Verfügbare Status-Optionen
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "active", label: "Aktiv" },
    { value: "draft", label: "Entwurf" },
    { value: "paused", label: "Pausiert" },
    { value: "archived", label: "Archiviert" },
  ];

  // Kategorien aus den Prozessen extrahieren
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    processes.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, [processes]);

  // Gefilterte Prozesse
  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      // Status-Filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(process.status as StatusFilter)
      ) {
        return false;
      }
      // Kategorie-Filter
      if (
        selectedCategories.length > 0 &&
        (!process.category || !selectedCategories.includes(process.category))
      ) {
        return false;
      }
      return true;
    });
  }, [processes, selectedStatuses, selectedCategories]);

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

  // Standardfilter beim ersten Laden anwenden
  useEffect(() => {
    const loadDefaultFilters = async () => {
      if (defaultFiltersLoaded.current) return;
      defaultFiltersLoaded.current = true;

      const defaults = await getDefaultWorkflowFilters();
      if (defaults.statuses.length > 0) {
        setSelectedStatuses(defaults.statuses as StatusFilter[]);
      }
      if (defaults.categories.length > 0) {
        setSelectedCategories(defaults.categories);
      }
    };
    loadDefaultFilters();
  }, []);

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

  // Dropdown schließen bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(false);
      setShowCategoryDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter-Funktionen
  const toggleStatus = (status: StatusFilter) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleCategory = (category: CategoryFilter) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const removeStatusFilter = (status: StatusFilter) => {
    setSelectedStatuses((prev) => prev.filter((s) => s !== status));
  };

  const removeCategoryFilter = (category: CategoryFilter) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedCategories.length > 0;

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
        {/* Filter-Leiste */}
        <div className="workflows-filters">
          <p className="workflows-count">
            {filteredProcesses.length}{" "}
            {filteredProcesses.length === 1 ? "Prozess" : "Prozesse"} gefunden
            {searchQuery && <span> für "{searchQuery}"</span>}
          </p>

          <div className="filter-controls">
            {/* Status Filter Dropdown */}
            <div
              className="filter-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`filter-button ${
                  selectedStatuses.length > 0 ? "active" : ""
                }`}
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowCategoryDropdown(false);
                }}
              >
                Status
                {selectedStatuses.length > 0 && (
                  <span className="filter-count">
                    {selectedStatuses.length}
                  </span>
                )}
                <ChevronDown size={16} />
              </button>
              {showStatusDropdown && (
                <div className="filter-menu">
                  {statusOptions.map((option) => (
                    <label key={option.value} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                      />
                      <span className={`status-dot ${option.value}`}></span>
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Kategorie Filter Dropdown */}
            {availableCategories.length > 0 && (
              <div
                className="filter-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`filter-button ${
                    selectedCategories.length > 0 ? "active" : ""
                  }`}
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowStatusDropdown(false);
                  }}
                >
                  Kategorie
                  {selectedCategories.length > 0 && (
                    <span className="filter-count">
                      {selectedCategories.length}
                    </span>
                  )}
                  <ChevronDown size={16} />
                </button>
                {showCategoryDropdown && (
                  <div className="filter-menu">
                    {availableCategories.map((category) => (
                      <label key={category} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Aktive Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filters">
            {selectedStatuses.map((status) => (
              <span key={status} className="filter-chip">
                {statusOptions.find((s) => s.value === status)?.label}
                <button onClick={() => removeStatusFilter(status)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedCategories.map((category) => (
              <span key={category} className="filter-chip">
                {category}
                <button onClick={() => removeCategoryFilter(category)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            <button className="clear-filters" onClick={clearAllFilters}>
              Alle Filter entfernen
            </button>
          </div>
        )}
      </div>

      {filteredProcesses.length === 0 ? (
        <div className="workflows-empty">
          <Zap size={48} />
          <p>
            {hasActiveFilters
              ? "Keine Prozesse mit diesen Filtern"
              : "Keine Prozesse gefunden"}
          </p>
        </div>
      ) : (
        <div className="workflows-grid">
          {filteredProcesses.map((process) => (
            <div
              key={process.id || process.process_id}
              className="workflow-card"
              onClick={() =>
                navigate(`/workflows/${process.process_id ?? process.id}`)
              }
            >
              <div className="workflow-card-header">
                <span className="workflow-id">#{process.process_id}</span>
                <span
                  className={`workflow-status ${getStatusColor(
                    process.status
                  )}`}
                >
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
                {process.execution_count !== undefined &&
                  process.execution_count > 0 && (
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
