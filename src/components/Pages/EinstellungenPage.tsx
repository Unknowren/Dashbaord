import { useState, useEffect } from "react";
import {
  Save,
  Check,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  Settings2,
  FileText,
  Users,
  Shield,
  Layers,
} from "lucide-react";
import {
  getDefaultWorkflowFilters,
  saveDefaultWorkflowFilters,
  DefaultWorkflowFilters,
  getFormFieldDefinitions,
  saveFormFieldDefinitions,
  FormFieldDefinition,
  FormFieldType,
} from "../../services/settingsService";
import {
  getProcesses,
  Process,
  ProcessFormConfiguration,
  saveProcessFormConfiguration,
} from "../../services/processService";
import "./EinstellungenPage.css";

type Tab = "standardfilter" | "formfelder" | "prozesse" | "benutzer" | "rollen";

const statusOptions = [
  { value: "active", label: "Aktiv", color: "#10b981" },
  { value: "draft", label: "Entwurf", color: "#6b7280" },
  { value: "paused", label: "Pausiert", color: "#f59e0b" },
  { value: "archived", label: "Archiviert", color: "#ef4444" },
];

const categoryOptions = ["Befragung", "Testing", "Feedback"];

const fieldTypes: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "E-Mail" },
  { value: "password", label: "Passwort" },
  { value: "number", label: "Zahl" },
  { value: "textarea", label: "Textbereich" },
  { value: "select", label: "Auswahl" },
  { value: "checkbox", label: "Checkbox" },
];

