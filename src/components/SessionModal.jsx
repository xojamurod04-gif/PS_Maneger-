import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatUZS, formatDuration, getElapsedSeconds, calculateTimeCost, formatDateTime } from '../utils/formatters';
import { X, Play, Plus, Minus, Trash2, ShoppingBag, CheckCircle, Search, CreditCard, Banknote, Smartphone } from 'lucide-react';

export const SessionModal = ({ device, onClose }) => {
  const {
    activeSessions,
    products,
    startSession,
    addProductToSession,
    removeProductFromSession,
    endSession,
  } = useApp();

  const session = activeSessions[device.id];
  const isOccupied = device.status === 'occupied' && !!session;

  const [selectedDuration, setSelectedDuration] = useState(null); // null = unlimited
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [, setTick] = useState(0);

  // Live timer tick
  useEffect(() => {
    if (!isOccupied) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isOccupied]);

  // Derived calculations
  const elapsedSecs = isOccupied ? getElapsedSeconds(session.start_time) : 0;
  const timeCost = isOccupied ? calculateTimeCost(session.start_time, device.hourly_rate) : 0;
  const productsCost = isOccupied
    ? session.orders.reduce((acc, item) => acc + item.total_price, 0)
    : 0;
  const totalAmount = timeCost + productsCost;

  // Filter products for order picker
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category_name)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category_name === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStart = () => {
    startSession(device.id, selectedDuration);
  };

  const handleCheckoutConfirm = () => {
    endSession(device.id, paymentMethod);
    setShowCheckout(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{device.name}</h2>
            <span className="modal-rate-tag">{formatUZS(device.hourly_rate)} / soat</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {!isOccupied ? (
          /* START NEW SESSION VIEW */
          <div className="modal-start-view">
            <h3>Seans Turini Tanlang</h3>
            <p className="sub-text">Boshlash tugmasini bosishingiz bilan vaqt va hisob ketadi.</p>

            <div className="duration-options">
              <button
                className={`duration-card ${selectedDuration === null ? 'selected' : ''}`}
                onClick={() => setSelectedDuration(null)}
              >
                <div className="dur-title">Cheksiz (Vaqt bo'yicha)</div>
                <div className="dur-desc">Mijoz to'xtatguniga qadar vaqt hisoblanadi</div>
              </button>

              {[60, 120, 180, 240].map((mins) => (
                <button
                  key={mins}
                  className={`duration-card ${selectedDuration === mins ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(mins)}
                >
                  <div className="dur-title">{mins / 60} Soat</div>
                  <div className="dur-desc">Vaqt summasi: {formatUZS((mins / 60) * device.hourly_rate)}</div>
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>
                Bekor Qilish
              </button>
              <button className="btn-primary-start" onClick={handleStart}>
                <Play size={18} /> Seansni Boshlash
              </button>
            </div>
          </div>
        ) : showCheckout ? (
          /* CHECKOUT / PAYMENT VIEW */
          <div className="modal-checkout-view">
            <div className="checkout-summary-card">
              <h3>Seansni Yakunlash & To'lov</h3>
              <p className="checkout-date">Boshlangan vaqti: {formatDateTime(session.start_time)}</p>

              <div className="summary-list">
                <div className="summary-item">
                  <span>O'tgan vaqt ({formatDuration(elapsedSecs)}):</span>
                  <strong>{formatUZS(timeCost)}</strong>
                </div>

                {session.orders.length > 0 && (
                  <div className="summary-products">
                    <span className="summary-subtitle">Buyurtma qilingan mahsulotlar:</span>
                    {session.orders.map((o) => (
                      <div key={o.id} className="summary-item sub-item">
                        <span>{o.product_name} x {o.quantity}</span>
                        <span>{formatUZS(o.total_price)}</span>
                      </div>
                    ))}
                    <div className="summary-item">
                      <span>Mahsulotlar jami:</span>
                      <strong>{formatUZS(productsCost)}</strong>
                    </div>
                  </div>
                )}

                <div className="summary-total">
                  <span>UMUMIY TO'LOV:</span>
                  <span className="grand-total">{formatUZS(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="payment-selector">
                <label>To'lov Usulini Tanlang:</label>
                <div className="payment-options">
                  <button
                    className={`pay-opt ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <Banknote size={20} />
                    <span>Naqd pul</span>
                  </button>
                  <button
                    className={`pay-opt ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={20} />
                    <span>Plastik Karta</span>
                  </button>
                  <button
                    className={`pay-opt ${paymentMethod === 'click' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('click')}
                  >
                    <Smartphone size={20} />
                    <span>Click / Payme</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowCheckout(false)}>
                Orqaga
              </button>
              <button className="btn-confirm-checkout" onClick={handleCheckoutConfirm}>
                <CheckCircle size={18} /> To'lovni Tasdiqlash ({formatUZS(totalAmount)})
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE SESSION MANAGEMENT VIEW */
          <div className="modal-active-view">
            {/* Top Live Stats Header */}
            <div className="active-stats-banner">
              <div className="banner-stat">
                <span className="stat-label">Vaqt:</span>
                <span className="stat-val duration">{formatDuration(elapsedSecs)}</span>
              </div>
              <div className="banner-stat">
                <span className="stat-label">Vaqt narxi:</span>
                <span className="stat-val">{formatUZS(timeCost)}</span>
              </div>
              <div className="banner-stat">
                <span className="stat-label">Mahsulotlar:</span>
                <span className="stat-val">{formatUZS(productsCost)}</span>
              </div>
              <div className="banner-stat total-stat">
                <span className="stat-label">Jami:</span>
                <span className="stat-val total">{formatUZS(totalAmount)}</span>
              </div>
            </div>

            {/* Split layout: Left = Active Orders, Right = Product Catalog */}
            <div className="session-split-body">
              {/* Left Column: Active Order Items */}
              <div className="active-orders-column">
                <h4><ShoppingBag size={18} /> Qo'shilgan Mahsulotlar</h4>

                {session.orders.length === 0 ? (
                  <div className="orders-empty">
                    <p>Hali mahsulot qo'shilmagan.</p>
                    <small>O'ng tarafdan mahsulot ustiga bosib qo'shishingiz mumkin.</small>
                  </div>
                ) : (
                  <div className="orders-list">
                    {session.orders.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <div className="item-info">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-unit-price">{formatUZS(item.unit_price)} / dona</span>
                        </div>

                        <div className="item-controls">
                          <button
                            className="qty-btn"
                            onClick={() => removeProductFromSession(device.id, item.id, 1)}
                            title="1 ta ayirish (Omborga qaytadi)"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => {
                              const prod = products.find((p) => p.id === item.product_id);
                              if (prod) addProductToSession(device.id, prod, 1);
                            }}
                            title="1 ta qo'shish"
                          >
                            <Plus size={14} />
                          </button>

                          <span className="item-total">{formatUZS(item.total_price)}</span>

                          <button
                            className="delete-item-btn"
                            onClick={() => removeProductFromSession(device.id, item.id, item.quantity)}
                            title="Mutlaqo o'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="checkout-bar">
                  <button className="btn-end-session" onClick={() => setShowCheckout(true)}>
                    Seansni Yakunlash & To'lov ({formatUZS(totalAmount)})
                  </button>
                </div>
              </div>

              {/* Right Column: Product Picker */}
              <div className="product-picker-column">
                <h4>Mahsulot Qo'shish</h4>

                {/* Search & Category Filter */}
                <div className="picker-search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Mahsulot qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="picker-cat-tabs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'all' ? 'Barchasi' : cat}
                    </button>
                  ))}
                </div>

                {/* Product Catalog Grid */}
                <div className="picker-grid">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <div
                        key={product.id}
                        className={`product-pick-card ${isOutOfStock ? 'disabled' : ''}`}
                        onClick={() => !isOutOfStock && addProductToSession(device.id, product, 1)}
                      >
                        <div className="pick-name">{product.name}</div>
                        <div className="pick-details">
                          <span className="pick-price">{formatUZS(product.price)}</span>
                          <span className={`pick-stock ${product.stock <= product.min_stock_alert ? 'low' : ''}`}>
                            {isOutOfStock ? 'Tugagan' : `Qoldi: ${product.stock} ta`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
