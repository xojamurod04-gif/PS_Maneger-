import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MonitorPlay, AlertTriangle, UserCheck, LogOut } from 'lucide-react';

export const Header = () => {
  const {
    currentUser,
    logout,
    devices,
    activeSessions,
    products,
  } = useApp();

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
          <img src="/logo.png" alt="PS MANAGER Logo" className="logo-img" />
          <div>
            <h1 className="logo-title">
              <span className="logo-ps">PS</span> MANAGER
            </h1>
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
            <span>Ombor: <strong>{lowStockCount} ta</strong></span>
          </div>
        )}

        <div className="status-pill clock-pill">
          <span className="live-dot"></span>
          <span className="clock-text">{timeStr}</span>
        </div>
      </div>

      <div className="header-right">
        {/* User Info Pill */}
        <div className="user-info-pill">
          <UserCheck size={16} className="user-icon" />
          <div className="user-details">
            <span className="user-name">{currentUser?.full_name || currentUser?.username}</span>
            <span className="user-role-badge">
              {currentUser?.role === 'admin' ? '👑 Admin Paneli' : '🍹 Barmen Paneli'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="btn-logout" onClick={logout} title="Tizimdan chiqish">
          <LogOut size={18} />
          <span>Chiqish</span>
        </button>
      </div>
    </header>
  );
};
