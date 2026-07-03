import socket from '../socket/client';

export default function KitchenView({ orders }) {
  const pendingOrders = orders.filter((o) => o.status === 'open' || o.status === 'in_progress');

  const updateItemStatus = (orderId, itemId, newStatus) => {
    socket.emit('order:updateItem', { orderId, itemId, status: newStatus });
  };

  if (pendingOrders.length === 0) {
    return (
      <div className="kitchen-view kitchen-empty">
        <h2>🍳 Cocina</h2>
        <p className="empty-msg">No hay pedidos pendientes</p>
        <p className="empty-sub">¡Disfruta del descanso!</p>
      </div>
    );
  }

  return (
    <div className="kitchen-view">
      <header className="kitchen-header">
        <h2>🍳 Cocina — Pedidos en tiempo real</h2>
        <span className="order-count">{pendingOrders.length} pendientes</span>
      </header>
      <div className="kitchen-grid">
        {pendingOrders.map((order) => (
          <div key={order._id} className="kitchen-order-card">
            <div className="kitchen-order-header">
              <h3>Mesa {order.tableNumber}</h3>
              <span className="order-time">
                {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <ul className="kitchen-items">
              {order.items
                .filter((item) => item.status !== 'served')
                .map((item) => (
                  <li
                    key={item._id}
                    className={`kitchen-item kitchen-item-${item.status}`}
                    onClick={() =>
                      updateItemStatus(
                        order._id,
                        item._id,
                        item.status === 'pending'
                          ? 'preparing'
                          : item.status === 'preparing'
                          ? 'ready'
                          : 'served'
                      )
                    }
                  >
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    {item.notes && <span className="item-notes">{item.notes}</span>}
                    <span className="item-status">{item.status}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
