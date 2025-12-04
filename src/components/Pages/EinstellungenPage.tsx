import { useState, useEffect } from 'react'
import { Edit, Trash2, Save, X } from 'lucide-react'
import {
  processOperations,
  userOperations,
  roleOperations,
  ProcessRow,
  UserRow,
  RoleRow,
} from '../../services/supabaseService'
import '../MainContent/MainContent.css'
import './EinstellungenPage.css'

type Tab = 'prozesse' | 'benutzer' | 'rollen'

function EinstellungenPage(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>('prozesse')

  // Prozesse State
  const [prozesse, setProzesse] = useState<ProcessRow[]>([])
  const [editingProzess, setEditingProzess] = useState<Partial<ProcessRow> | null>(null)
  const [prozessForm, setProzessForm] = useState({
    name: '',
    description: '',
    category: '',
    form_schema: '',
  })

  // Benutzer State
  const [benutzer, setBenutzer] = useState<UserRow[]>([])
  const [editingBenutzer, setEditingBenutzer] = useState<Partial<UserRow> | null>(null)
  const [benutzerForm, setBenutzerForm] = useState({
    email: '',
    display_name: '',
    role_id: '',
  })

  // Rollen State
  const [rollen, setRollen] = useState<RoleRow[]>([])
  const [editingRolle, setEditingRolle] = useState<Partial<RoleRow> | null>(null)
  const [rolleForm, setRolleForm] = useState({
    name: '',
    description: '',
    permissions: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lade Daten beim Tab-Wechsel
  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab])

  const loadTabData = async (tab: Tab) => {
    try {
      setIsLoading(true)
      setError(null)

      if (tab === 'prozesse') {
        const data = await processOperations.getAllProcesses()
        setProzesse(data)
      } else if (tab === 'benutzer') {
        const data = await userOperations.getAllUsers()
        setBenutzer(data)
      } else if (tab === 'rollen') {
        const data = await roleOperations.getAllRoles()
        setRollen(data)
      }
    } catch (err) {
      console.error(`Fehler beim Laden von ${tab}:`, err)
      setError(`Fehler beim Laden von ${tab}: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // PROZESS FUNKTIONEN
  // ============================================

  const handleSaveProzess = async () => {
    try {
      if (!prozessForm.name.trim()) {
        setError('Prozessname ist erforderlich')
        return
      }

      if (editingProzess?.process_id) {
        // Update
        await processOperations.updateProcess(editingProzess.process_id, {
          name: prozessForm.name,
          description: prozessForm.description,
          category: prozessForm.category,
          form_schema: prozessForm.form_schema,
        })
      } else {
        // Create
        await processOperations.createProcess({
          name: prozessForm.name,
          description: prozessForm.description,
          category: prozessForm.category,
          form_schema: prozessForm.form_schema,
          form_configuration: {},
          status: 'draft',
          is_active: true,
          creator_id: null,
          execution_count: 0,
          last_executed_at: null,
          version: 1,
          tags: [],
          metadata: {},
        })
      }

      setProzessForm({ name: '', description: '', category: '', form_schema: '' })
      setEditingProzess(null)
      loadTabData('prozesse')
    } catch (err) {
      setError(`Fehler beim Speichern: ${err}`)
    }
  }

  const handleDeleteProzess = async (processId: number) => {
    if (confirm('Prozess wirklich löschen?')) {
      try {
        await processOperations.deleteProcess(processId)
        loadTabData('prozesse')
      } catch (err) {
        setError(`Fehler beim Löschen: ${err}`)
      }
    }
  }

  const handleEditProzess = (prozess: ProcessRow) => {
    setEditingProzess(prozess)
    setProzessForm({
      name: prozess.name,
      description: prozess.description || '',
      category: prozess.category || '',
      form_schema: prozess.form_schema || '',
    })
  }

  // ============================================
  // BENUTZER FUNKTIONEN
  // ============================================

  const handleSaveBenutzer = async () => {
    try {
      if (!benutzerForm.email.trim()) {
        setError('Email ist erforderlich')
        return
      }

      if (editingBenutzer?.id) {
        // Update
        await userOperations.updateUser(editingBenutzer.id, {
          email: benutzerForm.email,
          display_name: benutzerForm.display_name,
          role_id: benutzerForm.role_id as any,
        })
      } else {
        // Create
        await userOperations.createUser({
          email: benutzerForm.email,
          display_name: benutzerForm.display_name,
          role_id: benutzerForm.role_id as any,
          is_active: true,
          metadata: {},
        })
      }

      setBenutzerForm({ email: '', display_name: '', role_id: '' })
      setEditingBenutzer(null)
      loadTabData('benutzer')
    } catch (err) {
      setError(`Fehler beim Speichern: ${err}`)
    }
  }

  const handleDeleteBenutzer = async (userId: string) => {
    if (confirm('Benutzer wirklich löschen?')) {
      try {
        await userOperations.deleteUser(userId)
        loadTabData('benutzer')
      } catch (err) {
        setError(`Fehler beim Löschen: ${err}`)
      }
    }
  }

  const handleEditBenutzer = (user: UserRow) => {
    setEditingBenutzer(user)
    setBenutzerForm({
      email: user.email,
      display_name: user.display_name || '',
      role_id: user.role_id || '',
    })
  }

  // ============================================
  // ROLLEN FUNKTIONEN
  // ============================================

  const handleSaveRolle = async () => {
    try {
      if (!rolleForm.name.trim()) {
        setError('Rollenname ist erforderlich')
        return
      }

      const permissions = rolleForm.permissions
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      if (editingRolle?.id) {
        // Update
        await roleOperations.updateRole(editingRolle.id, {
          name: rolleForm.name,
          description: rolleForm.description,
          permissions,
        })
      } else {
        // Create
        await roleOperations.createRole({
          name: rolleForm.name,
          description: rolleForm.description,
          permissions,
        })
      }

      setRolleForm({ name: '', description: '', permissions: '' })
      setEditingRolle(null)
      loadTabData('rollen')
    } catch (err) {
      setError(`Fehler beim Speichern: ${err}`)
    }
  }

  const handleDeleteRolle = async (roleId: string) => {
    if (confirm('Rolle wirklich löschen?')) {
      try {
        await roleOperations.deleteRole(roleId)
        loadTabData('rollen')
      } catch (err) {
        setError(`Fehler beim Löschen: ${err}`)
      }
    }
  }

  const handleEditRolle = (rolle: RoleRow) => {
    setEditingRolle(rolle)
    setRolleForm({
      name: rolle.name,
      description: rolle.description || '',
      permissions: rolle.permissions.join(', '),
    })
  }

  return (
    <main className="main-content einstellungen-main" id="hauptbereich">
      <div className="einstellungen-container">
        <h1>Einstellungen & Verwaltung</h1>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'prozesse' ? 'active' : ''}`}
            onClick={() => setActiveTab('prozesse')}
          >
            Prozesse
          </button>
          <button
            className={`tab-btn ${activeTab === 'benutzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('benutzer')}
          >
            Benutzer
          </button>
          <button
            className={`tab-btn ${activeTab === 'rollen' ? 'active' : ''}`}
            onClick={() => setActiveTab('rollen')}
          >
            Rollen
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Lädt...</div>
        ) : (
          <>
            {/* PROZESSE TAB */}
            {activeTab === 'prozesse' && (
              <div className="tab-content">
                <div className="form-section">
                  <h2>{editingProzess ? 'Prozess bearbeiten' : 'Neuer Prozess'}</h2>
                  <div className="form-group">
                    <label>Prozessname *</label>
                    <input
                      type="text"
                      value={prozessForm.name}
                      onChange={(e) =>
                        setProzessForm({ ...prozessForm, name: e.target.value })
                      }
                      placeholder="z.B. Kundenumfrage"
                    />
                  </div>

                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      value={prozessForm.description}
                      onChange={(e) =>
                        setProzessForm({ ...prozessForm, description: e.target.value })
                      }
                      placeholder="Detaillierte Beschreibung des Prozesses"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Kategorie</label>
                    <input
                      type="text"
                      value={prozessForm.category}
                      onChange={(e) =>
                        setProzessForm({ ...prozessForm, category: e.target.value })
                      }
                      placeholder="z.B. Befragung"
                    />
                  </div>

                  <div className="form-group">
                    <label>Form-Schema (JSON)</label>
                    <textarea
                      value={prozessForm.form_schema}
                      onChange={(e) =>
                        setProzessForm({ ...prozessForm, form_schema: e.target.value })
                      }
                      placeholder='{"fields": []}'
                      rows={5}
                      className="code-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSaveProzess}>
                      <Save size={18} /> Speichern
                    </button>
                    {editingProzess && (
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditingProzess(null)
                          setProzessForm({
                            name: '',
                            description: '',
                            category: '',
                            form_schema: '',
                          })
                        }}
                      >
                        <X size={18} /> Abbrechen
                      </button>
                    )}
                  </div>
                </div>

                <div className="list-section">
                  <h2>Alle Prozesse ({prozesse.length})</h2>
                  <div className="items-grid">
                    {prozesse.map((prozess) => (
                      <div key={prozess.process_id} className="item-card">
                        <div className="item-header">
                          <h3>{prozess.name}</h3>
                          <span className="process-id">#{prozess.process_id}</span>
                        </div>
                        <p className="item-description">{prozess.description}</p>
                        {prozess.category && <span className="item-badge">{prozess.category}</span>}
                        <div className="item-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditProzess(prozess)}
                          >
                            <Edit size={16} /> Bearbeiten
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteProzess(prozess.process_id)}
                          >
                            <Trash2 size={16} /> Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BENUTZER TAB */}
            {activeTab === 'benutzer' && (
              <div className="tab-content">
                <div className="form-section">
                  <h2>{editingBenutzer ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}</h2>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={benutzerForm.email}
                      onChange={(e) =>
                        setBenutzerForm({ ...benutzerForm, email: e.target.value })
                      }
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Anzeigename</label>
                    <input
                      type="text"
                      value={benutzerForm.display_name}
                      onChange={(e) =>
                        setBenutzerForm({ ...benutzerForm, display_name: e.target.value })
                      }
                      placeholder="Max Mustermann"
                    />
                  </div>

                  <div className="form-group">
                    <label>Rolle</label>
                    <select
                      value={benutzerForm.role_id}
                      onChange={(e) =>
                        setBenutzerForm({ ...benutzerForm, role_id: e.target.value })
                      }
                    >
                      <option value="">-- Keine Rolle --</option>
                      {rollen.map((rolle) => (
                        <option key={rolle.id} value={rolle.id}>
                          {rolle.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSaveBenutzer}>
                      <Save size={18} /> Speichern
                    </button>
                    {editingBenutzer && (
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditingBenutzer(null)
                          setBenutzerForm({ email: '', display_name: '', role_id: '' })
                        }}
                      >
                        <X size={18} /> Abbrechen
                      </button>
                    )}
                  </div>
                </div>

                <div className="list-section">
                  <h2>Alle Benutzer ({benutzer.length})</h2>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benutzer.map((user) => (
                        <tr key={user.id}>
                          <td>{user.email}</td>
                          <td>{user.display_name || '-'}</td>
                          <td>
                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                              {user.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-edit"
                              onClick={() => handleEditBenutzer(user)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteBenutzer(user.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ROLLEN TAB */}
            {activeTab === 'rollen' && (
              <div className="tab-content">
                <div className="form-section">
                  <h2>{editingRolle ? 'Rolle bearbeiten' : 'Neue Rolle'}</h2>
                  <div className="form-group">
                    <label>Rollenname *</label>
                    <input
                      type="text"
                      value={rolleForm.name}
                      onChange={(e) =>
                        setRolleForm({ ...rolleForm, name: e.target.value })
                      }
                      placeholder="z.B. Editor"
                    />
                  </div>

                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      value={rolleForm.description}
                      onChange={(e) =>
                        setRolleForm({ ...rolleForm, description: e.target.value })
                      }
                      placeholder="Was kann diese Rolle tun?"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Berechtigungen (kommagetrennt)</label>
                    <textarea
                      value={rolleForm.permissions}
                      onChange={(e) =>
                        setRolleForm({ ...rolleForm, permissions: e.target.value })
                      }
                      placeholder="create_process, edit_process, view_process"
                      rows={4}
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSaveRolle}>
                      <Save size={18} /> Speichern
                    </button>
                    {editingRolle && (
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditingRolle(null)
                          setRolleForm({ name: '', description: '', permissions: '' })
                        }}
                      >
                        <X size={18} /> Abbrechen
                      </button>
                    )}
                  </div>
                </div>

                <div className="list-section">
                  <h2>Alle Rollen ({rollen.length})</h2>
                  <div className="items-grid">
                    {rollen.map((rolle) => (
                      <div key={rolle.id} className="item-card role-card">
                        <div className="item-header">
                          <h3>{rolle.name}</h3>
                        </div>
                        <p className="item-description">{rolle.description}</p>
                        {rolle.permissions.length > 0 && (
                          <div className="permissions-list">
                            <strong>Berechtigungen:</strong>
                            <ul>
                              {rolle.permissions.map((perm, idx) => (
                                <li key={idx}>{perm}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="item-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditRolle(rolle)}
                          >
                            <Edit size={16} /> Bearbeiten
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteRolle(rolle.id)}
                          >
                            <Trash2 size={16} /> Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default EinstellungenPage
