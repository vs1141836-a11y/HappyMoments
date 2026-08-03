import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user credentials exist in local storage on boot
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    try {
      const { data } = await authService.login(email, password);
      if (data.success) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed. Please verify credentials.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    }
  };

  const registerUser = async (name, email, password, contact) => {
    try {
      const { data } = await authService.register(name, email, password, contact);
      if (data.success) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await authService.updateProfile(profileData);
      if (data.success) {
        const updatedInfo = { ...user, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
        setUser(updatedInfo);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        updateProfile: updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
