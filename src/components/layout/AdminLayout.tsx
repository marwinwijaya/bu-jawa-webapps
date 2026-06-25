import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/menu', label: 'Menu' },
    { to: '/admin/categories', label: 'Kategori' },
    { to: '/admin/gallery', label: 'Gallery' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg text-brown-600">Admin Panel</h2>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-4 py-2 rounded-lg hover:bg-brown-50 text-gray-700 hover:text-brown-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm"
          >
            ← Lihat Situs
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}
