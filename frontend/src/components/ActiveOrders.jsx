import { ORDER_ITEM_STATUSES } from '../constants/statuses';

export default function ActiveOrders({ orders }) {
  const activeOrders = orders.filter((o) => {
    if (o.status === 'completed' || o.status === 'cancelled') return false;
    return o.items.some((item) => item.status !== 'served');
  });

  return (
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
                    <span className="status-badge">{ORDER_ITEM_STATUSES[item.status] || item.status}</span>
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
  );
}
