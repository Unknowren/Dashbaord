# BrainTestStudio - Workflow Dashboard

Ein responsives React-Dashboard für Workflow-Management, Feedback und Pipeline-Übersichten.

## 🚀 Features

- **Responsive Design**: Passt sich automatisch an verschiedene Bildschirmgrößen an
- **Deutsche Benutzeroberfläche**: Vollständig in Deutsch
- **Modulare Komponenten**: Einfach erweiterbar für zukünftige Features
- **N8N Integration**: Workflow-Automatisierung mit Webhooks
- **Supabase Backend**: PostgreSQL Datenbank mit Auth und Realtime
- **Docker-basiert**: Einfaches Deployment und portables Setup

## 🐳 Schnellstart mit Docker

### Voraussetzungen
- Docker & Docker Compose installiert
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/Unknowren/Dashbaord.git
cd Dashbaord

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeite .env mit deinen Einstellungen

# Starten
./start.sh
```

### Zugriff auf Services

| Service | URL | Beschreibung |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | React Dashboard |
| N8N | http://localhost:5678 | Workflow Automation |
| Supabase Studio | http://localhost:3001 | Datenbank Admin |
| Supabase API | http://localhost:8000 | REST API |
| Ollama | http://localhost:11434 | Local LLM Engine |
| Zammad | http://localhost:8080 | Helpdesk & Ticketsystem |

### Stoppen

```bash
./stop.sh
```

## 📁 Projektstruktur

```text
├── src/                    # React Frontend
│   ├── components/         # UI Komponenten
│   └── ...
├── docker/                 # Docker Konfigurationen
│   ├── nginx/              # Nginx Webserver Config
│   ├── postgres/           # PostgreSQL Init Scripts
│   └── kong/               # Kong API Gateway Config
├── docker-data/            # Persistente Daten (nicht in Git!)
├── docker-compose.yml      # Docker Compose Konfiguration
├── Dockerfile              # Frontend Container Build
├── .env.example            # Beispiel-Umgebungsvariablen
└── .env                    # Lokale Umgebungsvariablen (nicht in Git!)
```

## 🏷️ Bereichs-IDs für Prompts

Für zukünftige Anpassungen können Sie sich auf folgende Bereiche beziehen:

| Bereich | ID | Beschreibung |
|---------|-----|--------------|
| Header | `#header-bereich` | Obere Leiste mit Suche |
| Hamburger-Menü | `#hamburger-menu` | Menü-Button oben links |
| Header-Suche | `#header-suche` | Suchfeld im Header |
| Sidebar | `#sidebar-navigation` | Linke Navigationsleiste |
| Hauptbereich | `#hauptbereich` | Zentraler Inhaltsbereich |
| Content-Platzhalter | `#content-platzhalter` | Platzhalter für Inhalte |

## 🛠️ Lokale Entwicklung (ohne Docker)

```bash
npm install
npm run dev
```

## 🔮 Geplante Features

- [x] Docker-basiertes Deployment
- [x] N8N Workflow Integration
- [x] Supabase Datenbank
- [x] Ollama Local LLM Integration
- [x] Zammad Helpdesk Integration
- [ ] Live-Formulare mit Echtzeit-Feedback
- [ ] Workflow-Pipeline-Übersicht
- [ ] Benutzerauthentifizierung

## 🤖 Ollama LLM Integration

Ollama ermöglicht die lokale Nutzung von großen Sprachmodellen ohne externe APIs. Die Modelle werden persistent in `./docker-data/ollama` gespeichert.

### Modelle verwalten

**Verfügbare Modelle anzeigen:**
```bash
docker exec brainstudio-ollama ollama list
```

**Neues Modell laden:**
```bash
# Mistral (klein, schnell, ~4GB)
docker exec brainstudio-ollama ollama pull mistral

# Llama 2 (größer, besser, ~7GB)
docker exec brainstudio-ollama ollama pull llama2

# Neural Chat (spezialisiert für Chat, ~5GB)
docker exec brainstudio-ollama ollama pull neural-chat

# OpenChat (leicht, ~4GB)
docker exec brainstudio-ollama ollama pull openchat
```

