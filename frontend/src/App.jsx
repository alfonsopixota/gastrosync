import { useState, useEffect } from 'react';
import socket from './socket/client';
import { authFetch, API_URL, isAuthenticated, logout } from './services/api';
import LoginView from './pages/LoginView';
import KitchenView from './pages/KitchenView';
import WaiterView from './pages/WaiterView';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || '6a69c016061902ab10237c49';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('waiter');
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      authFetch(`/api/auth/me`)
        .then(setUser)
        .catch(() => logout());
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const restaurantId = user.restaurant || RESTAURANT_ID;

    authFetch(`/api/menu/restaurant/${restaurantId}`)
      .then(setMenu)
      .catch((err) => console.error('Error cargando menú:', err));

    authFetch(`/api/tables/restaurant/${restaurantId}`)
      .then(setTables)
      .catch((err) => console.error('Error cargando mesas:', err));

    authFetch(`/api/orders/restaurant/${restaurantId}`)
      .then(setOrders)
      .catch((err) => console.error('Error cargando pedidos:', err));

    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('order:new', (order) => setOrders((prev) => [order, ...prev]));
    socket.on('order:updated', (order) =>
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)))
    );
    socket.on('table:updated', (table) =>
      setTables((prev) => prev.map((t) => (t._id === table._id ? table : t)))
    );
    socket.on('connect', () => {
      socket.emit('join:restaurant', restaurantId);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order:new');
      socket.off('order:updated');
      socket.off('table:updated');
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    socket.disconnect();
    logout();
    setUser(null);
    setOrders([]);
    setMenu([]);
    setTables([]);
  };

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const restaurantId = user.restaurant || RESTAURANT_ID;

  const createOrder = (tableNumber, items) => {
    const table = tables.find((t) => t.number === tableNumber);
    if (!table) return;
    socket.emit('order:create', {
      restaurant: restaurantId,
      table: table._id,
      tableNumber,
      items: items.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        notes: item.notes || '',
      })),
    });
  };

  return (
    <div className="app">
      <header className="app-header" role="banner">
        <h1><span>Gastro</span>Sync</h1>
        <nav role="tablist" aria-label="Vistas">
          {(user.role === 'admin' || user.role === 'waiter') && (
            <button
              role="tab"
              aria-selected={view === 'waiter'}
              onClick={() => setView('waiter')}
              className={view === 'waiter' ? 'active' : ''}
            >
              Camarero
            </button>
          )}
          {(user.role === 'admin' || user.role === 'kitchen') && (
            <button
              role="tab"
              aria-selected={view === 'kitchen'}
              onClick={() => setView('kitchen')}
              className={view === 'kitchen' ? 'active' : ''}
            >
              Cocina
            </button>
          )}
        </nav>
        <div className="header-right">
          <span
            className={`status ${connected ? 'connected' : 'disconnected'}`}
            role="status"
            aria-live="polite"
          >
            {connected ? 'En vivo' : 'Desconectado'}
          </span>
          <span className="user-info">{user.name} ({user.role})</span>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <main role="main">
        {view === 'waiter' && (user.role === 'admin' || user.role === 'waiter') ? (
          <WaiterView menu={menu} tables={tables} orders={orders} onCreateOrder={createOrder} />
        ) : (
          <KitchenView orders={orders} />
        )}
      </main>
    </div>
  );
}
