import './MainContent.css'

interface MainContentProps {
  suchbegriff: string
}

function MainContent({ suchbegriff }: MainContentProps) {
  return (
    <main className="main-content" id="hauptbereich">
      {/* 
        PLATZHALTER FÜR ZUKÜNFTIGE INHALTE
        
        Dieser Bereich wird später folgende Inhalte darstellen:
        - Workflow-Übersichten
        - Formulare mit Live-Feedback (ähnlich Microsoft Forms)
        - Automatisch ausgefüllte Informationen via Webhooks (N8N)
        - Pipeline-Statusanzeigen
        
        Der Suchbegriff aus der Header-Suche wird hier verwendet,
        um Inhalte zu filtern (via Webhook-Integration).
      */}
      
      <div className="content-placeholder" id="content-platzhalter">
        <div className="placeholder-box">
          <h2 className="placeholder-titel">Hauptbereich</h2>
          <p className="placeholder-text">
            Willkommen bei BrainTestStudio
          </p>
          <p className="placeholder-beschreibung">
            Dieser Bereich wird später Ihre Workflows, Formulare und 
            Pipeline-Übersichten darstellen.
          </p>
          
          {suchbegriff && (
            <div className="such-info">
              <span className="such-label">Aktiver Filter:</span>
              <span className="such-wert">{suchbegriff}</span>
            </div>
          )}
          
          <div className="bereich-hinweise">
            <h3>Verfügbare Bereiche:</h3>
            <ul>
              <li><strong>Header-Bereich</strong> (#header-bereich) - Suchleiste oben</li>
              <li><strong>Hamburger-Menü</strong> (#hamburger-menu) - Oben links</li>
              <li><strong>Sidebar-Navigation</strong> (#sidebar-navigation) - Linke Seite</li>
              <li><strong>Hauptbereich</strong> (#hauptbereich) - Dieser Bereich</li>
              <li><strong>Content-Platzhalter</strong> (#content-platzhalter) - Inhaltsbereich</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainContent
