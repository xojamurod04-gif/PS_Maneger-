import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatUZS, formatDuration, getElapsedSeconds, calculateTimeCost } from '../utils/formatters';
import { Gamepad2, Monitor, Crown, Play, ShoppingBag, Clock, PlusCircle } from 'lucide-react';
import { SessionModal } from './SessionModal';

export const BarmenView = () => {
  const { devices, activeSessions } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all', 'ps5', 'pc', 'vip'
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [, setTick] = useState(0);

  // Force re-render every second to update live timers & costs seamlessly
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredDevices = devices.filter((d) => {
    if (filterType === 'all') return true;
    return d.type === filterType;
  });

  const getDeviceIcon = (type) => {
    if (type === 'ps5') return <Gamepad2 size={24} className="device-icon ps5" />;
    if (type === 'pc') return <Monitor size={24} className="device-icon pc" />;
    return <Crown size={24} className="device-icon vip" />;
  };

  return (
    <div className="barmen-container">
      {/* Category filter bar */}
      <div className="filter-bar">
        <button
          className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Barchasi ({devices.length})
        </button>
        <button
          className={`filter-tab ${filterType === 'ps5' ? 'active' : ''}`}
          onClick={() => setFilterType('ps5')}
        >
          <Gamepad2 size={16} /> PlayStation 5 ({devices.filter((d) => d.type === 'ps5').length})
        </button>
        <button
          className={`filter-tab ${filterType === 'pc' ? 'active' : ''}`}
          onClick={() => setFilterType('pc')}
        >
          <Monitor size={16} /> PC Gaming ({devices.filter((d) => d.type === 'pc').length})
        </button>
        <button
          className={`filter-tab ${filterType === 'vip' ? 'active' : ''}`}
          onClick={() => setFilterType('vip')}
        >
          <Crown size={16} /> VIP Xonalar ({devices.filter((d) => d.type === 'vip').length})
        </button>
      </div>

      {/* Device Cards Grid */}
      <div className="devices-grid">
        {filteredDevices.map((device) => {
          const session = activeSessions[device.id];
          const isOccupied = device.status === 'occupied' && !!session;

          let elapsedSecs = 0;
          let timeCost = 0;
          let productsCost = 0;
          let totalCost = 0;
          let ordersCount = 0;

          if (isOccupied) {
            elapsedSecs = getElapsedSeconds(session.start_time);
            timeCost = calculateTimeCost(session.start_time, device.hourly_rate);
            productsCost = session.orders.reduce((acc, curr) => acc + curr.total_price, 0);
            totalCost = timeCost + productsCost;
            ordersCount = session.orders.reduce((acc, curr) => acc + curr.quantity, 0);
          }

          return (
            <div
              key={device.id}
              className={`device-card ${isOccupied ? 'occupied' : 'available'}`}
              onClick={() => setSelectedDevice(device)}
            >
              <div className="device-card-header">
                <div className="device-title-box">
                  {getDeviceIcon(device.type)}
                  <div>
                    <h3 className="device-name">{device.name}</h3>
                    <span className="device-rate">{formatUZS(device.hourly_rate)} / soat</span>
                  </div>
                </div>

                <span className={`status-badge ${isOccupied ? 'badge-occupied' : 'badge-available'}`}>
                  {isOccupied ? 'BAND' : "BO'SH"}
                </span>
              </div>

              {isOccupied ? (
                <div className="card-active-content">
                  <div className="timer-display">
                    <Clock size={16} className="pulse-icon" />
                    <span>{formatDuration(elapsedSecs)}</span>
                  </div>

                  <div className="cost-breakdown">
                    <div className="cost-row">
                      <span>Vaqt summasi:</span>
                      <strong>{formatUZS(timeCost)}</strong>
                    </div>
                    <div className="cost-row">
                      <span>Mahsulotlar:</span>
                      <strong>{formatUZS(productsCost)} ({ordersCount} ta)</strong>
                    </div>
                    <div className="cost-row total-row">
                      <span>Jami hisob:</span>
                      <strong className="total-amount">{formatUZS(totalCost)}</strong>
                    </div>
                  </div>

                  <button className="btn-manage-session">
                    <ShoppingBag size={16} /> Seans & Buyurtma Boshqarish
                  </button>
                </div>
              ) : (
                <div className="card-empty-content">
                  <p className="empty-hint">Stol bo'sh. Seans boshlash uchun bosing.</p>
                  <button className="btn-start-session">
                    <Play size={16} /> Seans Boshlash
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Session Modal */}
      {selectedDevice && (
        <SessionModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
};
