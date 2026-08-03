import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import * as api from '../services/api.js';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistDecor, setWishlistDecor] = useState([]);
  const [wishlistRent, setWishlistRent] = useState([]);

  // Load wishlist on session changes
  useEffect(() => {
    if (user) {
      // Sync from user profile data
      const fetchProfileWishlist = async () => {
        try {
          const { data } = await api.getProfile();
          if (data.success) {
            setWishlistDecor(data.wishlistDecorations || []);
            setWishlistRent(data.wishlistRentals || []);
          }
        } catch (err) {
          console.error('Failed to load user wishlist:', err);
        }
      };
      fetchProfileWishlist();
    } else {
      // Offline wishlist
      const localWishDecor = localStorage.getItem('wishlistDecor');
      const localWishRent = localStorage.getItem('wishlistRent');
      setWishlistDecor(localWishDecor ? JSON.parse(localWishDecor) : []);
      setWishlistRent(localWishRent ? JSON.parse(localWishRent) : []);
    }
  }, [user]);

  // Sync state changes to local storage when logged out
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlistDecor', JSON.stringify(wishlistDecor));
      localStorage.setItem('wishlistRent', JSON.stringify(wishlistRent));
    }
  }, [wishlistDecor, wishlistRent, user]);

  const toggleWishlist = async (itemType, itemId) => {
    if (itemType === 'Decoration') {
      const exists = wishlistDecor.includes(itemId);
      if (exists) {
        setWishlistDecor(prev => prev.filter(id => id !== itemId));
      } else {
        setWishlistDecor(prev => [...prev, itemId]);
      }
      
      if (user) {
        try {
          // Sync profile update
          const updatedDecor = exists 
            ? wishlistDecor.filter(id => id !== itemId)
            : [...wishlistDecor, itemId];
          await api.updateProfile({ wishlistDecorations: updatedDecor });
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      const exists = wishlistRent.includes(itemId);
      if (exists) {
        setWishlistRent(prev => prev.filter(id => id !== itemId));
      } else {
        setWishlistRent(prev => [...prev, itemId]);
      }

      if (user) {
        try {
          const updatedRent = exists 
            ? wishlistRent.filter(id => id !== itemId)
            : [...wishlistRent, itemId];
          await api.updateProfile({ wishlistRentals: updatedRent });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const isInWishlist = (itemType, itemId) => {
    if (itemType === 'Decoration') {
      return wishlistDecor.includes(itemId);
    } else {
      return wishlistRent.includes(itemId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistDecor,
        wishlistRent,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
