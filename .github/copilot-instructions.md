# BrainTestStudio - Copilot Anweisungen

## Projektübersicht
BrainTestStudio ist ein React-basiertes Workflow-Dashboard mit deutscher Benutzeroberfläche.
Das Projekt läuft in einer Docker-Umgebung mit N8N und Supabase.

## Technologie-Stack
- React 18 mit TypeScript
- Vite als Build-Tool
- Lucide React für Icons
- CSS (keine CSS Modules)
- Docker Compose für Deployment
- N8N für Workflow-Automatisierung
- Supabase (PostgreSQL) als Datenbank
- Nginx als Webserver

## Docker Services

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend | 3000 | React Dashboard (Nginx) |
| N8N | 5678 | Workflow Automation |
| Supabase Studio | 3001 | Datenbank Admin UI |
| Supabase API | 8000 | REST API (Kong Gateway) |
| PostgreSQL | 5432 | Datenbank |

## Bereichs-Referenzen

Bei Änderungen können folgende IDs verwendet werden:

- `#header-bereich` - Die obere Header-Leiste
- `#hamburger-menu` - Das Hamburger-Menü oben links
- `#header-suche` - Das Suchfeld im Header
- `#sidebar-navigation` - Die linke Navigationsleiste
- `#nav-workflows` - Navigation: Workflows
- `#nav-feedback` - Navigation: Feedback  
- `#nav-einstellungen` - Navigation: Einstellungen
- `#hauptbereich` - Der zentrale Inhaltsbereich
- `#content-platzhalter` - Der Platzhalter für zukünftige Inhalte

## Komponenten-Struktur

```text
src/components/
├── Header/          → Header.tsx, Header.css
├── Sidebar/         → Sidebar.tsx, Sidebar.css
└── MainContent/     → MainContent.tsx, MainContent.css
```

## Docker-Struktur

```text
docker/
├── nginx/           → Webserver Konfiguration
├── postgres/        → Datenbank Init-Skripte
└── kong/            → API Gateway Konfiguration
```

## Wichtige Dateien

- `.env` - Umgebungsvariablen (NICHT in Git!)
- `.env.example` - Vorlage für Kollegen
- `docker-compose.yml` - Container Orchestrierung
- `docker-data/` - Persistente Daten (NICHT in Git!)

## Coding-Konventionen

- Alle UI-Texte auf Deutsch
- CSS-Variablen in index.css definiert
- Komponenten sind funktional mit TypeScript
- Props-Interfaces für Type-Safety

## Zukünftige Integrationen

- Webhooks über N8N für Live-Daten
- Formulare mit Live-Feedback
- Docker-basiertes Backend

## Entwicklungsbefehle

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktions-Build erstellen
- `npm run preview` - Build-Vorschau
