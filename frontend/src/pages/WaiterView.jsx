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

  const STATUS_LABELS = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    served: 'Servido',
  };

  return (
    <div className="waiter-view">
      <section className="tables-section" aria-label="Selección de mesa">
        <h2>Mesas</h2>
        <div className="tables-grid" role="group" aria-label="Lista de mesas">
          {tables.map((table) => (
            <button
              key={table._id}
              className={`table-card ${table.status} ${selectedTable === table.number ? 'selected' : ''}`}
              onClick={() => setSelectedTable(table.number)}
              aria-label={`Mesa ${table.number}, ${table.capacity} personas, ${table.status === 'free' ? 'libre' : table.status === 'occupied' ? 'ocupada' : 'reservada'}`}
              aria-pressed={selectedTable === table.number}
            >
              <span className="table-number">{table.number}</span>
              <span className="table-capacity">{table.capacity} pers.</span>
              <span className={`table-status ${table.status}`}>
                {table.status === 'free' ? 'Libre' : table.status === 'occupied' ? 'Ocupada' : 'Reservada'}
              </span>
            </button>
          ))}
        </div>
        {selectedTable && (
          <p className="selected-hint" aria-live="polite">
            Mesa {selectedTable} seleccionada
          </p>
        )}
      </section>

      <section className="menu-section" aria-label="Menú del restaurante">
        <h2>Menú</h2>
        <div className="menu-grid" role="group" aria-label="Platos disponibles">
          {menu.map((item) => (
            <button
              key={item._id}
              className="menu-card"
              onClick={() => addToCart(item)}
              aria-label={`${item.name}, ${item.price.toFixed(2)} euros, categoría ${item.category}`}
            >
              <h3>{item.name}</h3>
              <span className="price">{item.price.toFixed(2)} €</span>
              <span className="category">{item.category}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="cart-section" aria-label="Carrito de pedido">
        <h2>
          Pedido {cart.length > 0 && `(${cart.reduce((s, i) => s + i.quantity, 0)} artículos)`}
        </h2>
        {cart.length === 0 ? (
          <p className="empty-cart">Selecciona platos del menú</p>
        ) : (
          <>
            <ul className="cart-list" role="list" aria-label="Artículos en el carrito">
              {cart.map((item) => (
                <li key={item._id} className="cart-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="cart-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  <button
                    className="btn-small"
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    &minus;
                  </button>
                </li>
              ))}
            </ul>
            <p className="cart-total">
              <span>Total</span>
              <span>{cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €</span>
            </p>
            <button
              className="btn-primary"
              onClick={placeOrder}
              disabled={!selectedTable}
              aria-label={selectedTable ? `Enviar pedido de mesa ${selectedTable} a cocina` : 'Selecciona una mesa primero'}
            >
              {selectedTable ? `Enviar a cocina (Mesa ${selectedTable})` : 'Selecciona una mesa'}
            </button>
          </>
        )}
      </section>

      <section className="active-orders-section" aria-label="Pedidos activos">
        <h2>Pedidos activos</h2>
        {activeOrders.length === 0 ? (
          <p className="empty">No hay pedidos activos</p>
        ) : (
          <div className="orders-list" role="list">
            {activeOrders.map((order) => (
              <div key={order._id} className="order-card-small" role="listitem">
                <h3>Mesa {order.tableNumber}</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={item._id} className={`item-status-${item.status}`}>
                      {item.name} x{item.quantity} —{' '}
                      <span className="status-badge">{STATUS_LABELS[item.status] || item.status}</span>
                    </li>
                  ))}
                </ul>
                <p className="order-total">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
