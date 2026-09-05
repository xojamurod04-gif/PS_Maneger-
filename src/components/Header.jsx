import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, LayoutDashboard, MonitorPlay, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { currentView, setCurrentView, devices, activeSessions, products, isConnectedToSupabase } = useApp();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = Object.keys(activeSessions).length;
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock_alert).length;

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo-box">
          <div className="logo-icon">
            <Gamepad2 size={28} className="neon-icon" />
          </div>
          <div>
            <h1 className="logo-title">PS MANAGER <span className="logo-tag">PRO</span></h1>
            <p className="logo-subtitle">Gaming Club & PC Lounge Boshqaruv Tizimi</p>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="status-pill active-pill">
          <MonitorPlay size={16} />
          <span>Band stollar: <strong>{activeCount} / {devices.length}</strong></span>
        </div>

        {lowStockCount > 0 && (
          <div className="status-pill warning-pill" title="Omborda kam qolgan mahsulotlar bor!">
            <AlertTriangle size={16} />
            <span>Ombor ogohlantirish: <strong>{lowStockCount} ta</strong></span>
          </div>
        )}

        <div className="status-pill clock-pill">
          <span className="live-dot"></span>
          <span className="clock-text">{timeStr}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${currentView === 'barmen' ? 'active' : ''}`}
            onClick={() => setCurrentView('barmen')}
          >
            <Gamepad2 size={18} />
            <span>Barmen Panel</span>
          </button>

          <button
            className={`toggle-btn ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            <LayoutDashboard size={18} />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
