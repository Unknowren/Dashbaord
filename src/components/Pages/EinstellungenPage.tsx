import { useState, useEffect } from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { 
  getDefaultWorkflowFilters, 
  saveDefaultWorkflowFilters,
  DefaultWorkflowFilters 
} from "../../services/settingsService";
import "./EinstellungenPage.css";

type Tab = "standardfilter" | "prozesse" | "benutzer" | "rollen";

// Status-Optionen (gleich wie in WorkflowsPage)
const statusOptions = [
  { value: "active", label: "Aktiv" },
  { value: "draft", label: "Entwurf" },
  { value: "paused", label: "Pausiert" },
  { value: "archived", label: "Archiviert" },
];

// Kategorie-Optionen (können erweitert werden)
const categoryOptions = [
  "Befragung",
  "Testing",
  "Feedback",
];

function EinstellungenPage(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>("standardfilter");
  const [defaultFilters, setDefaultFilters] = useState<DefaultWorkflowFilters>({
    statuses: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Standardfilter beim Laden abrufen
  useEffect(() => {
    const loadFilters = async () => {
      setLoading(true);
      const filters = await getDefaultWorkflowFilters();
      setDefaultFilters(filters);
      setLoading(false);
    };
    loadFilters();
  }, []);

  // Status-Checkbox ändern
  const toggleStatus = (status: string) => {
    setDefaultFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
    setSaved(false);
  };

  // Kategorie-Checkbox ändern
  const toggleCategory = (category: string) => {
    setDefaultFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    setSaved(false);
  };

  // Filter speichern
  const handleSaveFilters = async () => {
    setSaving(true);
    const success = await saveDefaultWorkflowFilters(defaultFilters);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div id="einstellungen-page" className="page-container">
      <h1>Einstellungen</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "standardfilter" ? "active" : ""}`}
          onClick={() => setActiveTab("standardfilter")}
        >
          Standardfilter
        </button>
        <button
          className={`tab-button ${activeTab === "prozesse" ? "active" : ""}`}
          onClick={() => setActiveTab("prozesse")}
        >
          Prozesse
        </button>
        <button
          className={`tab-button ${activeTab === "benutzer" ? "active" : ""}`}
          onClick={() => setActiveTab("benutzer")}
        >
          Benutzer
        </button>
        <button
          className={`tab-button ${activeTab === "rollen" ? "active" : ""}`}
          onClick={() => setActiveTab("rollen")}
        >
          Rollen
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "standardfilter" && (
          <div className="content-section">
            <h2>Standardfilter für Workflows</h2>
            <p className="section-description">
              Wähle die Filter aus, die beim Öffnen der Workflow-Seite automatisch aktiv sein sollen.
            </p>

            {loading ? (
              <div className="loading-state">
                <Loader2 className="spin" size={20} />
                <span>Lade Einstellungen...</span>
              </div>
            ) : (
              <>
                <div className="filter-settings-group">
                  <h3>Status</h3>
                  <div className="checkbox-group">
                    {statusOptions.map(option => (
                      <label key={option.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={defaultFilters.statuses.includes(option.value)}
                          onChange={() => toggleStatus(option.value)}
                        />
                        <span className={`status-indicator ${option.value}`}></span>
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-settings-group">
                  <h3>Kategorien</h3>
                  <div className="checkbox-group">
                    {categoryOptions.map(category => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={defaultFilters.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="save-section">
                  <button 
                    className={`save-button ${saved ? "saved" : ""}`}
                    onClick={handleSaveFilters}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="spin" size={16} />
                        Speichern...
                      </>
                    ) : saved ? (
                      <>
                        <Check size={16} />
                        Gespeichert!
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Einstellungen speichern
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "prozesse" && (
          <div className="content-section">
            <h2>Prozessverwaltung</h2>
            <p>Prozesse können hier verwaltet werden.</p>
          </div>
        )}

        {activeTab === "benutzer" && (
          <div className="content-section">
            <h2>Benutzerverwaltung</h2>
            <p>Benutzer können hier verwaltet werden.</p>
          </div>
        )}

        {activeTab === "rollen" && (
          <div className="content-section">
            <h2>Rollenverwaltung</h2>
            <p>Rollen können hier verwaltet werden.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EinstellungenPage;
