import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('hv_cart');
    return saved ? JSON.parse(saved) : [];
  });
  // Toasts
  let showToast;
  try {
    // ToastProvider is mounted above this provider in App.jsx
    // using a try/catch so SSR or early renders don't crash
    ({ showToast } = useToast());
  } catch (_) {
    showToast = null;
  }

  useEffect(() => {
    localStorage.setItem('hv_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const updated = prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        if (showToast) showToast(`${product.name} quantity updated in cart`, { type: 'info' });
        return updated;
      }
      const next = [...prev, { ...product, quantity }];
      if (showToast) showToast(`${product.name} added to cart`, { type: 'success' });
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('₹', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  }), [cartItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}