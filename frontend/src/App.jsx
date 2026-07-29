import { useState, useEffect } from 'react';
import socket from './socket/client';
import { authFetch, isAuthenticated, logout } from './services/api';
import useInitialData from './hooks/useInitialData';
import Header from './components/Header';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import LoginView from './pages/LoginView';
import KitchenView from './pages/KitchenView';
import WaiterView from './pages/WaiterView';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('waiter');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      authFetch(`/api/auth/me`)
        .then(setUser)
        .catch(() => logout())
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const { menu, tables, setTables, orders, setOrders, loading, error, refetch } = useInitialData(user);

  useEffect(() => {
    if (!user) return;
    const restaurantId = user.restaurant;

    socket.connect();
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join:restaurant', restaurantId);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('order:new', (order) => setOrders((prev) => [order, ...prev]));
    socket.on('order:updated', (order) =>
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)))
    );
    socket.on('table:updated', (table) =>
      setTables((prev) => prev.map((t) => (t._id === table._id ? table : t)))
    );

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
    setTables([]);
  };

  if (authLoading) {
    return (
      <div className="app-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const createOrder = (tableNumber, items) => {
    const table = tables.find((t) => t.number === tableNumber);
    if (!table) return;
    socket.emit('order:create', {
      restaurant: user.restaurant,
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
      <Header user={user} view={view} setView={setView} connected={connected} onLogout={handleLogout} />
      <main role="main">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : view === 'waiter' && (user.role === 'admin' || user.role === 'waiter') ? (
          <WaiterView menu={menu} tables={tables} orders={orders} onCreateOrder={createOrder} />
        ) : (
          <KitchenView orders={orders} />
        )}
      </main>
    </div>
  );
}
