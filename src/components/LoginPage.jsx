import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, Lock, User, KeyRound, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Iltimos, login va parolni kiriting!');
      return;
    }

    const res = login(username, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const fillQuickAcc = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="login-backdrop">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-icon">
            <Gamepad2 size={36} className="neon-icon" />
          </div>
          <h2>PS MANAGER <span className="logo-tag">PRO</span></h2>
          <p className="login-subtitle">Tizimga kirish uchun login va parolingizni kiriting</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><User size={16} /> Login:</label>
            <input
              type="text"
              placeholder="Masalan: admin yoki barmen1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label><KeyRound size={16} /> Parol:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login-submit">
            <Lock size={18} /> Tizimga Kirish
          </button>
        </form>

        <div className="quick-login-hints">
          <span className="hint-title">Tezkor Sinov Akkauntlari:</span>
          <div className="hint-buttons">
            <button
              type="button"
              className="btn-hint admin-hint"
              onClick={() => fillQuickAcc('admin', 'admin123')}
            >
              👑 Admin (admin / admin123)
            </button>
            <button
              type="button"
              className="btn-hint barmen-hint"
              onClick={() => fillQuickAcc('barmen1', 'barmen123')}
            >
              🍹 Barmen (barmen1 / barmen123)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
