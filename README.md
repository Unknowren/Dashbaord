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

In N8N Workflows kannst du Ollama nutzen:

```json
{
  "method": "POST",
  "url": "http://ollama:11434/api/generate",
  "body": {
    "model": "mistral",
    "prompt": "{{ $node.PreviousNode.json.input }}",
    "stream": false
  }
}
```

### Performance-Tipps

- **Kleine Modelle** (mistral, neural-chat): Schneller, weniger Speicher
- **Große Modelle** (llama2 13b): Bessere Qualität, länger Rechenzeit
- **GPU-Beschleunigung** auf macOS/Windows: Optional, Ollama nutzt CPU wenn kein GPU-Support

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
