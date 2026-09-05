import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateTimeCost, getElapsedSeconds } from '../utils/formatters';

const AppContext = createContext();

const INITIAL_USERS = [
  { id: 'u1', username: 'admin', password: 'admin123', full_name: 'Bosh Administrator', role: 'admin' },
  { id: 'u2', username: 'barmen1', password: 'barmen123', full_name: 'Barmen (Operator 1)', role: 'barmen' },
];

const INITIAL_DEVICES = [
  { id: '1', name: 'PS5 #01', type: 'ps5', hourly_rate: 25000, status: 'available', current_session_id: null },
  { id: '2', name: 'PS5 #02', type: 'ps5', hourly_rate: 25000, status: 'available', current_session_id: null },
  { id: '3', name: 'PS5 #03 (VIP)', type: 'vip', hourly_rate: 35000, status: 'available', current_session_id: null },
  { id: '4', name: 'PS5 #04 (VIP)', type: 'vip', hourly_rate: 35000, status: 'available', current_session_id: null },
  { id: '5', name: 'PC Gaming #01', type: 'pc', hourly_rate: 18000, status: 'available', current_session_id: null },
  { id: '6', name: 'PC Gaming #02', type: 'pc', hourly_rate: 18000, status: 'available', current_session_id: null },
  { id: '7', name: 'PC Gaming #03', type: 'pc', hourly_rate: 18000, status: 'available', current_session_id: null },
  { id: '8', name: 'PC Gaming #04', type: 'pc', hourly_rate: 18000, status: 'available', current_session_id: null },
  { id: '9', name: 'VIP Xona #1', type: 'vip', hourly_rate: 50000, status: 'available', current_session_id: null },
  { id: '10', name: 'VIP Xona #2', type: 'vip', hourly_rate: 50000, status: 'available', current_session_id: null },
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Red Bull 0.25l', category_name: 'Ichimliklar', price: 18000, stock: 45, min_stock_alert: 10 },
  { id: 'p2', name: 'Coca-Cola 0.5l', category_name: 'Ichimliklar', price: 9000, stock: 60, min_stock_alert: 15 },
  { id: 'p3', name: 'Pepsi 0.5l', category_name: 'Ichimliklar', price: 8500, stock: 50, min_stock_alert: 10 },
  { id: 'p4', name: 'Fanta 0.5l', category_name: 'Ichimliklar', price: 8500, stock: 30, min_stock_alert: 8 },
  { id: 'p5', name: 'Suv (Gazsiz) 0.5l', category_name: 'Ichimliklar', price: 4000, stock: 80, min_stock_alert: 20 },
  { id: 'p6', name: 'Lays Chipslar 140g', category_name: 'Sneklar', price: 16000, stock: 25, min_stock_alert: 5 },
  { id: 'p7', name: 'Pringles Original', category_name: 'Sneklar', price: 28000, stock: 15, min_stock_alert: 5 },
  { id: 'p8', name: 'Kirieshki 80g', category_name: 'Sneklar', price: 5000, stock: 70, min_stock_alert: 15 },
  { id: 'p9', name: 'Hot-Dog VIP', category_name: 'Yeguliklar', price: 22000, stock: 20, min_stock_alert: 5 },
  { id: 'p10', name: 'Gamburger Special', category_name: 'Yeguliklar', price: 28000, stock: 18, min_stock_alert: 5 },
  { id: 'p11', name: 'Klubny Sendvich', category_name: 'Yeguliklar', price: 32000, stock: 12, min_stock_alert: 4 },
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('ps_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return localStorage.getItem('ps_session_id') || null;
  });

  const [activeLogins, setActiveLogins] = useState(() => {
    const local = localStorage.getItem('ps_active_logins');
    return local ? JSON.parse(local) : [];
  });

  const [usersList, setUsersList] = useState(() => {
    const local = localStorage.getItem('ps_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [currentView, setCurrentView] = useState(() => {
    if (currentUser?.role === 'admin') return 'admin';
    return 'barmen';
  });

  const [devices, setDevices] = useState(() => {
    const local = localStorage.getItem('ps_devices');
    return local ? JSON.parse(local) : INITIAL_DEVICES;
  });

  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem('ps_products');
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });

  const [activeSessions, setActiveSessions] = useState(() => {
    const local = localStorage.getItem('ps_active_sessions');
    return local ? JSON.parse(local) : {};
  });

  const [completedSessions, setCompletedSessions] = useState(() => {
    const local = localStorage.getItem('ps_completed_sessions');
    return local ? JSON.parse(local) : [];
  });

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ps_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ps_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('ps_session_id', currentSessionId);
    } else {
      localStorage.removeItem('ps_session_id');
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem('ps_active_logins', JSON.stringify(activeLogins));
  }, [activeLogins]);

  useEffect(() => {
    localStorage.setItem('ps_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('ps_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('ps_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ps_active_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem('ps_completed_sessions', JSON.stringify(completedSessions));
  }, [completedSessions]);

  // Initial Fetch & Realtime Sync from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: dbLogins } = await supabase.from('active_logins').select('*');
        if (dbLogins && dbLogins.length > 0) setActiveLogins(dbLogins);

        const { data: dbUsers } = await supabase.from('users').select('*');
        if (dbUsers && dbUsers.length > 0) setUsersList(dbUsers);

        const { data: dbDevices } = await supabase.from('rooms_computers').select('*');
        if (dbDevices && dbDevices.length > 0) setDevices(dbDevices);

        const { data: dbProducts } = await supabase.from('products').select('*');
        if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);

        const { data: dbSessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
        if (dbSessions) setCompletedSessions(dbSessions);
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    };

    fetchSupabaseData();
  }, []);

  // Security Check: Kick Monitor
  useEffect(() => {
    if (!currentUser || !currentSessionId) return;

    const checkRevoked = () => {
      const myLogin = activeLogins.find((l) => l.id === currentSessionId);
      if (myLogin && myLogin.status === 'revoked') {
        alert("⚠️ DIQQAT! Sizning kirish seansingiz Administrator tomonidan xavfsizlik yuzasidan majburiy to'xtatildi (Kick/Revoked)!");
        logout();
      }
    };

    checkRevoked();
    const interval = setInterval(checkRevoked, 2000);
    return () => clearInterval(interval);
  }, [currentUser, currentSessionId, activeLogins]);

  // Login handler
  const login = async (username, password) => {
    const user = usersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: "Login yoki parol noto'g'ri!" };
    }

    const newSessionId = 'sess_login_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const deviceInfo = window.navigator.userAgent.includes('Windows')
      ? 'Windows PC (' + (window.navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser') + ')'
      : window.navigator.platform || 'Veb Brauzer';

    const loginRecord = {
      id: newSessionId,
      user_id: user.id,
      username: user.username,
      role: user.role,
      device_info: deviceInfo,
      login_time: new Date().toISOString(),
      status: 'active',
    };

    setCurrentUser(user);
    setCurrentSessionId(newSessionId);
    setCurrentView(user.role === 'admin' ? 'admin' : 'barmen');

    setActiveLogins((prev) => [loginRecord, ...prev]);

    try {
      await supabase.from('active_logins').insert([loginRecord]);
    } catch (e) {
      console.warn('Supabase active login insert error:', e);
    }

    return { success: true, user };
  };

  // Logout handler
  const logout = async () => {
    if (currentSessionId) {
      setActiveLogins((prev) =>
        prev.map((l) => (l.id === currentSessionId ? { ...l, status: 'revoked' } : l))
      );
      try {
        await supabase.from('active_logins').update({ status: 'revoked' }).eq('id', currentSessionId);
      } catch (e) {
        console.warn('Supabase logout update error:', e);
      }
    }

    setCurrentUser(null);
    setCurrentSessionId(null);
  };

  // Kick / Force Logout user login session (Admin)
  const kickUserLoginSession = async (sessionId) => {
    if (!window.confirm("Haqiqatan ham ushbu kirish seansini majburiy to'xtatmoqchimisiz (Kick)?")) {
      return;
    }

    setActiveLogins((prev) =>
      prev.map((l) => (l.id === sessionId ? { ...l, status: 'revoked' } : l))
    );

    try {
      await supabase.from('active_logins').update({ status: 'revoked' }).eq('id', sessionId);
    } catch (e) {
      console.warn('Supabase kick error:', e);
    }
  };

  // Barmen Account Management (Admin)
  const addBarmen = async (username, password, fullName) => {
    const existing = usersList.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      alert(`Xatolik: "${username}" nomli foydalanuvchi allaqachon mavjud!`);
      return false;
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      password: password,
      full_name: fullName.trim(),
      role: 'barmen',
    };

    setUsersList((prev) => [...prev, newUser]);

    try {
      await supabase.from('users').insert([newUser]);
    } catch (e) {
      console.warn('Supabase insert user error:', e);
    }

    return true;
  };

  const updateBarmen = async (userId, newUsername, newPassword, newFullName) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              username: newUsername.trim(),
              password: newPassword,
              full_name: newFullName ? newFullName.trim() : u.full_name,
            }
          : u
      )
    );

    try {
      await supabase
        .from('users')
        .update({
          username: newUsername.trim(),
          password: newPassword,
          full_name: newFullName ? newFullName.trim() : undefined,
        })
        .eq('id', userId);
    } catch (e) {
      console.warn('Supabase update user error:', e);
    }
  };

  const deleteBarmen = async (userId) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));

    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch (e) {
      console.warn('Supabase delete user error:', e);
    }
  };

  // Start Session
  const startSession = async (deviceId, durationMinutes = null) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const newSessionId = 'sess_' + Date.now();
    const startTime = new Date().toISOString();

    const newSession = {
      id: newSessionId,
      device_id: deviceId,
      device_name: device.name,
      start_time: startTime,
      target_duration_minutes: durationMinutes,
      hourly_rate: device.hourly_rate,
      orders: [],
      status: 'active',
      started_by: currentUser ? currentUser.full_name : 'Barmen',
    };

    setActiveSessions((prev) => ({ ...prev, [deviceId]: newSession }));
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'occupied', current_session_id: newSessionId } : d))
    );

    try {
      await supabase.from('rooms_computers').update({ status: 'occupied' }).eq('id', deviceId);
      await supabase.from('sessions').insert({
        id: newSessionId,
        device_id: deviceId,
        device_name: device.name,
        start_time: startTime,
        target_duration_minutes: durationMinutes,
        status: 'active',
      });
    } catch (e) {
      console.warn('Supabase session start error:', e);
    }
  };

  // Add Product to Session (AUTOMATIC STOCK DEDUCTION IN SUPABASE DB & STATE)
  const addProductToSession = async (deviceId, product, quantity = 1) => {
    const session = activeSessions[deviceId];
    if (!session) return;

    const currentProd = products.find((p) => p.id === product.id);
    if (!currentProd || currentProd.stock < quantity) {
      alert(`Xatolik: "${product.name}" omborda yetarli emas! Qolgan soni: ${currentProd ? currentProd.stock : 0}`);
      return;
    }

    const newStock = currentProd.stock - quantity;

    // 1. Update state
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    );

    // 2. Add or increment order in session
    setActiveSessions((prev) => {
      const currentSess = prev[deviceId];
      if (!currentSess) return prev;

      const existingIndex = currentSess.orders.findIndex((o) => o.product_id === product.id);
      let updatedOrders = [...currentSess.orders];

      if (existingIndex >= 0) {
        const existingItem = updatedOrders[existingIndex];
        const newQty = existingItem.quantity + quantity;
        updatedOrders[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          total_price: newQty * existingItem.unit_price,
        };
      } else {
        updatedOrders.push({
          id: 'ord_' + Date.now() + Math.random().toString(36).substr(2, 4),
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          unit_price: product.price,
          total_price: quantity * product.price,
        });
      }

      return {
        ...prev,
        [deviceId]: {
          ...currentSess,
          orders: updatedOrders,
        },
      };
    });

    // 3. Direct Supabase Database Stock Update
    try {
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
    } catch (e) {
      console.warn('Supabase stock update error:', e);
    }
  };

  // Remove Product from Session (AUTOMATIC STOCK RESTORATION IN SUPABASE DB & STATE)
  const removeProductFromSession = async (deviceId, orderId, decreaseQty = 1) => {
    const session = activeSessions[deviceId];
    if (!session) return;

    const orderItem = session.orders.find((o) => o.id === orderId);
    if (!orderItem) return;

    const currentProd = products.find((p) => p.id === orderItem.product_id);
    const newStock = (currentProd ? currentProd.stock : 0) + decreaseQty;

    // 1. Restore stock in state
    setProducts((prev) =>
      prev.map((p) => (p.id === orderItem.product_id ? { ...p, stock: newStock } : p))
    );

    // 2. Update session orders
    setActiveSessions((prev) => {
      const currentSess = prev[deviceId];
      if (!currentSess) return prev;

      let updatedOrders = [];
      if (orderItem.quantity <= decreaseQty) {
        updatedOrders = currentSess.orders.filter((o) => o.id !== orderId);
      } else {
        updatedOrders = currentSess.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                quantity: o.quantity - decreaseQty,
                total_price: (o.quantity - decreaseQty) * o.unit_price,
              }
            : o
        );
      }

      return {
        ...prev,
        [deviceId]: {
          ...currentSess,
          orders: updatedOrders,
        },
      };
    });

    // 3. Direct Supabase Database Stock Restore
    try {
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', orderItem.product_id);
    } catch (e) {
      console.warn('Supabase restore stock error:', e);
    }
  };

  // End Session
  const endSession = async (deviceId, paymentMethod = 'cash') => {
    const session = activeSessions[deviceId];
    const device = devices.find((d) => d.id === deviceId);
    if (!session || !device) return;

    const endTime = new Date().toISOString();
    const timeCost = calculateTimeCost(session.start_time, device.hourly_rate);
    const productsCost = session.orders.reduce((acc, curr) => acc + curr.total_price, 0);
    const totalAmount = timeCost + productsCost;

    const completedRecord = {
      ...session,
      end_time: endTime,
      time_cost: timeCost,
      products_cost: productsCost,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      status: 'completed',
    };

    setCompletedSessions((prev) => [completedRecord, ...prev]);
    setActiveSessions((prev) => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'available', current_session_id: null } : d))
    );

    try {
      await supabase.from('rooms_computers').update({ status: 'available' }).eq('id', deviceId);
      await supabase.from('sessions').update({
        end_time: endTime,
        time_cost: timeCost,
        products_cost: productsCost,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: 'completed',
      }).eq('id', session.id);
    } catch (e) {
      console.warn('Supabase end session error:', e);
    }

    return completedRecord;
  };

  // Admin Remote Force End Session (Terminate active computer)
  const adminForceEndSession = async (deviceId) => {
    if (!window.confirm("Haqiqatan ham ushbu kompyuterdagi seansni masofadan to'xtatmoqchimisiz?")) {
      return;
    }
    await endSession(deviceId, 'cash');
  };

  // Product Management (Add, Edit, Delete, Restock)
  const addProduct = async (newProd) => {
    const created = {
      id: 'p_' + Date.now(),
      ...newProd,
      price: Number(newProd.price),
      stock: Number(newProd.stock),
      min_stock_alert: Number(newProd.min_stock_alert || 5),
    };

    setProducts((prev) => [created, ...prev]);
    try {
      await supabase.from('products').insert([created]);
    } catch (e) {
      console.warn('Supabase add product error:', e);
    }
  };

  const updateProduct = async (productId, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              ...updatedFields,
              price: updatedFields.price !== undefined ? Number(updatedFields.price) : p.price,
              stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : p.stock,
              min_stock_alert: updatedFields.min_stock_alert !== undefined ? Number(updatedFields.min_stock_alert) : p.min_stock_alert,
            }
          : p
      )
    );

    try {
      await supabase
        .from('products')
        .update({
          ...updatedFields,
          price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
          stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : undefined,
          min_stock_alert: updatedFields.min_stock_alert !== undefined ? Number(updatedFields.min_stock_alert) : undefined,
        })
        .eq('id', productId);
    } catch (e) {
      console.warn('Supabase update product error:', e);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Haqiqatan ham ushbu mahsulotni ombordan o'chirmoqchimisiz?")) {
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.warn('Supabase delete product error:', e);
    }
  };

  const restockProduct = async (productId, quantityToAdd) => {
    const qty = Number(quantityToAdd);
    if (isNaN(qty) || qty <= 0) return;

    let updatedStock = 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedStock = p.stock + qty;
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    try {
      await supabase.from('products').update({ stock: updatedStock }).eq('id', productId);
    } catch (e) {
      console.warn('Supabase restock error:', e);
    }
  };

  const updateDeviceRate = async (deviceId, newHourlyRate) => {
    const rate = Number(newHourlyRate);
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, hourly_rate: rate } : d))
    );

    try {
      await supabase.from('rooms_computers').update({ hourly_rate: rate }).eq('id', deviceId);
    } catch (e) {
      console.warn('Supabase rate update error:', e);
    }
  };

  const addDevice = async (newDevice) => {
    const created = {
      id: 'dev_' + Date.now(),
      ...newDevice,
      hourly_rate: Number(newDevice.hourly_rate),
      status: 'available',
    };

    setDevices((prev) => [...prev, created]);
    try {
      await supabase.from('rooms_computers').insert([created]);
    } catch (e) {
      console.warn('Supabase add device error:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentSessionId,
        activeLogins,
        usersList,
        login,
        logout,
        kickUserLoginSession,
        addBarmen,
        updateBarmen,
        deleteBarmen,
        currentView,
        setCurrentView,
        devices,
        products,
        activeSessions,
        completedSessions,
        startSession,
        addProductToSession,
        removeProductFromSession,
        endSession,
        adminForceEndSession,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        updateDeviceRate,
        addDevice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
