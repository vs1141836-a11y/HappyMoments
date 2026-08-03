import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Component Protectors
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

// General Pages
import Home from './pages/Home.jsx';
import Packages from './pages/Packages.jsx';
import Rentals from './pages/Rentals.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Success from './pages/Success.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Policies from './pages/Policies.jsx';

// Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminBookings from './pages/AdminBookings.jsx';
import AdminDecorations from './pages/AdminDecorations.jsx';
import AdminRentals from './pages/AdminRentals.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminUsers from './pages/AdminUsers.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              
              {/* 1. Main Storefront Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="decorations" element={<Packages />} />
                <Route path="rentals" element={<Rentals />} />
                <Route path="item/:type/:id" element={<ItemDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                
                {/* Policies redirection mapping */}
                <Route path="privacy-policy" element={<Policies />} />
                <Route path="terms-conditions" element={<Policies />} />
                <Route path="cancellation-policy" element={<Policies />} />
                <Route path="faq" element={<Policies />} />
                
                {/* Auth */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />

                {/* Logged-in Customer Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="success" element={<Success />} />
                  <Route path="dashboard" element={<Dashboard />} />
                </Route>
              </Route>

              {/* 2. Admin Protected Console Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="decorations" element={<AdminDecorations />} />
                  <Route path="rentals" element={<AdminRentals />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Route>

            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
