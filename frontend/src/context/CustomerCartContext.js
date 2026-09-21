import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerCartContext = createContext();

const STORAGE_KEY = 'pharmacare_customer_cart_v1';

export function CustomerCartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (medicine, qty = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item._id === medicine._id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        // Cap to available stock
        const maxStock = medicine.quantity || 999;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(newQty, maxStock),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            ...medicine,
            quantity: Math.min(qty, medicine.quantity || 999),
          },
        ];
      }
    });
  };

  const updateQuantity = (medicineId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item._id === medicineId) {
            const newQty = item.quantity + delta;
            const maxStock = item.stock || item.quantityInInventory || 999;
            return {
              ...item,
              quantity: Math.min(Math.max(0, newQty), maxStock),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const setItemQuantity = (medicineId, quantity) => {
    const validQty = Math.max(0, parseInt(quantity, 10) || 0);
    setCartItems((prev) => {
      if (validQty === 0) {
        return prev.filter((item) => item._id !== medicineId);
      }
      return prev.map((item) => {
        if (item._id === medicineId) {
          const maxStock = item.stock || item.quantityInInventory || 999;
          return { ...item, quantity: Math.min(validQty, maxStock) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (medicineId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== medicineId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.sellingPrice || 0) * item.quantity;
  }, 0);

  const isRxItem = (item) => {
    return (
      item.requiresPrescription === true ||
      ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(item.scheduleType)
    );
  };

  const rxMedicines = cartItems.filter(isRxItem);
  const hasRxItems = rxMedicines.length > 0;

  return (
    <CustomerCartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        updateQuantity,
        setItemQuantity,
        removeFromCart,
        clearCart,
        hasRxItems,
        rxMedicines,
        isRxItem,
      }}
    >
      {children}
    </CustomerCartContext.Provider>
  );
}

export function useCustomerCart() {
  const context = useContext(CustomerCartContext);
  if (!context) {
    throw new Error('useCustomerCart must be used within a CustomerCartProvider');
  }
  return context;
}
