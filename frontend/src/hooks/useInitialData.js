import { useState, useEffect } from 'react';
import { authFetch } from '../services/api';

export default function useInitialData(user) {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const restaurantId = user.restaurant;
    try {
      const [menuData, tablesData, ordersData] = await Promise.all([
        authFetch(`/api/menu/restaurant/${restaurantId}`),
        authFetch(`/api/tables/restaurant/${restaurantId}`),
        authFetch(`/api/orders/restaurant/${restaurantId}`),
      ]);
      setMenu(menuData);
      setTables(tablesData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return { menu, setMenu, tables, setTables, orders, setOrders, loading, error, refetch: fetchData };
}
