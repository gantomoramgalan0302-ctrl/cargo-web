import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LoginPageProps {
  setAuth: (value: boolean) => void;
  setRole: (role: 'customer' | 'admin' | 'worker') => void;
}

export default function LoginPage({ setAuth, setRole }: LoginPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@narlag.mn');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [phone, setPhone] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveAndNavigate = (token: string, user: any, role: 'customer' | 'admin' | 'worker') => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth(true);
    setRole(role);
    toast.success('Амжилттай нэвтэрлээ!');
    if (role === 'admin') navigate('/admin');
    else if (role === 'worker') navigate('/worker');
    else navigate('/dashboard');
  };

  const handleCustomerLogin = async () => {
    if (!email || !password) {
      toast.error('И-мэйл болон нууц үгээ оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Нэвтрэхэд алдаа гарлаа');
        return;
      }
      const role = data.user.role === 'admin' ? 'admin' : 'customer';
      saveAndNavigate(data.token, data.user, role);
    } catch {
      toast.error('Серверт холбогдож чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      toast.error('И-мэйл болон нууц үгээ оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Нэвтрэхэд алдаа гарлаа');
        return;
      }
      saveAndNavigate(data.token, data.user, 'admin');
    } catch {
      toast.error('Серверт холбогдож чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerLogin = async () => {
    if (!phone || !workerPassword) {
      toast.error('Утасны дугаар болон нууц үгээ оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: workerPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Нэвтрэхэд алдаа гарлаа');
        return;
      }
      saveAndNavigate(data.token, data.user, 'worker');
    } catch {
      toast.error('Серверт холбогдож чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-[#2E7D32]/10 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
              <img src="/logo.svg" alt="Narlag Orchin" className="w-full h-full object-cover" />
            </div>
            <CardTitle className="text-3xl text-[#1B5E20]">Нэвтрэх</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="customer">Хэрэглэгч</TabsTrigger>
                <TabsTrigger value="admin">Админ</TabsTrigger>
                <TabsTrigger value="worker">Ажилтан</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <div className="space-y-2">
                  <Label>И-мэйл</Label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Нууц үг</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomerLogin()}
                  />
                </div>
                <Button
                  className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]"
                  onClick={handleCustomerLogin}
                  disabled={loading}
                >
                  {loading ? 'Нэвтэрж байна...' : 'Нэвтрэх'}
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label>И-мэйл</Label>
                  <Input
                    type="email"
                    placeholder="admin@narlag.mn"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Нууц үг</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <Button
                  className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]"
                  onClick={handleAdminLogin}
                  disabled={loading}
                >
                  {loading ? 'Нэвтэрж байна...' : 'Админаар нэвтрэх'}
                </Button>
              </TabsContent>

              <TabsContent value="worker" className="space-y-4">
                <div className="space-y-2">
                  <Label>Утасны дугаар</Label>
                  <Input
                    type="tel"
                    placeholder="99112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Нууц үг</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={workerPassword}
                    onChange={(e) => setWorkerPassword(e.target.value)}
                    className="rounded-lg border-[#2E7D32]/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleWorkerLogin()}
                  />
                </div>
                <Button
                  className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]"
                  onClick={handleWorkerLogin}
                  disabled={loading}
                >
                  {loading ? 'Нэвтэрж байна...' : 'Ажилтнаар нэвтрэх'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-[#5D4037]/70">
              Бүртгэлгүй юу?{' '}
              <Link to="/register" className="text-[#2E7D32] hover:underline font-medium">
                Бүртгүүлэх
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
