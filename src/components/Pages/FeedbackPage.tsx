import { MessageSquare } from "lucide-react";

function FeedbackPage(): React.ReactNode {
  return (
    <div className="content-section">
      <h2>Feedback</h2>
      <p>Feedback-System für Benutzer (Platzhalter).</p>
      <div className="placeholder-card">
        <MessageSquare size={32} />
        <p>Hier können später Feedback-Workflows und Formulare entstehen.</p>
      </div>
    </div>
  );
}

export default FeedbackPage;
