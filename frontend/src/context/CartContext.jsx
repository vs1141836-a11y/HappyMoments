import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import * as api from '../services/api.js';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on boot or user session change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          const { data } = await api.fetchCart();
          if (data.success && data.cart) {
            setCartItems(data.cart.items || []);
          }
        } catch (error) {
          console.error('Error fetching cart from DB:', error);
        }
      } else {
        // Load from local storage if logged out
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch (e) {
            localStorage.removeItem('localCart');
          }
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Save cart to local storage when it changes (only for logged out users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('localCart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (itemData) => {
    if (user) {
      try {
        const { data } = await api.addItemToCart(itemData);
        if (data.success) {
          setCartItems(data.cart.items || []);
          return { success: true };
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to add item to database cart.',
        };
      }
    } else {
      // Offline local cart logic
      const { itemType, itemId, eventDate, eventTime, eventLocation, color, size, quantity } = itemData;
      
      // We will need to fetch the target item details from the DB to display it properly in the cart
      // For local cart add, we will fetch details on demand or store basic reference.
      // Let's retrieve details to populate in cart state
      try {
        let details = null;
        if (itemType === 'Decoration') {
          const { data } = await api.getDecorationDetails(itemId);
          details = data.decoration;
        } else {
          const { data } = await api.getRentalDetails(itemId);
          details = data.rental;
        }

        if (details) {
          setCartItems(prev => {
            const idx = prev.findIndex(item => {
              const isSameId = itemType === 'Decoration' 
                ? item.decorItem?._id === itemId 
                : item.rentalItem?._id === itemId;
              const isSameConfig = item.eventDate === eventDate && 
                                   item.eventTime === eventTime && 
                                   item.color === color && 
                                   item.size === size;
              return isSameId && isSameConfig;
            });

            if (idx > -1) {
              const updated = [...prev];
              updated[idx].quantity += Number(quantity || 1);
              return updated;
            } else {
              const newItem = {
                _id: `local_citem_${Date.now()}`,
                itemType,
                eventDate,
                eventTime,
                eventLocation,
                color,
                size,
                quantity: Number(quantity || 1),
                decorItem: itemType === 'Decoration' ? details : null,
                rentalItem: itemType === 'DecorationRental' ? details : null,
              };
              return [...prev, newItem];
            }
          });
          return { success: true };
        }
      } catch (err) {
        return { success: false, message: 'Failed to retrieve item details.' };
      }
    }
  };

  const updateQuantity = async (cartItemId, quantity, logistics = {}) => {
    if (user) {
      try {
        const { data } = await api.updateCartItem(cartItemId, { quantity, ...logistics });
        if (data.success) {
          setCartItems(data.cart.items || []);
          return { success: true };
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to update cart item.',
        };
      }
    } else {
      setCartItems(prev => prev.map(item => {
        if (item._id === cartItemId) {
          return { ...item, quantity: Number(quantity), ...logistics };
        }
        return item;
      }));
      return { success: true };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (user) {
      try {
        const { data } = await api.deleteCartItem(cartItemId);
        if (data.success) {
          setCartItems(data.cart.items || []);
          return { success: true };
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to delete cart item.',
        };
      }
    } else {
      setCartItems(prev => prev.filter(item => item._id !== cartItemId));
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const { data } = await api.clearUserCart();
        if (data.success) {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Failed to clear cart database:', error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('localCart');
    }
  };

  // Sync offline cart to DB on login
  const syncLocalCartToDb = async () => {
    if (!user || cartItems.length === 0) return;
    try {
      for (const item of cartItems) {
        const itemId = item.itemType === 'Decoration' ? item.decorItem?._id : item.rentalItem?._id;
        if (itemId) {
          await api.addItemToCart({
            itemType: item.itemType,
            itemId,
            eventDate: item.eventDate,
            eventTime: item.eventTime,
            eventLocation: item.eventLocation,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
          });
        }
      }
      // Re-fetch clean cart
      const { data } = await api.fetchCart();
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
        localStorage.removeItem('localCart');
      }
    } catch (err) {
      console.error('Error syncing local cart to database:', err);
    }
  };

  // Auto trigger sync upon login
  useEffect(() => {
    if (user && localStorage.getItem('localCart')) {
      syncLocalCartToDb();
    }
  }, [user]);

  // Totals calculations
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.itemType === 'Decoration' 
        ? (item.decorItem?.price || 0)
        : (item.rentalItem?.rentalPrice || 0);
      return sum + (price * item.quantity);
    }, 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.18); // 18% GST
  };

  const getShippingFee = () => {
    return cartItems.length > 0 ? 1500 : 0; // flat rate for delivery and setup
  };

  const getGrandTotal = () => {
    return getSubtotal() + getTax() + getShippingFee();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getTax,
        getShippingFee,
        getGrandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
