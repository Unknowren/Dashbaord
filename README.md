# BrainTestStudio - Workflow Dashboard

Ein responsives React-Dashboard für Workflow-Management, Feedback und Pipeline-Übersichten.

## 🚀 Features

- **Responsive Design**: Passt sich automatisch an verschiedene Bildschirmgrößen an
- **Deutsche Benutzeroberfläche**: Vollständig in Deutsch
- **Modulare Komponenten**: Einfach erweiterbar für zukünftige Features
- **Vorbereitet für Live-Updates**: Webhook-Integration über N8N möglich
- **Formular-Support**: Bereit für Live-Feedback wie bei Microsoft Forms

## 📁 Projektstruktur

```text
src/
├── components/
│   ├── Header/           # Header mit Suche und Hamburger-Menü
│   ├── Sidebar/          # Linke Navigationsleiste
│   └── MainContent/      # Hauptinhaltsbereich (Platzhalter)
├── App.tsx               # Hauptkomponente
├── App.css               # App-Layout Styles
├── index.css             # Globale Styles
└── main.tsx              # Einstiegspunkt
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

## 🛠️ Installation

```bash
npm install
```

## 🏃 Entwicklung starten

```bash
npm run dev
```

## 📦 Build erstellen

```bash
npm run build
```

## 🔮 Geplante Features

- [ ] Webhook-Integration über N8N
- [ ] Live-Formulare mit Echtzeit-Feedback
- [ ] Workflow-Pipeline-Übersicht
- [ ] Automatisch ausgefüllte Informationen
- [ ] Backend-Integration via Docker Container

## 🎨 Design

Das Dashboard verwendet ein graues Farbschema basierend auf dem ursprünglichen Entwurf:

- Header: Dunkelgrau (#8a8a8a)
- Sidebar: Mittelgrau (#9a9a9a)  
- Hauptbereich: Weiß (#ffffff)

## 📝 Lizenz

Privates Projekt
