import socket from '../socket/client';

export default function KitchenView({ orders }) {
  const pendingOrders = orders.filter((o) => o.status === 'open' || o.status === 'in_progress');

  const STATUS_LABELS = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    served: 'Servido',
  };

  const updateItemStatus = (orderId, itemId, currentStatus) => {
    const next = currentStatus === 'pending'
      ? 'preparing'
      : currentStatus === 'preparing'
      ? 'ready'
      : 'served';
    socket.emit('order:updateItem', { orderId, itemId, status: next });
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'pending') return 'preparing';
    if (currentStatus === 'preparing') return 'ready';
    return 'served';
  };

  if (pendingOrders.length === 0) {
    return (
      <div className="kitchen-view kitchen-empty" role="status">
        <h2>Cocina</h2>
        <p className="empty-msg">No hay pedidos pendientes</p>
        <p className="empty-sub">Disfruta del descanso</p>
      </div>
    );
  }

  return (
    <div className="kitchen-view" role="region" aria-label="Vista de cocina">
      <header className="kitchen-header">
        <h2>Cocina — Pedidos en tiempo real</h2>
        <span className="order-count" aria-live="polite">
          {pendingOrders.length} pendientes
        </span>
      </header>
      <div className="kitchen-grid" role="list" aria-label="Pedidos activos">
        {pendingOrders.map((order) => (
          <div key={order._id} className="kitchen-order-card" role="listitem">
            <div className="kitchen-order-header">
              <h3>Mesa {order.tableNumber}</h3>
              <span className="order-time">
                {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <ul className="kitchen-items" role="list" aria-label={`Pedido Mesa ${order.tableNumber}`}>
              {order.items
                .filter((item) => item.status !== 'served')
                .map((item) => (
                  <li
                    key={item._id}
                    className={`kitchen-item kitchen-item-${item.status}`}
                    onClick={() => updateItemStatus(order._id, item._id, item.status)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        updateItemStatus(order._id, item._id, item.status);
                      }
                    }}
                    aria-label={`${item.quantity}x ${item.name}, estado: ${STATUS_LABELS[item.status]}. Clic para avanzar a ${STATUS_LABELS[getNextStatus(item.status)]}`}
                  >
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    {item.notes && <span className="item-notes">{item.notes}</span>}
                    <span className="item-status">{STATUS_LABELS[item.status] || item.status}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
