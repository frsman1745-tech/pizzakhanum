import { useState, useMemo } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.numericPrice * i.qty, 0),
    [cart]
  );

  function addToCart(item) {
    setCart(prev => [...prev, { ...item, qty: 1, uid: Date.now() + Math.random() }]);
  }

  function updateQty(uid, delta) {
    setCart(prev =>
      prev.map(i => i.uid === uid ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }

  function removeItem(uid) {
    setCart(prev => prev.filter(i => i.uid !== uid));
  }

  function clearCart() {
    setCart([]);
  }

  return { cart, cartTotal, addToCart, updateQty, removeItem, clearCart };
}
