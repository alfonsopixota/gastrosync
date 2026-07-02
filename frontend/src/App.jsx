import { useState, useEffect } from 'react';
import socket from './socket/client';
import KitchenView from './pages/KitchenView';
import WaiterView from './pages/WaiterView';

const DEMO_RESTAURANT_ID = '67a1b2c3d4e5f6a7b8c9d0e1';

// Datos de demostración (funcionan sin BD)
const DEMO_MENU = [
  { _id: 'm1', name: 'Hamburguesa Clásica', price: 12.50, category: 'main' },
  { _id: 'm2', name: 'Ensalada César', price: 9.90, category: 'starter' },
  { _id: 'm3', name: 'Tarta de Queso', price: 6.50, category: 'dessert' },
  { _id: 'm4', name: 'Refresco Cola', price: 2.50, category: 'drink' },
];

const DEMO_TABLES = [
  { _id: 't1', number: 1, capacity: 4, status: 'free' },
  { _id: 't2', number: 2, capacity: 2, status: 'free' },
  { _id: 't3', number: 3, capacity: 6, status: 'free' },
  { _id: 't4', number: 4, capacity: 4, status: 'free' },
];

export default function App() {
  const [view, setView] = useState('waiter');
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('order:new', (order) => setOrders((prev) => [order, ...prev]));
    socket.on('order:updated', (order) =>
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)))
    );
    socket.emit('join:restaurant', DEMO_RESTAURANT_ID);
    return () => { socket.disconnect(); };
  }, []);

  const createOrder = (tableNumber, items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      _id: Date.now().toString(),
      restaurant: DEMO_RESTAURANT_ID,
      table: `t${tableNumber}`,
      tableNumber,
      items: items.map((item) => ({
        _id: Math.random().toString(36).slice(2),
        menuItem: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: 'pending',
      })),
      status: 'open',
      total,
      createdAt: new Date().toISOString(),
    };
    socket.emit('order:create', newOrder);
    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ GastroSync</h1>
        <nav>
          <button onClick={() => setView('waiter')} className={view === 'waiter' ? 'active' : ''}>
            👨‍🍳 Camarero
          </button>
          <button onClick={() => setView('kitchen')} className={view === 'kitchen' ? 'active' : ''}>
            🍳 Cocina
          </button>
        </nav>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 En vivo' : '🔴 Desconectado'}
        </span>
      </header>
      <main>
        {view === 'waiter' ? (
          <WaiterView menu={DEMO_MENU} tables={DEMO_TABLES} orders={orders} onCreateOrder={createOrder} />
        ) : (
          <KitchenView orders={orders} />
        )}
      </main>
    </div>
  );
}
