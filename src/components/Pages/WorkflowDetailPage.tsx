import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Send,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  getProcess,
  Process,
  ProcessFormConfiguration,
  saveProcessFormConfiguration,
} from "../../services/processService";
import { FormFieldDefinition } from "../../services/settingsService";
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
  const [formFields, setFormFields] = useState<FormFieldDefinition[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({});

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

        const proc = await getProcess(pid);
        setProcess(proc);

        // Lade die Formularfelder aus der Prozess-Konfiguration
        const config = (proc?.form_configuration || {
          fields: [],
          values: {},
        }) as ProcessFormConfiguration;

        setFormFields(config.fields || []);
        setFormValues((config.values as FormValues) || {});
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Prozesses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [processId]);

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

  const handleValueChange = (key: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const next: ValidationResult = {};
    formFields.forEach((field) => {
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
          console.warn(
            "Ungültiges Validierungs-Muster",
            field.validationPattern,
            e
          );
        }
      }
    });
    setValidation(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const pid = Number(processId);
      if (Number.isNaN(pid)) {
        throw new Error("Ungültige Prozess-ID");
      }

      const configuration: ProcessFormConfiguration = {
        fields: formFields,
        values: formValues,
      };

      await saveProcessFormConfiguration(pid, configuration);
      setMessage("Formular erfolgreich gespeichert");
    } catch (err) {
      console.error(err);
      setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 className="spin" size={24} />
        <span>Lade Workflow...</span>
      </div>
    );
  }

  if (error && !process) {
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
        <span>Workflow nicht gefunden</span>
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

      {process.description && (
        <p className="detail-description">{process.description}</p>
      )}

      <div className="form-container">
        <div className="form-header">
          <h2>Formular ausfüllen</h2>
          <p>Fülle die folgenden Felder aus und sende das Formular ab.</p>
        </div>

        {formFields.length === 0 ? (
          <div className="empty-form">
            <FileText size={48} />
            <h3>Keine Formularfelder konfiguriert</h3>
            <p>
              Für diesen Workflow wurden noch keine Formularfelder festgelegt.
              <br />
              Die Konfiguration erfolgt über die Einstellungsseite.
            </p>
          </div>
        ) : (
          <div className="form-fields">
            {formFields.map((field) => (
              <div key={field.id} className="form-field">
                <label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="required-mark">*</span>}
                </label>
                {field.description && (
                  <p className="field-hint">{field.description}</p>
                )}
                {renderInput(field, formValues[field.key], (val) =>
                  handleValueChange(field.key, val)
                )}
                {validation[field.key] && (
                  <p className="field-error">{validation[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {formFields.length > 0 && (
        <div className="form-actions">
          <button
            className="primary-btn"
            onClick={handleSubmitForm}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            Absenden
          </button>
        </div>
      )}

      {message && (
        <div className="inline-success">
          <Check size={16} /> {message}
        </div>
      )}

      {error && process && (
        <div className="inline-error">
          <AlertCircle size={16} /> {error}
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
    onChange: (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) =>
      onChange(
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value
      ),
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
      return (
        <input {...commonProps} type="password" autoComplete="new-password" />
      );
    case "email":
      return <input {...commonProps} type="email" autoComplete="email" />;
    default:
      return <input {...commonProps} type="text" />;
  }
}

export default WorkflowDetailPage;
