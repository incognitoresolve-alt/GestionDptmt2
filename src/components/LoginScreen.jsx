import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ setRole }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { 
      await signInWithEmailAndPassword(auth, email, pass); 
    } catch (err) { 
      setError('Email ou mot de passe incorrect.'); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">G-Dept <span>Pro</span></div>
        <button className="btn-guest" onClick={() => { localStorage.setItem('guest_access', 'EQUIPE'); setRole('EQUIPE'); }}>👥 Accès Équipe</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Responsable</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <form onSubmit={login}>
          <input className="login-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="login-field" type="password" placeholder="Mot de passe" value={pass} onChange={e => setPass(e.target.value)} required />
          {error && <div style={{color: '#fca5a5', fontSize: '12px', marginTop: '8px'}}>{error}</div>}
          <button className="login-submit" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        </form>
      </div>
    </div>
  );
}
