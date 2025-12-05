# Design Notes — Die Kette e.V. themed dashboard

## Ziel

Dokumentation der optischen Anpassungen, die das Dashboard stilistisch an das CI von **Die Kette e.V.** anpassen, inkl. Sidebar-Verhalten und ikonischer Navigation.

## Farbgebung

- **Hintergrund**: `#0d0f12` (sehr dunkles Anthrazit)
- **Sekundär**: `#1a1d23` und `#25272d` zum Hervorheben von Header/Sidebar
- **Primärer Akzent**: `#2D6CA2` (Blau) für aktive Navigationspunkte
- **Sekundärer Akzent**: `#E5A823` (Gelb/Gold) für Logo-Töne und linke Markierung
- **Text**: `#ececf1` (hell) + `#c5c5d2` (muted)
- **Borders**: `#4d4d4d`

## Verhalten

1. **Collapsable Sidebar**

   - Standardbreite: 260px, im `closed`-Zustand 60px mit ikonischer Navigation
   - Toggle-Button (Menu-Icon) ist auch in der engen Ansicht mittig platziert
   - Logo verschwindet im geschlossenen Zustand, damit nur die Icons sichtbar bleiben

2. **Navigation**

   - Aktive Elemente: Farbige Hintergründe + goldene linke Linie
   - Im geschlossenen Zustand: 40×40px-Buttons, zentriert ausgerichtet

3. **Header**
   - Klar und kompakt: Titel + Send-Icon als Platzhalter für zukünftige Aktionen

## Technisches

- Basis: React-Komponente mit `sidebarOpen` State
- Lucide-Icons: `Zap`, `MessageSquare`, `Settings`, `Menu`, `Send`
- CSS-Variablen im `:root` für schnelle Farbanpassung
- `.sidebar.closed` steuert Verhalten der Header-/Nav-Elemente

## Nächste Schritte

1. Inhalte mit echten Workflows/Feedback-Daten füllen (Supabase-Anbindung)
2. Aktionen hinter dem Send-Button definieren (z. B. neue Workflows erstellen)
3. Mobil-Layout testen (Sidebar responsive zusammenklappbar)
