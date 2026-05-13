import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity">
            <span className="text-2xl">✈️</span>
            <span>TravelPlanner</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-blue-100 text-sm">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.firstName?.charAt(0)}
                </span>
                <span>{user.firstName} {user.lastName}</span>
                <span className={`badge ${user.role === 'Admin' ? 'bg-amber-400 text-amber-900' : 'bg-blue-400 text-blue-900'}`}>
                  {user.role}
                </span>
              </div>

              {isAdmin() && (
                <Link to="/admin" className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors">
                  ⚙️ Admin
                </Link>
              )}

              <Link to="/dashboard" className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors">
                🏠 Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Odjava
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;