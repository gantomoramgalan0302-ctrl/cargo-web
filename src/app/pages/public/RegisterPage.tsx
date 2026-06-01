import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!lastName || !firstName || !email || !phone || !password) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Нууц үг таарахгүй байна');
      return;
    }
    if (password.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байна');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName, firstName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Бүртгэлд алдаа гарлаа');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', 'customer');
      toast.success('Бүртгэл амжилттай!');
      navigate('/dashboard');
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
            <CardTitle className="text-3xl text-[#1B5E20]">Бүртгүүлэх</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Овог</Label>
                <Input
                  placeholder="Овог"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg border-[#2E7D32]/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Нэр</Label>
                <Input
                  placeholder="Нэр"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg border-[#2E7D32]/20"
                />
              </div>
            </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-[#2E7D32]/20"
              />
            </div>

            <div className="space-y-2">
              <Label>Нууц үг давтах</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border-[#2E7D32]/20"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <Button
              className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] mt-2"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </Button>

            <div className="text-center text-sm text-[#5D4037]/70">
              Бүртгэлтэй юу?{' '}
              <Link to="/login" className="text-[#2E7D32] hover:underline font-medium">
                Нэвтрэх
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
