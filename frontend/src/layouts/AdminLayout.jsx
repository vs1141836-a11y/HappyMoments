import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  BarChart3, 
  CalendarCheck, 
  Sparkles, 
  Boxes, 
  Tags, 
  Users, 
  ArrowLeft,
  LogOut
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Decor Packages', path: '/admin/decorations', icon: Sparkles },
    { name: 'Prop Rentals', path: '/admin/rentals', icon: Boxes },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Users List', path: '/admin/users', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#070b13] text-zinc-300 font-sans overflow-hidden">
      
      {/* Sidebar Panel */}
      <aside className="w-64 bg-[#0a1120] border-r border-gold-400/10 flex flex-col shrink-0">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-gold-400/10 flex flex-col justify-center">
          <Link to="/" className="flex flex-col">
            <span className="font-outfit font-bold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-700">
              HAPPYMOMENTS
            </span>
            <span className="text-[8px] font-sans tracking-[0.25em] text-gold-300/80 -mt-0.5 uppercase">
              Admin Console
            </span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold tracking-wider font-outfit transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gold-400 text-black shadow-luxury'
                    : 'text-zinc-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Back and Logout buttons */}
        <div className="p-4 border-t border-gold-400/10 space-y-2">
          <Link
            to="/"
            className="flex items-center px-4 py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Session
          </button>
        </div>

      </aside>

      {/* Main Admin Screen */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Panel */}
        <header className="h-16 bg-[#0a1120] border-b border-gold-400/10 px-8 flex justify-between items-center shrink-0">
          <h2 className="font-outfit text-white tracking-widest text-lg font-bold">
            {menuItems.find(m => isActive(m.path))?.name || 'Admin Console'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-white font-semibold">{user?.name}</p>
              <p className="text-[10px] text-gold-400 tracking-wider">Super Administrator</p>
            </div>
            <div className="h-8 w-8 rounded-full border border-gold-400/50 bg-slate-900 flex items-center justify-center text-gold-400 font-bold uppercase text-xs">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable view body */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#070b13]">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
