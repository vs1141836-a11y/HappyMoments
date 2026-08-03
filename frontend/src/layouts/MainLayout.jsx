import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#000814]">
      <Navbar />
      <main className="flex-grow pt-[80px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
