export default function Cart({ cart, totalItems, totalPrice, selectedTable, onRemove, onPlaceOrder }) {
  return (
    <section className="cart-section" aria-label="Carrito de pedido">
      <h2>
        Pedido {totalItems > 0 && `(${totalItems} artículos)`}
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
                  onClick={() => onRemove(item._id)}
                  aria-label={`Eliminar ${item.name} del carrito`}
                >
                  &minus;
                </button>
              </li>
            ))}
          </ul>
          <p className="cart-total">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </p>
          <button
            className="btn-primary"
            onClick={onPlaceOrder}
            disabled={!selectedTable}
            aria-label={selectedTable ? `Enviar pedido de mesa ${selectedTable} a cocina` : 'Selecciona una mesa primero'}
          >
            {selectedTable ? `Enviar a cocina (Mesa ${selectedTable})` : 'Selecciona una mesa'}
          </button>
        </>
      )}
    </section>
  );
}
