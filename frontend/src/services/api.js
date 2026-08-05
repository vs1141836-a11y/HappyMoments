import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (apiURL && !apiURL.endsWith('/api')) {
  apiURL = apiURL.endsWith('/') ? `${apiURL}api` : `${apiURL}/api`;
}

const API = axios.create({
  baseURL: apiURL,
});

export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'string' && url.startsWith('http://localhost:5000')) {
    const activeBase = apiURL.replace('/api', '');
    return url.replace('http://localhost:5000', activeBase);
  }
  return url;
};

// Request interceptor to add JWT token to requests
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (name, email, password, contact) => API.post('/auth/register', { name, email, password, contact });
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// Items (Decorations and Rentals)
export const getDecorations = (params) => API.get('/decorations', { params });
export const getDecorationDetails = (id) => API.get(`/decorations/${id}`);
export const getRentals = (params) => API.get('/rentals', { params });
export const getRentalDetails = (id) => API.get(`/rentals/${id}`);
export const getCategories = (type) => API.get('/categories', { params: { type } });

// Cart
export const fetchCart = () => API.get('/cart');
export const addItemToCart = (itemData) => API.post('/cart', itemData);
export const updateCartItem = (itemId, itemData) => API.put(`/cart/${itemId}`, itemData);
export const deleteCartItem = (itemId) => API.delete(`/cart/${itemId}`);
export const clearUserCart = () => API.post('/cart/clear');

// Bookings & Payments
export const checkAvailability = (items, eventDate) => API.post('/bookings/check-availability', { items, eventDate });
export const createBookingOrder = (bookingData) => API.post('/bookings', bookingData);
export const getBookingHistory = () => API.get('/bookings/history');
export const getBookingDetails = (id) => API.get(`/bookings/${id}`);
export const downloadInvoiceUrl = (id) => `${API.defaults.baseURL}/bookings/${id}/invoice`;

// Reviews
export const fetchItemReviews = (itemType, itemId) => API.get(`/reviews/${itemType}/${itemId}`);
export const submitReview = (reviewData) => API.post('/reviews', reviewData);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

// Admin dashboard analytics & actions
export const fetchAdminDashboard = () => API.get('/admin/dashboard');
export const fetchAdminUsers = () => API.get('/admin/users');
export const fetchAdminBookings = () => API.get('/bookings/admin/all');
export const updateAdminBookingStatus = (id, statusData) => API.put(`/bookings/admin/${id}/status`, statusData);

// Admin Item Management
export const createDecorationPackage = (data) => API.post('/decorations', data);
export const updateDecorationPackage = (id, data) => API.put(`/decorations/${id}`, data);
export const deleteDecorationPackage = (id) => API.delete(`/decorations/${id}`);

export const createRentalProp = (data) => API.post('/rentals', data);
export const updateRentalProp = (id, data) => API.put(`/rentals/${id}`, data);
export const deleteRentalProp = (id) => API.delete(`/rentals/${id}`);

export const createCategoryAdmin = (data) => API.post('/categories', data);
export const deleteCategoryAdmin = (id) => API.delete(`/categories/${id}`);

// Image Uploads
export const uploadImage = (formData) => API.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default API;
