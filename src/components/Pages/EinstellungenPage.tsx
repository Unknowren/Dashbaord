import { useState, useEffect } from "react";
import { Save, Check, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import {
  getDefaultWorkflowFilters,
  saveDefaultWorkflowFilters,
  DefaultWorkflowFilters,
  getFormFieldDefinitions,
  saveFormFieldDefinitions,
  FormFieldDefinition,
  FormFieldType,
} from "../../services/settingsService";
import "./EinstellungenPage.css";

type Tab = "standardfilter" | "formfelder" | "prozesse" | "benutzer" | "rollen";

// Status-Optionen (gleich wie in WorkflowsPage)
const statusOptions = [
  { value: "active", label: "Aktiv" },
  { value: "draft", label: "Entwurf" },
  { value: "paused", label: "Pausiert" },
  { value: "archived", label: "Archiviert" },
];

// Kategorie-Optionen (können erweitert werden)
const categoryOptions = ["Befragung", "Testing", "Feedback"];

function EinstellungenPage(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>("standardfilter");
  const [defaultFilters, setDefaultFilters] = useState<DefaultWorkflowFilters>({
    statuses: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Formularfeld-Builder
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsSaving, setFieldsSaving] = useState(false);
  const [fieldsSaved, setFieldsSaved] = useState(false);
  const [formFields, setFormFields] = useState<FormFieldDefinition[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    key: "",
    type: "text" as FormFieldType,
    required: false,
    description: "",
    placeholder: "",
    optionsText: "",
    validationPattern: "",
  });

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

  // Formularfelder laden
  useEffect(() => {
    const loadFields = async () => {
      setFieldsLoading(true);
      const defs = await getFormFieldDefinitions();
      setFormFields(defs || []);
      setFieldsLoading(false);
    };
    loadFields();
  }, []);

  // Status-Checkbox ändern
  const toggleStatus = (status: string) => {
    setDefaultFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
    setSaved(false);
  };

  // Kategorie-Checkbox ändern
  const toggleCategory = (category: string) => {
    setDefaultFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
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

  const resetFieldForm = () => {
    setFieldForm({
      label: "",
      key: "",
      type: "text",
      required: false,
      description: "",
      placeholder: "",
      optionsText: "",
      validationPattern: "",
    });
    setEditId(null);
  };

  const handleFieldInputChange = (
    field: keyof typeof fieldForm,
    value: string | boolean
  ) => {
    setFieldForm((prev) => ({ ...prev, [field]: value }));
    setFieldsSaved(false);
  };

  const handleAddOrUpdateField = () => {
    if (!fieldForm.label.trim() || !fieldForm.key.trim()) return;
    const options = fieldForm.optionsText
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    const newDef: FormFieldDefinition = {
      id: editId ?? crypto.randomUUID?.() ?? `field-${Date.now()}`,
      key: fieldForm.key.trim(),
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      required: fieldForm.required,
      description: fieldForm.description.trim() || undefined,
      placeholder: fieldForm.placeholder.trim() || undefined,
      options: options.length > 0 ? options : undefined,
      validationPattern: fieldForm.validationPattern.trim() || undefined,
    };

    setFormFields((prev) => {
      if (editId) {
        return prev.map((f) => (f.id === editId ? newDef : f));
      }
      return [...prev, newDef];
    });

    resetFieldForm();
  };

  const handleEditField = (field: FormFieldDefinition) => {
    setEditId(field.id);
    setFieldForm({
      label: field.label,
      key: field.key,
      type: field.type,
      required: field.required,
      description: field.description ?? "",
      placeholder: field.placeholder ?? "",
      optionsText: (field.options || []).join(", "),
      validationPattern: field.validationPattern ?? "",
    });
  };

  const handleRemoveField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    if (editId === id) {
      resetFieldForm();
    }
    setFieldsSaved(false);
  };

  const handleSaveFieldDefinitions = async () => {
    setFieldsSaving(true);
    const success = await saveFormFieldDefinitions(formFields);
    setFieldsSaving(false);
    if (success) {
      setFieldsSaved(true);
      setTimeout(() => setFieldsSaved(false), 3000);
    }
  };

  return (
    <div id="einstellungen-page" className="page-container">
      <h1>Einstellungen</h1>

      <div className="tabs">
        <button
          className={`tab-button ${
            activeTab === "standardfilter" ? "active" : ""
          }`}
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
          className={`tab-button ${
            activeTab === "formfelder" ? "active" : ""
          }`}
          onClick={() => setActiveTab("formfelder")}
        >
          Formularfelder
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
              Wähle die Filter aus, die beim Öffnen der Workflow-Seite
              automatisch aktiv sein sollen.
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
                    {statusOptions.map((option) => (
                      <label key={option.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={defaultFilters.statuses.includes(
                            option.value
                          )}
                          onChange={() => toggleStatus(option.value)}
                        />
                        <span
                          className={`status-indicator ${option.value}`}
                        ></span>
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-settings-group">
                  <h3>Kategorien</h3>
                  <div className="checkbox-group">
                    {categoryOptions.map((category) => (
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

        {activeTab === "formfelder" && (
          <div className="content-section formfields-section">
            <div className="formfields-header">
              <div>
                <h2>Formularfelder (Baukasten)</h2>
                <p className="section-description">
                  Lege Felder an, die später Workflows zugeordnet und als JSON
                  gespeichert werden. Richtlinien kannst du als Regex
                  (validationPattern) hinterlegen.
                </p>
              </div>
              <div className="inline-status">
                {fieldsSaving && (
                  <span className="badge saving">
                    <Loader2 className="spin" size={14} /> Speichern...
                  </span>
                )}
                {fieldsSaved && !fieldsSaving && (
                  <span className="badge success">
                    <Check size={14} /> Gespeichert
                  </span>
                )}
              </div>
            </div>

            <div className="formfields-grid">
              <div className="builder-card">
                <h3>{editId ? "Feld bearbeiten" : "Neues Feld"}</h3>
                <div className="form-grid">
                  <label className="form-control">
                    <span>Label</span>
                    <input
                      type="text"
                      value={fieldForm.label}
                      onChange={(e) => handleFieldInputChange("label", e.target.value)}
                      placeholder="z.B. Passwort"
                    />
                  </label>
                  <label className="form-control">
                    <span>Schlüssel (key)</span>
                    <input
                      type="text"
                      value={fieldForm.key}
                      onChange={(e) => handleFieldInputChange("key", e.target.value)}
                      placeholder="z.B. password"
                    />
                  </label>
                  <label className="form-control">
                    <span>Typ</span>
                    <select
                      value={fieldForm.type}
                      onChange={(e) =>
                        handleFieldInputChange("type", e.target.value as FormFieldType)
                      }
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="password">Passwort</option>
                      <option value="number">Zahl</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </label>
                  <label className="form-control checkbox-row">
                    <input
                      type="checkbox"
                      checked={fieldForm.required}
                      onChange={(e) => handleFieldInputChange("required", e.target.checked)}
                    />
                    <span>Pflichtfeld</span>
                  </label>
                  <label className="form-control full">
                    <span>Placeholder</span>
                    <input
                      type="text"
                      value={fieldForm.placeholder}
                      onChange={(e) =>
                        handleFieldInputChange("placeholder", e.target.value)
                      }
                      placeholder="z.B. Gib dein Passwort ein"
                    />
                  </label>
                  <label className="form-control full">
                    <span>Beschreibung</span>
                    <textarea
                      value={fieldForm.description}
                      onChange={(e) =>
                        handleFieldInputChange("description", e.target.value)
                      }
                      rows={2}
                      placeholder="Kurzbeschreibung oder Hilfetext"
                    />
                  </label>
                  <label className="form-control full">
                    <span>Optionen (Komma-getrennt, nur für Select)</span>
                    <input
                      type="text"
                      value={fieldForm.optionsText}
                      onChange={(e) =>
                        handleFieldInputChange("optionsText", e.target.value)
                      }
                      placeholder="z.B. Option A, Option B, Option C"
                    />
                  </label>
                  <label className="form-control full">
                    <span>Richtlinie (Regex)</span>
                    <input
                      type="text"
                      value={fieldForm.validationPattern}
                      onChange={(e) =>
                        handleFieldInputChange("validationPattern", e.target.value)
                      }
                      placeholder="z.B. ^(?=.*[A-Z])(?=.*[0-9]).{8,}$"
                    />
                  </label>
                </div>

                <div className="builder-actions">
                  <button className="primary-btn" onClick={handleAddOrUpdateField}>
                    <Plus size={16} /> {editId ? "Feld aktualisieren" : "Feld hinzufügen"}
                  </button>
                  {editId && (
                    <button className="ghost-btn" onClick={resetFieldForm}>
                      Abbrechen
                    </button>
                  )}
                </div>
              </div>

              <div className="builder-card list-card">
                <div className="list-header">
                  <h3>Verfügbare Felder</h3>
                  <button
                    className="secondary-btn"
                    onClick={handleSaveFieldDefinitions}
                    disabled={fieldsSaving}
                  >
                    {fieldsSaving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                    Änderungen speichern
                  </button>
                </div>

                {fieldsLoading ? (
                  <div className="loading-state">
                    <Loader2 className="spin" size={20} />
                    <span>Lade Felder...</span>
                  </div>
                ) : formFields.length === 0 ? (
                  <div className="placeholder-card">
                    <p>Noch keine Felder angelegt.</p>
                    <span>Erstelle ein Feld im linken Formular.</span>
                  </div>
                ) : (
                  <div className="field-list">
                    {formFields.map((field) => (
                      <div key={field.id} className="field-row">
                        <div className="field-row-main">
                          <div className="field-row-title">
                            <span className="field-label">{field.label}</span>
                            <span className="field-key">{field.key}</span>
                          </div>
                          <div className="field-row-meta">
                            <span className="pill type">{field.type}</span>
                            {field.required && <span className="pill required">Pflicht</span>}
                            {field.validationPattern && (
                              <span className="pill rule">Richtlinie</span>
                            )}
                          </div>
                          {field.description && (
                            <p className="field-row-description">{field.description}</p>
                          )}
                          {field.options && field.options.length > 0 && (
                            <p className="field-row-options">
                              Optionen: {field.options.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="field-row-actions">
                          <button
                            className="ghost-btn"
                            onClick={() => handleEditField(field)}
                            title="Bearbeiten"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="ghost-btn danger"
                            onClick={() => handleRemoveField(field.id)}
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EinstellungenPage;