function EinstellungenPage(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>("formfelder");

  // Standardfilter State
  const [defaultFilters, setDefaultFilters] = useState<DefaultWorkflowFilters>({
    statuses: [],
    categories: [],
  });
  const [filterLoading, setFilterLoading] = useState(true);
  const [filterSaving, setFilterSaving] = useState(false);
  const [filterSaved, setFilterSaved] = useState(false);

  // Formularfelder State
  const [formFields, setFormFields] = useState<FormFieldDefinition[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [fieldsSaving, setFieldsSaving] = useState(false);
  const [fieldsSaved, setFieldsSaved] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldDefinition | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);

  // Prozess-Konfiguration State
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processesLoading, setProcessesLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [processFields, setProcessFields] = useState<FormFieldDefinition[]>([]);
  const [processSaving, setProcessSaving] = useState(false);
  const [processSaved, setProcessSaved] = useState(false);

  // Feld-Formular State
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

  // Daten laden
  useEffect(() => {
    loadFilters();
    loadFields();
    loadProcesses();
  }, []);

  const loadFilters = async () => {
    setFilterLoading(true);
    const filters = await getDefaultWorkflowFilters();
    setDefaultFilters(filters);
    setFilterLoading(false);
  };

  const loadFields = async () => {
    setFieldsLoading(true);
    const defs = await getFormFieldDefinitions();
    setFormFields(defs || []);
    setFieldsLoading(false);
  };

  const loadProcesses = async () => {
    setProcessesLoading(true);
    try {
      const procs = await getProcesses();
      setProcesses(procs);
    } catch (e) {
      console.error(e);
    }
    setProcessesLoading(false);
  };

  // Filter Funktionen
  const toggleStatus = (status: string) => {
    setDefaultFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
    setFilterSaved(false);
  };

  const toggleCategory = (category: string) => {
    setDefaultFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    setFilterSaved(false);
  };

  const handleSaveFilters = async () => {
    setFilterSaving(true);
    const success = await saveDefaultWorkflowFilters(defaultFilters);
    setFilterSaving(false);
    if (success) {
      setFilterSaved(true);
      setTimeout(() => setFilterSaved(false), 3000);
    }
  };

  // Formularfeld Funktionen
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
    setEditingField(null);
    setShowFieldForm(false);
  };

  const openNewFieldForm = () => {
    resetFieldForm();
    setShowFieldForm(true);
  };

  const openEditFieldForm = (field: FormFieldDefinition) => {
    setEditingField(field);
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
    setShowFieldForm(true);
  };

  const handleSaveField = () => {
    if (!fieldForm.label.trim() || !fieldForm.key.trim()) return;

    const options = fieldForm.optionsText
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    const newDef: FormFieldDefinition = {
      id: editingField?.id ?? crypto.randomUUID?.() ?? `field-${Date.now()}`,
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
      if (editingField) {
        return prev.map((f) => (f.id === editingField.id ? newDef : f));
      }
      return [...prev, newDef];
    });

    resetFieldForm();
    setFieldsSaved(false);
  };

  const handleDeleteField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    setFieldsSaved(false);
  };

  const handleSaveAllFields = async () => {
    setFieldsSaving(true);
    const success = await saveFormFieldDefinitions(formFields);
    setFieldsSaving(false);
    if (success) {
      setFieldsSaved(true);
      setTimeout(() => setFieldsSaved(false), 3000);
    }
  };

  // Prozess-Konfiguration Funktionen
  const selectProcess = (proc: Process) => {
    setSelectedProcess(proc);
    const config = proc.form_configuration as ProcessFormConfiguration | undefined;
    setProcessFields(config?.fields || []);
    setProcessSaved(false);
  };

  const addFieldToProcess = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field) return;
    if (processFields.some((f) => f.id === fieldId)) return;
    setProcessFields((prev) => [...prev, field]);
    setProcessSaved(false);
  };

  const removeFieldFromProcess = (fieldId: string) => {
    setProcessFields((prev) => prev.filter((f) => f.id !== fieldId));
    setProcessSaved(false);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    setProcessFields((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setProcessSaved(false);
  };

  const moveFieldDown = (index: number) => {
    if (index === processFields.length - 1) return;
    setProcessFields((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setProcessSaved(false);
  };

  const handleSaveProcessConfig = async () => {
    if (!selectedProcess?.process_id) return;
    setProcessSaving(true);
    try {
      const config: ProcessFormConfiguration = {
        fields: processFields,
        values: (selectedProcess.form_configuration as ProcessFormConfiguration)?.values || {},
      };
      await saveProcessFormConfiguration(selectedProcess.process_id, config);
      setProcessSaved(true);
      setTimeout(() => setProcessSaved(false), 3000);
      // Update local state
      setProcesses((prev) =>
        prev.map((p) =>
          p.process_id === selectedProcess.process_id
            ? { ...p, form_configuration: config }
            : p
        )
      );
      setSelectedProcess((prev) => (prev ? { ...prev, form_configuration: config } : null));
    } catch (e) {
      console.error(e);
    }
    setProcessSaving(false);
  };

  const availableFieldsForProcess = formFields.filter(
    (f) => !processFields.some((pf) => pf.id === f.id)
  );

  const tabs = [
    { id: "formfelder" as Tab, label: "Formularfelder", icon: FileText },
    { id: "prozesse" as Tab, label: "Workflow-Felder", icon: Layers },
    { id: "standardfilter" as Tab, label: "Standardfilter", icon: Settings2 },
    { id: "benutzer" as Tab, label: "Benutzer", icon: Users },
    { id: "rollen" as Tab, label: "Rollen", icon: Shield },
  ];

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <h2>Einstellungen</h2>
        <nav className="settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              <ChevronRight size={16} className="chevron" />
            </button>
          ))}
        </nav>
      </div>

      <div className="settings-content">
        {/* FORMULARFELDER TAB */}
        {activeTab === "formfelder" && (
          <div className="settings-panel">
            <div className="panel-header">
              <div>
                <h1>Formularfelder</h1>
                <p>Erstelle und verwalte wiederverwendbare Formularfelder für deine Workflows.</p>
              </div>
              <div className="panel-actions">
                {fieldsSaved && (
                  <span className="status-badge success">
                    <Check size={14} /> Gespeichert
                  </span>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleSaveAllFields}
                  disabled={fieldsSaving}
                >
                  {fieldsSaving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                  Alle speichern
                </button>
                <button className="btn btn-primary" onClick={openNewFieldForm}>
                  <Plus size={16} />
                  Neues Feld
                </button>
              </div>
            </div>

            {fieldsLoading ? (
              <div className="loading-container">
                <Loader2 className="spin" size={24} />
                <span>Lade Felder...</span>
              </div>
            ) : (
              <div className="fields-table-container">
                {formFields.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} />
                    <h3>Keine Felder vorhanden</h3>
                    <p>Erstelle dein erstes Formularfeld, um es in Workflows zu verwenden.</p>
                    <button className="btn btn-primary" onClick={openNewFieldForm}>
                      <Plus size={16} /> Erstes Feld erstellen
                    </button>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>Schlüssel</th>
                        <th>Typ</th>
                        <th>Pflicht</th>
                        <th>Richtlinie</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formFields.map((field) => (
                        <tr key={field.id}>
                          <td className="cell-main">
                            <span className="field-name">{field.label}</span>
                            {field.description && (
                              <span className="field-desc">{field.description}</span>
                            )}
                          </td>
                          <td>
                            <code className="field-key">{field.key}</code>
                          </td>
                          <td>
                            <span className="type-badge">{field.type}</span>
                          </td>
                          <td>
                            {field.required ? (
                              <span className="badge badge-required">Ja</span>
                            ) : (
                              <span className="badge badge-optional">Nein</span>
                            )}
                          </td>
                          <td>
                            {field.validationPattern ? (
                              <span className="badge badge-rule">Aktiv</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="cell-actions">
                            <button
                              className="icon-btn"
                              onClick={() => openEditFieldForm(field)}
                              title="Bearbeiten"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => handleDeleteField(field.id)}
                              title="Löschen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Feld-Formular Modal */}
            {showFieldForm && (
              <div className="modal-overlay" onClick={() => setShowFieldForm(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editingField ? "Feld bearbeiten" : "Neues Feld erstellen"}</h2>
                  </div>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Label *</label>
                        <input
                          type="text"
                          value={fieldForm.label}
                          onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                          placeholder="z.B. E-Mail-Adresse"
                        />
                      </div>
                      <div className="form-group">
                        <label>Schlüssel (key) *</label>
                        <input
                          type="text"
                          value={fieldForm.key}
                          onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
                          placeholder="z.B. email"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Feldtyp</label>
                        <select
                          value={fieldForm.type}
                          onChange={(e) =>
                            setFieldForm({ ...fieldForm, type: e.target.value as FormFieldType })
                          }
                        >
                          {fieldTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group checkbox-inline">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={fieldForm.required}
                            onChange={(e) =>
                              setFieldForm({ ...fieldForm, required: e.target.checked })
                            }
                          />
                          <span>Pflichtfeld</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Placeholder</label>
                      <input
                        type="text"
                        value={fieldForm.placeholder}
                        onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                        placeholder="z.B. Gib deine E-Mail ein..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Beschreibung / Hilfetext</label>
                      <textarea
                        value={fieldForm.description}
                        onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                        rows={2}
                        placeholder="Optionale Beschreibung für das Feld"
                      />
                    </div>
                    {fieldForm.type === "select" && (
                      <div className="form-group">
                        <label>Optionen (Komma-getrennt)</label>
                        <input
                          type="text"
                          value={fieldForm.optionsText}
                          onChange={(e) =>
                            setFieldForm({ ...fieldForm, optionsText: e.target.value })
                          }
                          placeholder="z.B. Option A, Option B, Option C"
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Validierungs-Richtlinie (Regex)</label>
                      <input
                        type="text"
                        value={fieldForm.validationPattern}
                        onChange={(e) =>
                          setFieldForm({ ...fieldForm, validationPattern: e.target.value })
                        }
                        placeholder="z.B. ^[a-zA-Z0-9]+$ oder ^.{8,}$"
                      />
                      <span className="form-hint">
                        Regulärer Ausdruck zur Validierung der Eingabe
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={resetFieldForm}>
                      Abbrechen
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveField}
                      disabled={!fieldForm.label.trim() || !fieldForm.key.trim()}
                    >
                      {editingField ? "Änderungen speichern" : "Feld erstellen"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROZESSE / WORKFLOW-FELDER TAB */}
        {activeTab === "prozesse" && (
          <div className="settings-panel">
            <div className="panel-header">
              <div>
                <h1>Workflow-Felder konfigurieren</h1>
                <p>Wähle einen Workflow und weise ihm Formularfelder zu.</p>
              </div>
            </div>

            <div className="process-config-layout">
              {/* Prozess-Liste */}
              <div className="process-list-panel">
                <h3>Workflows</h3>
                {processesLoading ? (
                  <div className="loading-container small">
                    <Loader2 className="spin" size={20} />
                  </div>
                ) : processes.length === 0 ? (
                  <p className="text-muted">Keine Workflows gefunden.</p>
                ) : (
                  <div className="process-list">
                    {processes.map((proc) => (
                      <button
                        key={proc.id}
                        className={`process-item ${selectedProcess?.id === proc.id ? "active" : ""}`}
                        onClick={() => selectProcess(proc)}
                      >
                        <span className="process-name">{proc.name}</span>
                        <span className={`status-dot status-${proc.status}`}></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Feld-Konfiguration */}
              <div className="field-config-panel">
                {!selectedProcess ? (
                  <div className="empty-state small">
                    <Layers size={32} />
                    <p>Wähle einen Workflow aus der Liste</p>
                  </div>
                ) : (
                  <>
                    <div className="config-header">
                      <h3>{selectedProcess.name}</h3>
                      <div className="config-actions">
                        {processSaved && (
                          <span className="status-badge success">
                            <Check size={14} /> Gespeichert
                          </span>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveProcessConfig}
                          disabled={processSaving}
                        >
                          {processSaving ? (
                            <Loader2 className="spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          Konfiguration speichern
                        </button>
                      </div>
                    </div>

                    {/* Feld hinzufügen */}
                    <div className="add-field-section">
                      <label>Feld hinzufügen:</label>
                      <div className="add-field-row">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addFieldToProcess(e.target.value);
                              e.target.value = "";
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Feld auswählen...</option>
                          {availableFieldsForProcess.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label} ({f.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      {availableFieldsForProcess.length === 0 && formFields.length > 0 && (
                        <span className="form-hint">Alle Felder wurden bereits hinzugefügt.</span>
                      )}
                      {formFields.length === 0 && (
                        <span className="form-hint">
                          Erstelle zuerst Formularfelder im Tab "Formularfelder".
                        </span>
                      )}
                    </div>

                    {/* Zugewiesene Felder */}
                    <div className="assigned-fields">
                      <h4>Zugewiesene Felder ({processFields.length})</h4>
                      {processFields.length === 0 ? (
                        <p className="text-muted">Noch keine Felder zugewiesen.</p>
                      ) : (
                        <div className="field-order-list">
                          {processFields.map((field, idx) => (
                            <div key={field.id} className="field-order-item">
                              <div className="field-order-info">
                                <span className="order-num">{idx + 1}</span>
                                <div>
                                  <span className="field-label">{field.label}</span>
                                  <span className="field-meta">
                                    {field.type}
                                    {field.required && " • Pflicht"}
                                  </span>
                                </div>
                              </div>
                              <div className="field-order-actions">
                                <button
                                  className="icon-btn small"
                                  onClick={() => moveFieldUp(idx)}
                                  disabled={idx === 0}
                                  title="Nach oben"
                                >
                                  ▲
                                </button>
                                <button
                                  className="icon-btn small"
                                  onClick={() => moveFieldDown(idx)}
                                  disabled={idx === processFields.length - 1}
                                  title="Nach unten"
                                >
                                  ▼
                                </button>
                                <button
                                  className="icon-btn small danger"
                                  onClick={() => removeFieldFromProcess(field.id)}
                                  title="Entfernen"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STANDARDFILTER TAB */}
        {activeTab === "standardfilter" && (
          <div className="settings-panel">
            <div className="panel-header">
              <div>
                <h1>Standardfilter</h1>
                <p>Lege fest, welche Filter beim Öffnen der Workflow-Übersicht aktiv sind.</p>
              </div>
              <div className="panel-actions">
                {filterSaved && (
                  <span className="status-badge success">
                    <Check size={14} /> Gespeichert
                  </span>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSaveFilters}
                  disabled={filterSaving}
                >
                  {filterSaving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                  Speichern
                </button>
              </div>
            </div>

            {filterLoading ? (
              <div className="loading-container">
                <Loader2 className="spin" size={24} />
              </div>
            ) : (
              <div className="filter-config">
                <div className="filter-section">
                  <h3>Status</h3>
                  <div className="filter-options">
                    {statusOptions.map((opt) => (
                      <label key={opt.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={defaultFilters.statuses.includes(opt.value)}
                          onChange={() => toggleStatus(opt.value)}
                        />
                        <span
                          className="status-indicator"
                          style={{ backgroundColor: opt.color }}
                        ></span>
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h3>Kategorien</h3>
                  <div className="filter-options">
                    {categoryOptions.map((cat) => (
                      <label key={cat} className="filter-option">
                        <input
                          type="checkbox"
                          checked={defaultFilters.categories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BENUTZER TAB */}
        {activeTab === "benutzer" && (
          <div className="settings-panel">
            <div className="panel-header">
              <div>
                <h1>Benutzerverwaltung</h1>
                <p>Verwalte Benutzer und deren Zugriffsrechte.</p>
              </div>
            </div>
            <div className="empty-state">
              <Users size={48} />
              <h3>Kommt bald</h3>
              <p>Die Benutzerverwaltung wird in einer zukünftigen Version verfügbar sein.</p>
            </div>
          </div>
        )}

        {/* ROLLEN TAB */}
        {activeTab === "rollen" && (
          <div className="settings-panel">
            <div className="panel-header">
              <div>
                <h1>Rollenverwaltung</h1>
                <p>Definiere Rollen und Berechtigungen.</p>
              </div>
            </div>
            <div className="empty-state">
              <Shield size={48} />
              <h3>Kommt bald</h3>
              <p>Die Rollenverwaltung wird in einer zukünftigen Version verfügbar sein.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EinstellungenPage;
