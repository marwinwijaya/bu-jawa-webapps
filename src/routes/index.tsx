import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public pages
import HomePage from '@/pages/HomePage';
import MenuPage from '@/pages/MenuPage';
import MenuDetailPage from '@/pages/MenuDetailPage';
import GalleryPage from '@/pages/GalleryPage';

// Admin pages
import LoginPage from '@/pages/admin/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import MenuManagementPage from '@/pages/admin/MenuManagementPage';
import CategoryManagementPage from '@/pages/admin/CategoryManagementPage';
import GalleryManagementPage from '@/pages/admin/GalleryManagementPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:slug" element={<MenuDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="gallery" element={<GalleryManagementPage />} />
      </Route>
    </Routes>
  );
}
