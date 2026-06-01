import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState, Component, ReactNode } from 'react';
import { Toaster } from './components/ui/sonner';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import StorePage from './pages/public/StorePage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ContactPage from './pages/public/ContactPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectsPage from './pages/admin/ProjectsPage';
import ProjectDetailPage from './pages/admin/ProjectDetailPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import AttendancePage from './pages/admin/AttendancePage';
import SalaryPage from './pages/admin/SalaryPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import QuotationPage from './pages/admin/QuotationPage';
import EquipmentPage from './pages/admin/EquipmentPage';

// Worker Pages
import FieldWorkerPage from './pages/worker/FieldWorkerPage';

// PWA
import PWAInstallBanner from './components/PWAInstallBanner';

// ─── Global Error Boundary ────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff0f0', minHeight: '100vh' }}>
          <h2 style={{ color: '#c00', marginBottom: 8 }}>⚠️ Алдаа гарлаа</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#333', fontSize: 13, background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #eee', overflowX: 'auto' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            style={{ marginTop: 16, padding: '8px 20px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            Нүүр хуудас руу буцах
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'worker'>(
    () => (localStorage.getItem('userRole') as 'customer' | 'admin' | 'worker') || 'customer'
  );

  const handleSetAuth = (value: boolean) => {
    if (!value) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
    setIsAuthenticated(value);
  };

  const handleSetRole = (role: 'customer' | 'admin' | 'worker') => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  const addToCart = (product: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  return (
    <>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage addToCart={addToCart} />} />
            <Route path="/store" element={<StorePage addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetailPage addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  updateCartQuantity={updateCartQuantity}
                />
              }
            />
            <Route path="/login" element={<LoginPage setAuth={handleSetAuth} setRole={handleSetRole} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* User Routes */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<ProjectsPage />} />
            <Route path="/admin/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/salary" element={<SalaryPage />} />
            <Route path="/admin/documents" element={<DocumentsPage />} />
            <Route path="/admin/quotation" element={<QuotationPage />} />
            <Route path="/admin/equipment" element={<EquipmentPage />} />

            {/* Worker Routes */}
            <Route path="/worker" element={<FieldWorkerPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
      <PWAInstallBanner />
    </>
  );
}
