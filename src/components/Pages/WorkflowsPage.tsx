import '../MainContent/MainContent.css'

interface WorkflowsPageProps {
  suchbegriff: string
}

function WorkflowsPage({ suchbegriff }: WorkflowsPageProps) {
  return (
    <main className="main-content" id="hauptbereich">
      <div className="content-placeholder" id="content-platzhalter">
        <div className="placeholder-box">
          <h2 className="placeholder-titel">Workflows</h2>
          <p className="placeholder-text">
            Willkommen bei BrainTestStudio
          </p>
          <p className="placeholder-beschreibung">
            Hier werden Ihre aktiven Workflows angezeigt und verwaltet.
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

export default WorkflowsPage
