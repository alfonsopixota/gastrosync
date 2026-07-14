import { useState, useEffect } from 'react';
import socket from './socket/client';
import KitchenView from './pages/KitchenView';
import WaiterView from './pages/WaiterView';

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || '6a4bf6ab5e1b7632418549cb';

if (!import.meta.env.VITE_RESTAURANT_ID) {
  console.warn('VITE_RESTAURANT_ID no definido, usando valor por defecto');
}

export default function App() {
  const [view, setView] = useState('waiter');
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/menu/restaurant/${RESTAURANT_ID}`)
      .then((res) => res.json())
      .then(setMenu)
      .catch((err) => console.error('Error cargando menú:', err));

    fetch(`${API_URL}/api/tables/restaurant/${RESTAURANT_ID}`)
      .then((res) => res.json())
      .then(setTables)
      .catch((err) => console.error('Error cargando mesas:', err));

    fetch(`${API_URL}/api/orders/restaurant/${RESTAURANT_ID}`)
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => console.error('Error cargando pedidos:', err));
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('reconnect', () => {
      socket.emit('join:restaurant', RESTAURANT_ID);
    });
    socket.on('order:new', (order) => setOrders((prev) => [order, ...prev]));
    socket.on('order:updated', (order) =>
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)))
    );
    socket.on('table:updated', (table) =>
      setTables((prev) => prev.map((t) => (t._id === table._id ? table : t)))
    );
    socket.emit('join:restaurant', RESTAURANT_ID);
    return () => { socket.disconnect(); };
  }, []);

  const createOrder = (tableNumber, items) => {
    const table = tables.find((t) => t.number === tableNumber);
    if (!table) return;
    socket.emit('order:create', {
      restaurant: RESTAURANT_ID,
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
      <header className="app-header">
        <h1>GastroSync</h1>
        <nav>
          <button onClick={() => setView('waiter')} className={view === 'waiter' ? 'active' : ''}>
            Camarero
          </button>
          <button onClick={() => setView('kitchen')} className={view === 'kitchen' ? 'active' : ''}>
            Cocina
          </button>
        </nav>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'En vivo' : 'Desconectado'}
        </span>
      </header>
      <main>
        {view === 'waiter' ? (
          <WaiterView menu={menu} tables={tables} orders={orders} onCreateOrder={createOrder} />
        ) : (
          <KitchenView orders={orders} />
        )}
      </main>
    </div>
  );
}
