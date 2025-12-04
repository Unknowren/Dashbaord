# BrainTestStudio - Implementierte Features

## ✅ Abgeschlossene Aufgaben

### 1. **Prozess-Tabelle in der Datenbank** ✓
- UUID als Primär-ID
- Integer `process_id` für menschenlesbare Identifizierung (1000, 1001, ...)
- JSONB-Feld für `form_configuration` (flexible Formulare)
- TEXT-Feld für `form_schema` (Quellcode speichern)
- Versionierung, Tags, Metadaten
- Automatische `created_at` und `updated_at`-Timestamps
- Status-Management (draft, active, paused, archived)
- Execution-Statistiken

### 2. **Benutzer- & Rollen-Management** ✓
- Neue Tabelle `brainstudio.users` mit:
  - Email, Display-Name
  - Rolle (FK zu `roles`)
  - Aktiv/Inaktiv Status
  - Flexible Metadaten (JSONB)
- Neue Tabelle `brainstudio.roles` mit:
  - Name, Beschreibung
  - Permissions-Array
- Verknüpfungstabelle `brainstudio.user_process_access` (später für granulare Permissions)
- Trigger für automatische `updated_at`-Aktualisierung
- Standard-Rollen vorinitialisiert: Admin, Editor, Viewer

### 3. **DEBUG-Modus Umgebungsvariable** ✓
- `VITE_DEBUG=true/false` in `.env`
- **Nur über .env + Neustart änderbar** (nicht über GUI)
- Frontend nutzt `import.meta.env.VITE_DEBUG`
- Zentraler Config-Service: `configService.isDebugMode()`
- Debug-Komponenten rendern sich nur bei `DEBUG=true`

### 4. **Debug User Switcher** ✓
- Dropdown-Fenster rechts neben der Suche im Header
- **Nur sichtbar wenn `VITE_DEBUG=true`**
- Zeigt alle Benutzer aus der Supabase-Datenbank
- Ermöglicht Live-Umschalten zwischen Benutzern
- Speichert Auswahl in `localStorage` über Sessions
- Dispatcht `debugUserChanged` Event für andere Komponenten
- Lädt alle Benutzer beim App-Start

### 5. **Einstellungen-Seite mit 3 Tabs** ✓

#### Tab 1: Prozesse
- Form zum Erstellen neuer Prozesse
- Felder: Name, Beschreibung, Kategorie, Form-Schema (JSON)
- Inline-Bearbeitung von existierenden Prozessen
- Delete-Funktion mit Bestätigung
- Grid-View aller Prozesse mit Karten-Design
- Process-ID Display

#### Tab 2: Benutzer
- Form zum Erstellen neuer Benutzer
- Felder: Email, Display-Name, Rollen-Auswahl
- Inline-Bearbeitung
- Delete-Funktion
- Tabellen-View mit Status-Badge (Aktiv/Inaktiv)
- Dropdown für Rollen-Auswahl

#### Tab 3: Rollen
- Form zum Erstellen neuer Rollen
- Felder: Name, Beschreibung, Berechtigungen (kommagetrennt)
- Inline-Bearbeitung
- Delete-Funktion
- Grid-View mit Permissions-List
- Standard-Rollen vorhanden (Admin, Editor, Viewer)

### 6. **Row Level Security (RLS)** ✓
- **Status: ALLOW-ALL für Testing**
- RLS aktiviert auf allen Tabellen:
  - `brainstudio.processes`
  - `brainstudio.users`
  - `brainstudio.roles`
  - `brainstudio.user_process_access`
- Policies für SELECT, INSERT, UPDATE, DELETE
- Alle Daten sind derzeit öffentlich sichtbar
- **Später: Schrittweise zu restrictiven Policies wechseln**

