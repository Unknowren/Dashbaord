# BrainTestStudio - Copilot Anweisungen

## Projektübersicht
BrainTestStudio ist ein React-basiertes Workflow-Dashboard mit deutscher Benutzeroberfläche.

## Technologie-Stack
- React 18 mit TypeScript
- Vite als Build-Tool
- Lucide React für Icons
- CSS Modules für Styling

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

```
src/components/
├── Header/          → Header.tsx, Header.css
├── Sidebar/         → Sidebar.tsx, Sidebar.css
└── MainContent/     → MainContent.tsx, MainContent.css
```

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
