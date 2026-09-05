import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUZS, formatDateTime, formatDuration, getElapsedSeconds, calculateTimeCost } from '../utils/formatters';
import {
  TrendingUp,
  Package,
  Monitor,
  History,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Banknote,
  CreditCard,
  Smartphone,
  Search,
  RefreshCw,
  Users,
  PowerOff,
  Clock,
  ShieldCheck,
  UserPlus,
  UserX,
  Laptop,
} from 'lucide-react';

export const AdminView = () => {
  const {
    usersList,
    activeLogins,
    kickUserLoginSession,
    addBarmen,
    updateBarmen,
    deleteBarmen,
    products,
    devices,
    activeSessions,
    completedSessions,
    adminForceEndSession,
    addProduct,
    restockProduct,
    updateDeviceRate,
    addDevice,
  } = useApp();

  const [activeTab, setActiveTab] = useState('security'); // 'security' | 'live_devices' | 'users' | 'reports' | 'inventory' | 'devices' | 'history'

  // Modals state
  const [showAddBarmenModal, setShowAddBarmenModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null); // user object

  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(null); // productId
  const [restockQty, setRestockQty] = useState('');
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  // Add Barmen Form state
  const [newBarmen, setNewBarmen] = useState({
    username: '',
    password: '',
    full_name: '',
  });

  // Edit Barmen Form state
  const [editBarmenData, setEditBarmenData] = useState({
    username: '',
    password: '',
    full_name: '',
  });

  // Add Product Form state
  const [newProd, setNewProd] = useState({
    name: '',
    category_name: 'Ichimliklar',
    price: '',
    stock: '',
    min_stock_alert: 5,
  });

  // Add Device Form state
  const [newDev, setNewDev] = useState({
    name: '',
    type: 'ps5',
    hourly_rate: 25000,
  });

  // Analytics calculations
  const totalRevenue = completedSessions.reduce((acc, s) => acc + (s.total_amount || 0), 0);
  const totalTimeRevenue = completedSessions.reduce((acc, s) => acc + (s.time_cost || 0), 0);
  const totalProductsRevenue = completedSessions.reduce((acc, s) => acc + (s.products_cost || 0), 0);

  const cashRevenue = completedSessions
    .filter((s) => s.payment_method === 'cash')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const cardRevenue = completedSessions
    .filter((s) => s.payment_method === 'card')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const clickRevenue = completedSessions
    .filter((s) => s.payment_method === 'click')
    .reduce((acc, s) => acc + s.total_amount, 0);

  // Search filter for inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.category_name.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock_alert);

  // Handlers
  const handleAddBarmenSubmit = async (e) => {
    e.preventDefault();
    if (!newBarmen.username || !newBarmen.password || !newBarmen.full_name) return;
    const ok = await addBarmen(newBarmen.username, newBarmen.password, newBarmen.full_name);
    if (ok) {
      setShowAddBarmenModal(false);
      setNewBarmen({ username: '', password: '', full_name: '' });
    }
  };

  const handleEditBarmenSubmit = async (e) => {
    e.preventDefault();
    if (!editUserModal || !editBarmenData.username || !editBarmenData.password) return;
    await updateBarmen(editUserModal.id, editBarmenData.username, editBarmenData.password, editBarmenData.full_name);
    setEditUserModal(null);
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.stock) return;
    addProduct(newProd);
    setShowAddProdModal(false);
    setNewProd({ name: '', category_name: 'Ichimliklar', price: '', stock: '', min_stock_alert: 5 });
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!showRestockModal || !restockQty) return;
    restockProduct(showRestockModal, restockQty);
    setShowRestockModal(null);
    setRestockQty('');
  };

  const handleAddDeviceSubmit = (e) => {
    e.preventDefault();
    if (!newDev.name || !newDev.hourly_rate) return;
    addDevice(newDev);
    setShowAddDeviceModal(false);
    setNewDev({ name: '', type: 'ps5', hourly_rate: 25000 });
  };

  const activeLoginCount = activeLogins.filter((l) => l.status === 'active').length;

  return (
    <div className="admin-container">
      {/* Navigation tabs */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={18} /> Faol Kirishlar & Xavfsizlik ({activeLoginCount})
        </button>

        <button
          className={`admin-tab ${activeTab === 'live_devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('live_devices')}
        >
          <Monitor size={18} /> Ulangan Kompyuterlar (Live) ({Object.keys(activeSessions).length})
        </button>

        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Barmen Akkauntlari ({usersList.filter((u) => u.role === 'barmen').length})
        </button>

        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <TrendingUp size={18} /> Hisobotlar & Foyda
        </button>

        <button
          className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={18} /> Ombor Qoldig'i ({products.length})
          {lowStockProducts.length > 0 && (
            <span className="tab-badge-warning">{lowStockProducts.length}</span>
          )}
        </button>

        <button
          className={`admin-tab ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          <Monitor size={18} /> Tariflar va Xonalar ({devices.length})
        </button>

        <button
          className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} /> Seanslar Tarixi ({completedSessions.length})
        </button>
      </div>

      {/* 1. SECURITY & ACTIVE USER LOGINS MONITOR TAB */}
      {activeTab === 'security' && (
        <div className="admin-content-section">
          <div className="section-toolbar">
            <div>
              <h3>Faol Tizim Kirishlari va Xavfsizlik Nazorati (Security Sessions)</h3>
              <p className="sub-text">
                Tizimga turli kompyuter va brauzerlardan ulangan barcha foydalanuvchilar. Ruxsatsiz yoki shubhali ulangan akkauntlarni masofadan chiqarib yuborishingiz mumkin.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Roli</th>
                  <th>Qurilma / Brauzer</th>
                  <th>Kirgan Vaqti</th>
                  <th>Holati</th>
                  <th>Amal (Xavfsizlik)</th>
                </tr>
              </thead>
              <tbody>
                {activeLogins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">Tizimda hozircha aktiv kirish seanslari mavjud emas.</td>
                  </tr>
                ) : (
                  activeLogins.map((login) => {
                    const isActive = login.status === 'active';
                    return (
                      <tr key={login.id} className={!isActive ? 'row-out' : ''}>
                        <td className="font-semibold">
                          <span className="user-name-tag">{login.username}</span>
                        </td>
                        <td>
                          <span className={`role-badge ${login.role}`}>
                            {login.role === 'admin' ? '👑 Admin' : '🍹 Barmen'}
                          </span>
                        </td>
                        <td>
                          <div className="device-info-cell">
                            <Laptop size={16} />
                            <span>{login.device_info}</span>
                          </div>
                        </td>
                        <td>{formatDateTime(login.login_time)}</td>
                        <td>
                          <span className={`status-tag ${isActive ? 'tag-good' : 'tag-out'}`}>
                            {isActive ? 'FAOL (ONLINE)' : 'CHIQARILGAN (KICKED)'}
                          </span>
                        </td>
                        <td>
                          {isActive ? (
                            <button
                              className="btn-kick-user"
                              onClick={() => kickUserLoginSession(login.id)}
                            >
                              <UserX size={16} /> Tizimdan Majburiy Chiqarish (Kick)
                            </button>
                          ) : (
                            <span className="sub-text">Chiqarilgan</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LIVE CONNECTED COMPUTERS & REMOTE CONTROL TAB */}
      {activeTab === 'live_devices' && (
        <div className="admin-content-section">
          <div className="section-toolbar">
            <div>
              <h3>Ulangan Kompyuterlar Jonli Nazorati</h3>
              <p className="sub-text">Barmen panelidagi barcha faol kompyuterlar va ularning jonli hisoblari</p>
            </div>
          </div>

          <div className="live-devices-grid">
            {devices.map((device) => {
              const session = activeSessions[device.id];
              const isOccupied = device.status === 'occupied' && !!session;

              let elapsedSecs = 0;
              let timeCost = 0;
              let productsCost = 0;
              let totalCost = 0;

              if (isOccupied) {
                elapsedSecs = getElapsedSeconds(session.start_time);
                timeCost = calculateTimeCost(session.start_time, device.hourly_rate);
                productsCost = session.orders.reduce((acc, curr) => acc + curr.total_price, 0);
                totalCost = timeCost + productsCost;
              }

              return (
                <div key={device.id} className={`live-dev-card ${isOccupied ? 'active' : 'idle'}`}>
                  <div className="live-card-head">
                    <div className="live-dev-name">
                      <h4>{device.name}</h4>
                      <span className="live-dev-rate">{formatUZS(device.hourly_rate)}/soat</span>
                    </div>
                    <span className={`status-pill-small ${isOccupied ? 'occupied' : 'available'}`}>
                      {isOccupied ? 'ULANGAN (BAND)' : 'BO\'SH'}
                    </span>
                  </div>

                  {isOccupied ? (
                    <div className="live-card-body">
                      <div className="live-timer-row">
                        <Clock size={16} className="pulse-icon" />
                        <span className="timer-text">{formatDuration(elapsedSecs)}</span>
                      </div>

                      <div className="live-cost-info">
                        <div>Vaqt summasi: <strong>{formatUZS(timeCost)}</strong></div>
                        <div>Mahsulotlar: <strong>{formatUZS(productsCost)}</strong></div>
                        <div className="live-total-row">Jami: <strong>{formatUZS(totalCost)}</strong></div>
                      </div>

                      {session.orders.length > 0 && (
                        <div className="live-orders-summary">
                          <span>Buyurtmalar:</span>
                          {session.orders.map((o, idx) => (
                            <span key={idx} className="order-pill-tag">
                              {o.product_name} x{o.quantity}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        className="btn-remote-disconnect"
                        onClick={() => adminForceEndSession(device.id)}
                      >
                        <PowerOff size={16} /> Masofadan Seansni O'chirish
                      </button>
                    </div>
                  ) : (
                    <div className="live-card-empty">
                      <p>Hozirda seans ketmayapti.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BARMEN USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="admin-content-section">
          <div className="section-toolbar">
            <div>
              <h3>Barmen Akkauntlari va Tizim Foydalanuvchilari</h3>
              <p className="sub-text">Barmenlar uchun login va parollarni yaratish, tahrirlash hamda o'chirish</p>
            </div>
            <button className="btn-add-primary" onClick={() => setShowAddBarmenModal(true)}>
              <UserPlus size={18} /> Yangi Barmen Qo'shish
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>F.I.SH (Ismi)</th>
                  <th>Login</th>
                  <th>Parol</th>
                  <th>Roli</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id}>
                    <td className="font-semibold">{user.full_name}</td>
                    <td><span className="user-name-tag">{user.username}</span></td>
                    <td><code>{user.password}</code></td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '👑 Admin' : '🍹 Barmen'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="btn-edit-user"
                          onClick={() => {
                            setEditUserModal(user);
                            setEditBarmenData({
                              username: user.username,
                              password: user.password,
                              full_name: user.full_name,
                            });
                          }}
                        >
                          <Edit2 size={14} /> Tahrirlash
                        </button>

                        {user.role !== 'admin' && (
                          <button
                            className="btn-delete-user"
                            onClick={() => {
                              if (window.confirm(`"${user.full_name}" barmen akkauntini o'chirmoqchimisiz?`)) {
                                deleteBarmen(user.id);
                              }
                            }}
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL REPORTS & ANALYTICS TAB */}
      {activeTab === 'reports' && (
        <div className="admin-content-section">
          <div className="kpi-grid">
            <div className="kpi-card total-kpi">
              <div className="kpi-header">
                <span>Jami Tushum / Foyda</span>
                <TrendingUp size={22} className="kpi-icon" />
              </div>
              <div className="kpi-val">{formatUZS(totalRevenue)}</div>
              <p className="kpi-desc">Barcha yakunlangan seanslar bo'yicha jami summasi</p>
            </div>

            <div className="kpi-card time-kpi">
              <div className="kpi-header">
                <span>Vaqt Tushumi</span>
                <Monitor size={22} className="kpi-icon" />
              </div>
              <div className="kpi-val">{formatUZS(totalTimeRevenue)}</div>
              <p className="kpi-desc">Kompyuter va PS5 stollari soatlik to'lovlari</p>
            </div>

            <div className="kpi-card prod-kpi">
              <div className="kpi-header">
                <span>Mahsulotlar Foydasi</span>
                <Package size={22} className="kpi-icon" />
              </div>
              <div className="kpi-val">{formatUZS(totalProductsRevenue)}</div>
              <p className="kpi-desc">Ichimlik va sneklar sotuvidan tushgan mablag'</p>
            </div>
          </div>

          <div className="payment-breakdown-section">
            <h3>To'lov Turlari Bo'yicha Tahlil</h3>
            <div className="payment-cards-grid">
              <div className="pay-card cash">
                <div className="pay-title"><Banknote size={20} /> Naqd Pul</div>
                <div className="pay-amount">{formatUZS(cashRevenue)}</div>
              </div>

              <div className="pay-card card">
                <div className="pay-title"><CreditCard size={20} /> Plastik Karta</div>
                <div className="pay-amount">{formatUZS(cardRevenue)}</div>
              </div>

              <div className="pay-card click">
                <div className="pay-title"><Smartphone size={20} /> Click / Payme</div>
                <div className="pay-amount">{formatUZS(clickRevenue)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INVENTORY & STOCK MANAGEMENT TAB */}
      {activeTab === 'inventory' && (
        <div className="admin-content-section">
          <div className="section-toolbar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Ombordan mahsulot qidirish..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>

            <button className="btn-add-primary" onClick={() => setShowAddProdModal(true)}>
              <Plus size={18} /> Yangi Mahsulot Qo'shish
            </button>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="alert-banner">
              <AlertTriangle size={20} />
              <div>
                <strong>Ombor Ogohlantirishi:</strong> {lowStockProducts.length} ta mahsulot zaxirasi minimal darajadan oz qoldi ({lowStockProducts.map(p => p.name).join(', ')}).
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mahsulot Nomi</th>
                  <th>Kategoriya</th>
                  <th>Sotuv Narxi</th>
                  <th>Ombordagi Qoldiq (Stock)</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.min_stock_alert;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p.id} className={isOut ? 'row-out' : isLow ? 'row-low' : ''}>
                      <td className="font-semibold">{p.name}</td>
                      <td><span className="cat-badge">{p.category_name}</span></td>
                      <td className="font-semibold">{formatUZS(p.price)}</td>
                      <td>
                        <span className={`stock-counter ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                          {p.stock} ta
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="status-tag tag-out">TUGAGAN</span>
                        ) : isLow ? (
                          <span className="status-tag tag-low">OZ QOLGAN</span>
                        ) : (
                          <span className="status-tag tag-good">YETARLI</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-action-restock"
                          onClick={() => {
                            setShowRestockModal(p.id);
                            setRestockQty('');
                          }}
                        >
                          <RefreshCw size={14} /> Omborni To'ldirish (+ Restock)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ROOMS & COMPUTERS SETTINGS TAB */}
      {activeTab === 'devices' && (
        <div className="admin-content-section">
          <div className="section-toolbar">
            <h3>Xonalar va Kompyuterlar Boshqaruvi</h3>
            <button className="btn-add-primary" onClick={() => setShowAddDeviceModal(true)}>
              <Plus size={18} /> Yangi Kompyuter / Xona Qo'shish
            </button>
          </div>

          <div className="devices-table-grid">
            {devices.map((device) => (
              <div key={device.id} className="device-setting-card">
                <div className="card-top">
                  <h4>{device.name}</h4>
                  <span className="device-type-badge">{device.type.toUpperCase()}</span>
                </div>
                <div className="card-rate-editor">
                  <label>Soatlik Tarif (UZS):</label>
                  <div className="rate-input-group">
                    <input
                      type="number"
                      defaultValue={device.hourly_rate}
                      onBlur={(e) => updateDeviceRate(device.id, e.target.value)}
                    />
                    <span>so'm</span>
                  </div>
                </div>
                <div className="card-status-info">
                  Joriy holat: <strong>{device.status === 'occupied' ? 'BAND (Faol seans)' : "BO'SH"}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. COMPLETED SESSIONS HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="admin-content-section">
          <h3>Yakunlangan Seanslar Tarixi va Checklar</h3>
          {completedSessions.length === 0 ? (
            <p className="no-data">Hali yakunlangan seanslar mavjud emas.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Sana & Vaqt</th>
                    <th>Kompyuter / Xona</th>
                    <th>Vaqt Summasi</th>
                    <th>Mahsulotlar</th>
                    <th>Jami Summa</th>
                    <th>To'lov Turi</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSessions.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDateTime(s.start_time)}</td>
                      <td className="font-semibold">{s.device_name}</td>
                      <td>{formatUZS(s.time_cost)}</td>
                      <td>
                        {s.orders && s.orders.length > 0 ? (
                          <div className="history-orders-list">
                            {s.orders.map((o, idx) => (
                              <span key={idx} className="order-pill-tag">
                                {o.product_name} ({o.quantity}x)
                              </span>
                            ))}
                            <div><strong>Jami: {formatUZS(s.products_cost)}</strong></div>
                          </div>
                        ) : (
                          <span className="sub-text">-</span>
                        )}
                      </td>
                      <td className="font-bold text-accent">{formatUZS(s.total_amount)}</td>
                      <td>
                        <span className={`pay-method-badge ${s.payment_method}`}>
                          {s.payment_method === 'cash'
                            ? 'Naqd'
                            : s.payment_method === 'card'
                            ? 'Karta'
                            : 'Click'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD BARMEN MODAL */}
      {showAddBarmenModal && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Yangi Barmen Akkaunti Qo'shish</h3>
              <button className="modal-close-btn" onClick={() => setShowAddBarmenModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddBarmenSubmit} className="modal-form">
              <div className="form-group">
                <label>F.I.SH (Barmen Ismi):</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rahimov"
                  value={newBarmen.full_name}
                  onChange={(e) => setNewBarmen({ ...newBarmen, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Login:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: barmen2"
                  value={newBarmen.username}
                  onChange={(e) => setNewBarmen({ ...newBarmen, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Parol:</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newBarmen.password}
                  onChange={(e) => setNewBarmen({ ...newBarmen, password: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddBarmenModal(false)}>
                  Bekor Qilish
                </button>
                <button type="submit" className="btn-add-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BARMEN MODAL */}
      {editUserModal && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Akkauntni Tahrirlash: {editUserModal.full_name}</h3>
              <button className="modal-close-btn" onClick={() => setEditUserModal(null)}>×</button>
            </div>
            <form onSubmit={handleEditBarmenSubmit} className="modal-form">
              <div className="form-group">
                <label>F.I.SH:</label>
                <input
                  type="text"
                  required
                  value={editBarmenData.full_name}
                  onChange={(e) => setEditBarmenData({ ...editBarmenData, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Yangi Login:</label>
                <input
                  type="text"
                  required
                  value={editBarmenData.username}
                  onChange={(e) => setEditBarmenData({ ...editBarmenData, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Yangi Parol:</label>
                <input
                  type="text"
                  required
                  value={editBarmenData.password}
                  onChange={(e) => setEditBarmenData({ ...editBarmenData, password: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditUserModal(null)}>
                  Bekor Qilish
                </button>
                <button type="submit" className="btn-add-primary">
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProdModal && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Yangi Mahsulot Qo'shish</h3>
              <button className="modal-close-btn" onClick={() => setShowAddProdModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="modal-form">
              <div className="form-group">
                <label>Mahsulot Nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Red Bull 0.25l"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Kategoriya:</label>
                <select
                  value={newProd.category_name}
                  onChange={(e) => setNewProd({ ...newProd, category_name: e.target.value })}
                >
                  <option value="Ichimliklar">Ichimliklar</option>
                  <option value="Sneklar">Sneklar</option>
                  <option value="Yeguliklar">Yeguliklar</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sotuv Narxi (so'm):</label>
                  <input
                    type="number"
                    required
                    placeholder="18000"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Dastlabki Soni (Stock):</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddProdModal(false)}>
                  Bekor Qilish
                </button>
                <button type="submit" className="btn-add-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {showRestockModal && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Omborni To'ldirish (Restock)</h3>
              <button className="modal-close-btn" onClick={() => setShowRestockModal(null)}>×</button>
            </div>
            <form onSubmit={handleRestockSubmit} className="modal-form">
              <div className="form-group">
                <label>Qancha dona qo'shmoqchisiz?</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Masalan: 20"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRestockModal(null)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-add-primary">
                  <Plus size={16} /> Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {showAddDeviceModal && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>Yangi Xona yoki Kompyuter Qo'shish</h3>
              <button className="modal-close-btn" onClick={() => setShowAddDeviceModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddDeviceSubmit} className="modal-form">
              <div className="form-group">
                <label>Nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: PS5 #05"
                  value={newDev.name}
                  onChange={(e) => setNewDev({ ...newDev, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Turi:</label>
                <select
                  value={newDev.type}
                  onChange={(e) => setNewDev({ ...newDev, type: e.target.value })}
                >
                  <option value="ps5">PlayStation 5</option>
                  <option value="pc">PC Gaming</option>
                  <option value="vip">VIP Xona</option>
                </select>
              </div>

              <div className="form-group">
                <label>Soatlik Tarif (so'm):</label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  value={newDev.hourly_rate}
                  onChange={(e) => setNewDev({ ...newDev, hourly_rate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddDeviceModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-add-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