### 7. **Supabase Integration** ✓
- Client initialisiert mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`
- Zentrale Service-Datei: `supabaseService.ts`
- Operations exportiert für: Prozesse, Benutzer, Rollen
- Error-Handling in allen Funktionen

### 8. **Environment-Variablen** ✓
- `.env` mit Beispiel-Werten
- `.env.example` als Template für Kollegen
- VITE_-Präfix für Frontend-Variablen
- Docker-Backend-Variablen getrennt
- Dokumentation in Kommentaren

---

## 🔐 Sicherheits-Notizen

### Aktuell (Testing-Phase)
- **RLS ist auf ALLOW-ALL** konfiguriert
- **Kein Login erforderlich** für Frontend
- Alle Daten sind sichtbar für alle
- Debug-Modus nur lokal + nur mit .env Zugriff

### Zukünftig (Production)
- Umschalten zu restrictiven Policies
- Pro Benutzer nur seine Prozesse sichtbar
- Rollen-basierte Zugriffskontrolle
- Authentication implementieren
- Debug-Modus deaktiviert

---

## 📚 Wie man die Features nutzt

### DEBUG-Modus aktivieren
```bash
# In .env:
VITE_DEBUG=true

# App neu starten
npm run dev
```

### Neue Prozesse erstellen
1. Zu "Einstellungen" navigieren
2. Tab "Prozesse" öffnen
3. Form ausfüllen und "Speichern" klicken

### Neue Benutzer erstellen
1. Zu "Einstellungen" navigieren
2. Tab "Benutzer" öffnen
3. Email + Name eingeben, Rolle wählen, speichern

### Zwischen Benutzern wechseln (Debug)
1. DEBUG-Modus aktivieren (`VITE_DEBUG=true`)
2. Rechts neben der Suche auf Dropdown klicken
3. Einen Benutzer auswählen
4. Seite rendert sich mit Perspektive dieses Benutzers

---

## 🗄️ Datenbankstruktur

### Tabellen
- `brainstudio.processes` - Alle Prozesse/Workflows
- `brainstudio.users` - Alle Benutzer
- `brainstudio.roles` - Alle Rollen
- `brainstudio.user_process_access` - Berechtigungen (später)
- `brainstudio.workflows` - (Legacy, noch vorhanden)
- `brainstudio.feedback` - (Legacy, noch vorhanden)

### Sequences
- `brainstudio.processes_process_id_seq` - Auto-Increment für process_id (startet bei 1000)

### Indexes
- Auf `email`, `is_active`, `role_id`, `status`, `category`, etc.

---

## 🚀 Nächste Schritte

1. **RLS Policies restrictiv machen**
   - User kann nur seine Prozesse sehen
   - Admins sehen alles
   - Roles-basierte Permissions

2. **Echte Authentifizierung**
   - Supabase Auth integrieren
   - Login-Seite erstellen
   - Session-Management

3. **Webhook-Integration (N8N)**
   - Prozessausführung triggern
   - Ergebnisse zurück ins Dashboard

4. **Formular-Generator**
   - JSON-Schema zu HTML rendern
   - Validierung hinzufügen

5. **Benutzer-Prozess-Zuweisungen**
   - Welche Prozesse jeder Benutzer sehen kann
   - Welche er ausführen darf

---

## 📁 Dateistruktur

```
src/
├── services/
│   ├── configService.ts       # Environment-Variablen
│   └── supabaseService.ts     # Datenbank-Operationen
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── DebugUserSwitcher.tsx (NEW)
│   │   ├── DebugUserSwitcher.css (NEW)
│   │   └── Header.css
│   ├── Pages/
│   │   └── EinstellungenPage.tsx (UPDATED)
│   │   └── EinstellungenPage.css (NEW)
│   └── ...
├── App.tsx
└── ...

docker/
├── postgres/
│   └── init.sql               # (UPDATED - neue Tabellen)
└── ...

.env                           # (UPDATED - DEBUG Flag)
.env.example                   # (UPDATED - neue Variablen)
```

---

**Status**: ✅ Alle geplanten Features implementiert und getestet
**Git Push**: Erfolgreich (Commit b4c5b72)
