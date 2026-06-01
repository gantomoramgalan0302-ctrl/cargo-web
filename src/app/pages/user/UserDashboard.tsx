import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Package, ShoppingBag, Heart, User, Phone, Mail, MapPin, LogOut, Copy } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

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

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} хуулагдлаа`));
}

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      // Not logged in → redirect to login
      window.location.href = '/login';
      return;
    }
    setUser(u);
  }, []);

  if (!user) return null;

  const fullName = [user.lastName, user.firstName].filter(Boolean).join(' ');

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B5E20]">Миний хяналтын самбар</h1>
            <p className="text-[#5D4037]/70 mt-1">Сайн байна уу, <span className="font-semibold text-[#2E7D32]">{fullName}</span>!</p>
          </div>
          <Button
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50 gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Гарах
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — profile card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center shadow-lg mb-3">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1B5E20]">{fullName || 'Хэрэглэгч'}</h2>
                  <span className="text-xs mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Хэрэглэгч
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-3 text-sm">
                  {user.email && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F5FBEF]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span className="text-[#1B5E20] truncate">{user.email}</span>
                      </div>
                      <button onClick={() => copyText(user.email, 'И-мэйл')} className="shrink-0 text-[#2E7D32]/50 hover:text-[#2E7D32]">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F5FBEF]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span className="text-[#1B5E20]">{user.phone}</span>
                      </div>
                      <button onClick={() => copyText(user.phone, 'Утас')} className="shrink-0 text-[#2E7D32]/50 hover:text-[#2E7D32]">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F5FBEF]">
                    <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span className="text-[#1B5E20]">Улаанбаатар, Монгол</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — stats + orders */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-[#2E7D32]/10">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="flex items-center gap-1.5 text-sm text-[#1B5E20]">
                    <Package className="w-4 h-4" /> Захиалга
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-3xl font-bold text-[#2E7D32]">0</div>
                  <p className="text-xs text-[#5D4037]/60">Нийт захиалга</p>
                </CardContent>
              </Card>

              <Card className="border-[#2E7D32]/10">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="flex items-center gap-1.5 text-sm text-[#1B5E20]">
                    <ShoppingBag className="w-4 h-4" /> Зарцуулсан
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold text-[#2E7D32]">0₮</div>
                  <p className="text-xs text-[#5D4037]/60">Нийт дүн</p>
                </CardContent>
              </Card>

              <Card className="border-[#2E7D32]/10">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="flex items-center gap-1.5 text-sm text-[#1B5E20]">
                    <Heart className="w-4 h-4" /> Хадгалсан
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-3xl font-bold text-[#2E7D32]">0</div>
                  <p className="text-xs text-[#5D4037]/60">Дуртай бүтээгдэхүүн</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent orders */}
            <Card className="border-[#2E7D32]/10">
              <CardHeader>
                <CardTitle className="text-[#1B5E20] text-base">Сүүлийн захиалгууд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-[#5D4037]/50 text-sm">Захиалга байхгүй байна</p>
                  <Button
                    className="mt-4 bg-[#2E7D32] hover:bg-[#1B5E20] rounded-xl"
                    onClick={() => window.location.href = '/store'}
                  >
                    Дэлгүүр үзэх
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
