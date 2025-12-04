import '../MainContent/MainContent.css'

interface EinstellungenPageProps {
  suchbegriff: string
}

function EinstellungenPage({ suchbegriff }: EinstellungenPageProps) {
  return (
    <main className="main-content" id="hauptbereich">
      <div className="content-placeholder" id="content-platzhalter">
        <div className="placeholder-box">
          <h2 className="placeholder-titel">Einstellungen</h2>
          <p className="placeholder-text">
            Willkommen bei BrainTestStudio
          </p>
          <p className="placeholder-beschreibung">
            Hier können Sie die Pipeline-Einstellungen konfigurieren.
          </p>
          
          {suchbegriff && (
            <div className="such-info">
              <span className="such-label">Aktiver Filter:</span>
              <span className="such-wert">{suchbegriff}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default EinstellungenPage
