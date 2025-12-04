import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { userOperations, UserRow } from '../../services/supabaseService';
import { configService } from '../../services/configService';
import './DebugUserSwitcher.css';

export const DebugUserSwitcher: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nur im Debug-Modus anzeigen
  if (!configService.isDebugMode()) {
    return null;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userOperations.getAllUsers();
      setUsers(data);

      // Wenn noch kein User ausgewählt, wähle den ersten
      if (data.length > 0 && !selectedUserId) {
        const firstUserId = data[0].id;
        setSelectedUserId(firstUserId);
        localStorage.setItem('debug_selected_user', firstUserId);
      } else if (selectedUserId) {
        // Versuche den gespeicherten User zu laden
        const saved = localStorage.getItem('debug_selected_user');
        if (saved) {
          setSelectedUserId(saved);
        }
      }
    } catch (err) {
      console.error('Fehler beim Laden der Benutzer:', err);
      setError('Benutzer konnten nicht geladen werden');
      // Fallback: Wenn Supabase nicht verfügbar ist, leer lassen
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    localStorage.setItem('debug_selected_user', userId);
    setIsOpen(false);

    // Dispatch Event für andere Komponenten
    window.dispatchEvent(
      new CustomEvent('debugUserChanged', { detail: { userId } })
    );
  };

  const currentUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="debug-user-switcher">
      <button
        className="debug-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="DEBUG: Benutzer wechseln (nur im Debug-Modus)"
      >
        <span className="debug-label">🐛 User:</span>
        <span className="debug-value">
          {isLoading ? 'Lädt...' : currentUser?.email || 'Keine Auswahl'}
        </span>
        <ChevronDown size={16} className={isOpen ? 'open' : ''} />
      </button>

      {isOpen && (
        <div className="debug-dropdown">
          {error ? (
            <div className="debug-error">{error}</div>
          ) : isLoading ? (
            <div className="debug-loading">Lädt...</div>
          ) : users.length === 0 ? (
            <div className="debug-empty">Keine Benutzer gefunden</div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                className={`debug-user-option ${
                  selectedUserId === user.id ? 'active' : ''
                }`}
                onClick={() => handleSelectUser(user.id)}
              >
                <span className="user-email">{user.email}</span>
                {user.display_name && (
                  <span className="user-name">({user.display_name})</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
