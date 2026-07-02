import { useState } from 'react';

export default function WaiterView({ menu, tables, orders, onCreateOrder }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i._id === item._id);
      if (exist) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const exist = prev.find((i) => i._id === itemId);
      if (exist && exist.quantity > 1) {
        return prev.map((i) =>
          i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i._id !== itemId);
    });
  };

  const placeOrder = () => {
    if (!selectedTable || cart.length === 0) return;
    onCreateOrder(selectedTable, cart);
    setCart([]);
    setSelectedTable(null);
  };

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="waiter-view">
      <section className="tables-section">
        <h2>Mesas</h2>
        <div className="tables-grid">
          {tables.map((table) => (
            <button
              key={table._id}
              className={`table-card ${table.status} ${selectedTable === table.number ? 'selected' : ''}`}
              onClick={() => setSelectedTable(table.number)}
            >
              <span className="table-number">Mesa {table.number}</span>
              <span className="table-capacity">{table.capacity} pers.</span>
              <span className={`table-status ${table.status}`}>
                {table.status === 'free' ? 'Libre' : table.status === 'occupied' ? 'Ocupada' : 'Reservada'}
              </span>
            </button>
          ))}
        </div>
        {selectedTable && <p className="selected-hint">Mesa {selectedTable} seleccionada</p>}
      </section>

      <section className="menu-section">
        <h2>Menú</h2>
        <div className="menu-grid">
          {menu.map((item) => (
            <div key={item._id} className="menu-card" onClick={() => addToCart(item)}>
              <h3>{item.name}</h3>
              <p className="price">{item.price.toFixed(2)} €</p>
              <span className="category">{item.category}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cart-section">
        <h2>Pedido {cart.length > 0 && `(${cart.reduce((s, i) => s + i.quantity, 0)} artículos)`}</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">Selecciona platos del menú</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item._id} className="cart-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="cart-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  <button className="btn-small" onClick={() => removeFromCart(item._id)}>-</button>
                </li>
              ))}
            </ul>
            <p className="cart-total">
              Total: {cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €
            </p>
            <button className="btn-primary" onClick={placeOrder} disabled={!selectedTable}>
              Enviar pedido a cocina
            </button>
          </>
        )}
      </section>

      <section className="active-orders-section">
        <h2>Pedidos activos</h2>
        {activeOrders.length === 0 ? (
          <p className="empty">No hay pedidos activos</p>
        ) : (
          <div className="orders-list">
            {activeOrders.map((order) => (
              <div key={order._id} className="order-card-small">
                <h3>Mesa {order.tableNumber}</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={item._id} className={`item-status-${item.status}`}>
                      {item.name} x{item.quantity} — <span className="status-badge">{item.status}</span>
                    </li>
                  ))}
                </ul>
                <p className="order-total">{order.total.toFixed(2)} €</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