**Modell testen (Streaming Response):**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Erkläre Künstliche Intelligenz in 3 Sätzen",
  "stream": true
}' | jq '.'
```

**Modell löschen:**
```bash
docker exec brainstudio-ollama ollama rm mistral
```

**Modell-Speichernutzung prüfen:**
```bash
ls -lh ./docker-data/ollama/models/manifests/registry.ollama.ai/library/
```

### Integration mit N8N

In N8N kannst du Ollama über einen **HTTP Request Node** nutzen:

1. **Neuen HTTP Request Node erstellen**
2. **Konfiguration:**
   - Method: `POST`
   - URL: `http://ollama:11434/api/generate`

3. **Body (JSON):**

```json
{
  "model": "mistral",
  "prompt": "{{ $json.input }}",
  "stream": false
}
```

### Performance-Tipps

- **Kleine Modelle** (mistral, neural-chat): Schneller, weniger Speicher
- **Große Modelle** (llama2 13b): Bessere Qualität, länger Rechenzeit
- **GPU-Beschleunigung** auf macOS/Windows: Optional, Ollama nutzt CPU wenn kein GPU-Support

## 🎫 Zammad Helpdesk Integration

Zammad ist ein Open-Source-Helpdesk und Ticketsystem für Kundensupport und interne Anfragen.

### Erster Start

Beim ersten Start von Zammad dauert die Initialisierung einige Minuten. Zammad richtet automatisch die Datenbank ein und erstellt alle benötigten Tabellen.

**Status prüfen:**
```bash
docker logs -f brainstudio-zammad-init
```

**Warten bis die Initialisierung abgeschlossen ist, dann:**
```bash
docker compose up -d zammad-nginx
```

### Zammad Setup-Wizard

Nach dem ersten Start erreichst du den Setup-Wizard unter http://localhost:8080:

1. **Administrator erstellen**: E-Mail und Passwort festlegen
2. **Organisation konfigurieren**: Firmenname und Details eingeben
3. **E-Mail-Kanäle einrichten**: SMTP/IMAP für E-Mail-Tickets (optional)

### Zammad Container

Zammad besteht aus mehreren Services:

| Container | Funktion |
|-----------|----------|
| zammad-nginx | Webserver (Port 8080) |
| zammad-railsserver | Rails Application Server |
| zammad-websocket | WebSocket Server für Echtzeit-Updates |
| zammad-scheduler | Hintergrund-Jobs |
| zammad-postgresql | Zammad-Datenbank |
| zammad-elasticsearch | Volltextsuche |
| zammad-redis | Cache & Sessions |
| zammad-memcached | Object Caching |

### Integration mit N8N

Du kannst Zammad mit N8N über die REST API integrieren:

**API-Token erstellen:**
1. In Zammad einloggen → Admin-Bereich
2. System → API → Token erstellen

**N8N HTTP Request Node:**
- Method: `GET`
- URL: `http://zammad-nginx:8080/api/v1/tickets`
- Header: `Authorization: Token token=DEIN_API_TOKEN`

### Zammad neu starten

```bash
docker compose restart zammad-nginx zammad-railsserver zammad-websocket zammad-scheduler
```

### Zammad Logs anzeigen

```bash
docker logs -f brainstudio-zammad-railsserver
```

## 🎨 Design

Das Dashboard verwendet ein graues Farbschema basierend auf dem ursprünglichen Entwurf:

- Header: Dunkelgrau (#8a8a8a)
- Sidebar: Mittelgrau (#9a9a9a)
- Hauptbereich: Weiß (#ffffff)

## ⚠️ Wichtige Hinweise

- **`.env` niemals committen!** Enthält sensible Zugangsdaten
- **`docker-data/`** enthält persistente Daten und wird nicht committed
- Für Kollegen: `.env.example` kopieren und eigene Werte eintragen

## 📝 Lizenz

Privates Projekt
