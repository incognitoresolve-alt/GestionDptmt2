import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import TabContent from './components/TabContent';

export default function App() {
  const [role, setRole] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('procedure');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) setRole('RESPONSABLE');
      else if (localStorage.getItem('guest_access')) setRole('EQUIPE');
      else setRole('NONE');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!role || role === 'NONE') return;
    const q = query(collection(db, 'departments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [role]);

  const isAdmin = role === 'RESPONSABLE';
  const activeDepts = departments.filter(d => !d.deletedAt);
  const activeDept = activeDepts.find(d => d.id === selectedId);

  const addDept = async () => {
    const n = prompt("Nom du département :");
    if (n && n.trim()) {
      await addDoc(collection(db, 'departments'), {
        name: n.trim(), procedure: '', checklist: [],
        reminders: [], pendingTasks: [], archives: [], createdAt: Date.now()
      });
    }
  };

  const deleteDept = async (id, e) => {
    e.stopPropagation();
    if (confirm("Archiver ce département ?")) {
      await updateDoc(doc(db, 'departments', id), { deletedAt: Date.now() });
      if (selectedId === id) setSelectedId(null);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('guest_access');
    setRole('NONE');
    setSelectedId(null);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-violet)' }}>
      <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: 2 }}>Chargement…</div>
    </div>
  );

  if (role === 'NONE') return <LoginScreen setRole={setRole} />;

  return (
    <div className="app">
      <button className="hamburger no-print" onClick={() => setMenuOpen(true)}>☰</button>
      <div className={`overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} style={{display: menuOpen ? 'block' : 'none', position: 'fixed', inset: 0, zIndex: 35, background: 'rgba(0,0,0,0.7)'}} />

      <Sidebar 
        isAdmin={isAdmin} activeDepts={activeDepts} selectedId={selectedId} 
        setSelectedId={setSelectedId} setActiveTab={setActiveTab} 
        menuOpen={menuOpen} setMenuOpen={setMenuOpen} 
        addDept={addDept} deleteDept={deleteDept} logout={logout} 
      />

      <main className="main">
        {selectedId === 'TRASH' ? (
          <TabContent type="TRASH" departments={departments} isAdmin={isAdmin} />
        ) : !activeDept ? (
          <div className="empty">
            <div className="empty-icon">📂</div>
            <h3>Aucun département sélectionné</h3>
          </div>
        ) : (
          <>
            <header className="main-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="dept-title">{activeDept.name}</span>
                {isAdmin && <span className="badge badge-violet" style={{color: 'var(--brand-violet)'}}>Admin</span>}
              </div>
              <div className="tabs">
                {['procedure', 'checklist', 'reminders', 'pending'].map(t => (
                  <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t === 'procedure' ? '📄 Procédure' : t === 'checklist' ? '✅ Checklist' : t === 'reminders' ? '🔔 Rappels' : '⏳ En cours'}
                  </button>
                ))}
              </div>
            </header>
            <div className="main-body">
              <TabContent type={activeTab} dept={activeDept} isAdmin={isAdmin} departments={departments} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
