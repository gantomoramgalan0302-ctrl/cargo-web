import { Link, useLocation } from 'react-router';
import { ShoppingCart, Menu, X, LogOut, User, Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PublicLayoutProps {
  children: React.ReactNode;
  cartItemsCount?: number;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  window.location.href = '/';
}

export default function PublicLayout({ children, cartItemsCount = 0 }: PublicLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const isLoggedIn = !!token;
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const showInstallNav = !isInstalled && (canInstall || isIOS);

  const navigation = [
    { name: 'Нүүр', href: '/' },
    { name: 'Үйлчилгээ', href: '/services' },
    { name: 'Дэлгүүр', href: '/store' },
    { name: 'Холбоо барих', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5FBEF] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#2E7D32]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                <img src="/logo.svg" alt="Narlag Orchin" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B5E20] tracking-tight">NARLAG ORCHIN</h1>
                <p className="text-xs text-[#5D4037]">Ногоон орчин бүтээгч</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-[#2E7D32] text-white shadow-md'
                      : 'text-[#1B5E20] hover:bg-[#F5FBEF]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* App суулгах — nav-д */}
              {showInstallNav && (
                <button
                  onClick={() => isIOS ? setShowIOSModal(true) : install()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#2E7D32] hover:bg-[#F5FBEF] transition-all font-medium border border-[#2E7D32]/30 ml-1"
                >
                  <Download className="w-4 h-4" />
                  Апп суулгах
                </button>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link to="/cart" className="relative">
                <Button variant="outline" size="icon" className="rounded-xl border-[#2E7D32]/20 hover:bg-[#F5FBEF]">
                  <ShoppingCart className="w-5 h-5 text-[#2E7D32]" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FBC02D] text-[#1B5E20] rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Auth button — desktop */}
              {isLoggedIn ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/dashboard">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5FBEF] hover:bg-[#e8f5e0] transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-[#1B5E20]">
                        {user?.lastName || user?.firstName || 'Хэрэглэгч'}
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> Гарах
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:block">
                  <Button className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg">
                    Нэвтрэх
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#F5FBEF] text-[#2E7D32]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2E7D32]/10 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-[#2E7D32] text-white'
                      : 'text-[#1B5E20] hover:bg-[#F5FBEF]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* App суулгах — mobile menu */}
              {showInstallNav && (
                <button
                  onClick={() => { setMobileMenuOpen(false); isIOS ? setShowIOSModal(true) : install(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#2E7D32] border border-[#2E7D32]/20 hover:bg-[#F5FBEF] transition-colors font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  Апп суулгах
                </button>
              )}

              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F5FBEF]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-[#1B5E20]">
                        {user?.lastName} {user?.firstName}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Гарах
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20]">
                    Нэвтрэх
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* iOS install guide modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B5E20]">iPhone-д суулгах заавар</h3>
              <button onClick={() => setShowIOSModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <ol className="space-y-3 text-sm text-[#5D4037]">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">1</span>
                <span>Safari-н доод хэсэгт <strong>📤 Share</strong> товчийг дарна</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">2</span>
                <span><strong>"Add to Home Screen"</strong> сонгоно</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">3</span>
                <span>Баруун дээд буланд <strong>"Add"</strong> дарна</span>
              </li>
            </ol>
            <Button className="w-full mt-5 bg-[#2E7D32] hover:bg-[#1B5E20]"
              onClick={() => setShowIOSModal(false)}>
              Ойлголоо
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
                  <img src="/logo.svg" alt="Narlag Orchin" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold">NARLAG ORCHIN</h3>
              </div>
              <p className="text-white/80 max-w-md">
                Монголын тэргүүлэгч ландшафт дизайн болон цэцэрлэгжүүлэлтийн компани.
                Бид байгалийн гоо үзэсгэлэнг таны амьдралд авчрах болно.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Холбоосууд</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/services" className="hover:text-white transition-colors">Үйлчилгээ</Link></li>
                <li><Link to="/store" className="hover:text-white transition-colors">Дэлгүүр</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Холбоо барих</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Холбоо барих</h4>
              <ul className="space-y-2 text-white/80">
                <li>Утас: +976 9604 8090</li>
                <li>И-мэйл: narlagorchin@gmail.com</li>
                <li>Хаяг: Улаанбаатар, Монгол</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2026 NARLAG ORCHIN. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
