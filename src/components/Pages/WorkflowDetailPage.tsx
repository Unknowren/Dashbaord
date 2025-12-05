import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  getProcess,
  Process,
  ProcessFormConfiguration,
  saveProcessFormConfiguration,
} from "../../services/processService";
import {
  FormFieldDefinition,
  getFormFieldDefinitions,
} from "../../services/settingsService";
import "./WorkflowDetailPage.css";

interface ValidationResult {
  [key: string]: string | undefined;
}

type FormValue = string | boolean | number | undefined;
type FormValues = Record<string, FormValue>;

function WorkflowDetailPage(): React.ReactNode {
  const { processId } = useParams();
  const navigate = useNavigate();

  const [process, setProcess] = useState<Process | null>(null);
  const [definitions, setDefinitions] = useState<FormFieldDefinition[]>([]);
  const [selectedFields, setSelectedFields] = useState<FormFieldDefinition[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({});
  const [fieldToAdd, setFieldToAdd] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const pid = Number(processId);
        if (Number.isNaN(pid)) {
          throw new Error("Ungültige Prozess-ID");
        }

        const [proc, defs] = await Promise.all([
          getProcess(pid),
          getFormFieldDefinitions(),
        ]);

        setProcess(proc);
        setDefinitions(defs || []);

        const config = (proc?.form_configuration || {
          fields: [],
          values: {},
        }) as ProcessFormConfiguration;

        setSelectedFields(config.fields || []);
        setFormValues((config.values as FormValues) || {});
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Prozesses oder der Formularfelder");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [processId]);

  const availableDefinitions = useMemo(() => {
    return definitions.filter(
      (def) => !selectedFields.some((field) => field.id === def.id)
    );
  }, [definitions, selectedFields]);

  const statusLabel = (status?: string) => {
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
        return status || "Unbekannt";
    }
  };

  const statusClass = (status?: string) => {
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

  const addField = () => {
    if (!fieldToAdd) return;
    const def = definitions.find((d) => d.id === fieldToAdd);
    if (!def) return;
    setSelectedFields((prev) => [...prev, def]);
    setFieldToAdd("");
  };

  const removeField = (id: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.id !== id));
    setFormValues((prev) => {
      const copy = { ...prev };
      const field = selectedFields.find((f) => f.id === id);
      if (field) {
        delete copy[field.key];
      }
      return copy;
    });
  };

  const handleValueChange = (key: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const next: ValidationResult = {};
    selectedFields.forEach((field) => {
      const value = formValues[field.key];
      if (field.required && (value === undefined || value === "")) {
        next[field.key] = "Pflichtfeld";
        return;
      }
      if (field.validationPattern && value !== undefined && value !== "") {
        try {
          const regex = new RegExp(field.validationPattern);
          if (!regex.test(String(value))) {
            next[field.key] = "Eingabe entspricht nicht der Richtlinie";
          }
        } catch (e) {
          console.warn("Ungültiges Validierungs-Muster", field.validationPattern, e);
        }
      }
    });
    setValidation(next);
    return Object.keys(next).length === 0;
  };

  const persistForm = async (actionLabel: string) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const pid = Number(processId);
      if (Number.isNaN(pid)) {
        throw new Error("Ungültige Prozess-ID");
      }

      const configuration: ProcessFormConfiguration = {
        fields: selectedFields,
        values: formValues,
      };

      await saveProcessFormConfiguration(pid, configuration);
      setMessage(`${actionLabel} gespeichert`);
    } catch (err) {
      console.error(err);
      setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStructure = () => persistForm("Formularstruktur");

  const handleSubmitForm = () => {
    if (!validateForm()) return;
    persistForm("Formular");
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 className="spin" size={24} />
        <span>Lade Prozess...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertCircle size={24} />
        <span>{error}</span>
        <button onClick={() => navigate(-1)}>Zurück</button>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="page-error">
        <AlertCircle size={24} />
        <span>Prozess nicht gefunden</span>
        <button onClick={() => navigate(-1)}>Zurück</button>
      </div>
    );
  }

  return (
    <div className="workflow-detail">
      <div className="detail-header">
        <button className="ghost-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Zurück
        </button>
        <div className="detail-title">
          <span className="workflow-id">#{process.process_id}</span>
          <h1>{process.name}</h1>
        </div>
        <div className={`workflow-status ${statusClass(process.status)}`}>
          {statusLabel(process.status)}
        </div>
      </div>

      {process.description && <p className="detail-description">{process.description}</p>}

      <div className="field-builder">
        <div className="builder-header">
          <h2>Formularfelder</h2>
          <p>Füge Felder aus dem Baukasten hinzu oder entferne sie wieder.</p>
        </div>

        <div className="builder-controls">
          <select
            value={fieldToAdd}
            onChange={(e) => setFieldToAdd(e.target.value)}
          >
            <option value="">Feld auswählen...</option>
            {availableDefinitions.map((def) => (
              <option key={def.id} value={def.id}>
                {def.label} ({def.type})
              </option>
            ))}
          </select>
          <button className="secondary-btn" onClick={addField} disabled={!fieldToAdd}>
            <Plus size={16} />
            Hinzufügen
          </button>
        </div>

        {selectedFields.length === 0 ? (
          <div className="placeholder-card">
            <p>Noch keine Felder ausgewählt.</p>
            <span>Wähle Felder aus dem Dropdown oben aus.</span>
          </div>
        ) : (
          <div className="field-grid">
            {selectedFields.map((field) => (
              <div key={field.id} className="field-card">
                <div className="field-card-header">
                  <div>
                    <p className="field-label">{field.label}</p>
                    <span className="field-meta">{field.type}</span>
                    {field.required && <span className="pill pill-required">Pflichtfeld</span>}
                    {field.validationPattern && (
                      <span className="pill pill-rule">Richtlinie aktiv</span>
                    )}
                  </div>
                  <button className="ghost-btn" onClick={() => removeField(field.id)}>
                    Entfernen
                  </button>
                </div>
                {field.description && <p className="field-description">{field.description}</p>}
                <div className="field-preview">
                  {renderInput(field, formValues[field.key], (val) =>
                    handleValueChange(field.key, val)
                  )}
                  {validation[field.key] && (
                    <p className="field-error">{validation[field.key]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="secondary-btn" onClick={handleSaveStructure} disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
          Struktur speichern
        </button>
        <button className="primary-btn" onClick={handleSubmitForm} disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
          Absenden & speichern
        </button>
      </div>

      {message && (
        <div className="inline-success">
          <Check size={16} /> {message}
        </div>
      )}
    </div>
  );
}

function renderInput(
  field: FormFieldDefinition,
  value: FormValue,
  onChange: (val: FormValue) => void
) {
  const commonProps = {
    id: field.key,
    name: field.key,
    required: field.required,
    placeholder: field.placeholder || "",
    value:
      typeof value === "number"
        ? value
        : value === undefined
          ? ""
          : String(value),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value),
  };

  switch (field.type) {
    case "textarea":
      return <textarea {...commonProps} rows={4} />;
    case "select":
      return (
        <select {...commonProps}>
          <option value="">Bitte wählen</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
      );
    case "number":
      return <input {...commonProps} type="number" />;
    case "password":
      return <input {...commonProps} type="password" autoComplete="new-password" />;
    case "email":
      return <input {...commonProps} type="email" autoComplete="email" />;
    default:
      return <input {...commonProps} type="text" />;
  }
}

export default WorkflowDetailPage;
