import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateTimeCost, getElapsedSeconds } from '../utils/formatters';

const AppContext = createContext();

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
  const [currentView, setCurrentView] = useState('barmen'); // 'barmen' | 'admin'
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
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);

  // Sync to localStorage
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

  // Initial Fetch from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: dbDevices, error: devError } = await supabase.from('rooms_computers').select('*');
        if (!devError && dbDevices && dbDevices.length > 0) {
          setDevices(dbDevices);
          setIsConnectedToSupabase(true);
        }

        const { data: dbProducts, error: prodError } = await supabase.from('products').select('*');
        if (!prodError && dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }

        const { data: dbSessions, error: sessError } = await supabase
          .from('sessions')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
        if (!sessError && dbSessions) {
          setCompletedSessions(dbSessions);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, operating in offline/localStorage mode:', err);
      }
    };

    fetchSupabaseData();
  }, []);

  // 1. Start Session
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
    };

    // Update state
    setActiveSessions((prev) => ({ ...prev, [deviceId]: newSession }));
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'occupied', current_session_id: newSessionId } : d))
    );

    // Supabase push (background)
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

  // 2. Add product to active session
  const addProductToSession = async (deviceId, product, quantity = 1) => {
    const session = activeSessions[deviceId];
    if (!session) return;

    // Check stock
    const currentProd = products.find((p) => p.id === product.id);
    if (!currentProd || currentProd.stock < quantity) {
      alert(`Xatolik: "${product.name}" omborda yetarli emas! Qolgan soni: ${currentProd ? currentProd.stock : 0}`);
      return;
    }

    // Reduce product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock - quantity } : p))
    );

    // Add or increment in session orders
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

    // Supabase update
    try {
      await supabase
        .from('products')
        .update({ stock: currentProd.stock - quantity })
        .eq('id', product.id);
    } catch (e) {
      console.warn('Supabase stock update error:', e);
    }
  };

  // 3. Remove/Decrease product from active session (Return to stock)
  const removeProductFromSession = async (deviceId, orderId, decreaseQty = 1) => {
    const session = activeSessions[deviceId];
    if (!session) return;

    const orderItem = session.orders.find((o) => o.id === orderId);
    if (!orderItem) return;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => (p.id === orderItem.product_id ? { ...p, stock: p.stock + decreaseQty } : p))
    );

    // Update order in session
    setActiveSessions((prev) => {
      const currentSess = prev[deviceId];
      if (!currentSess) return prev;

      let updatedOrders = [];
      if (orderItem.quantity <= decreaseQty) {
        // Remove completely
        updatedOrders = currentSess.orders.filter((o) => o.id !== orderId);
      } else {
        // Decrease quantity
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

    // Supabase update
    try {
      const currentProd = products.find((p) => p.id === orderItem.product_id);
      if (currentProd) {
        await supabase
          .from('products')
          .update({ stock: currentProd.stock + decreaseQty })
          .eq('id', orderItem.product_id);
      }
    } catch (e) {
      console.warn('Supabase restore stock error:', e);
    }
  };

  // 4. End Session & Checkout
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

    // Update state
    setCompletedSessions((prev) => [completedRecord, ...prev]);
    setActiveSessions((prev) => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'available', current_session_id: null } : d))
    );

    // Supabase push
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

  // 5. Admin: Add Product
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

  // 6. Admin: Restock Product
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

  // 7. Admin: Update Device Hourly Rate / Details
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

  // 8. Admin: Add Device
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
        currentView,
        setCurrentView,
        devices,
        products,
        activeSessions,
        completedSessions,
        isConnectedToSupabase,
        startSession,
        addProductToSession,
        removeProductFromSession,
        endSession,
        addProduct,
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
