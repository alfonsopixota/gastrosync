import { useState } from 'react';
import useCart from '../hooks/useCart';
import TablesGrid from '../components/TablesGrid';
import MenuGrid from '../components/MenuGrid';
import Cart from '../components/Cart';
import ActiveOrders from '../components/ActiveOrders';

export default function WaiterView({ menu, tables, orders, onCreateOrder }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const { cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

  const placeOrder = () => {
    if (!selectedTable || cart.length === 0) return;
    onCreateOrder(selectedTable, cart);
    clearCart();
    setSelectedTable(null);
  };

  return (
    <div className="waiter-view">
      <TablesGrid tables={tables} selectedTable={selectedTable} onSelectTable={setSelectedTable} />
      <MenuGrid menu={menu} onAddToCart={addToCart} />
      <Cart
        cart={cart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        selectedTable={selectedTable}
        onRemove={removeFromCart}
        onPlaceOrder={placeOrder}
      />
      <ActiveOrders orders={orders} />
    </div>
  );
}
