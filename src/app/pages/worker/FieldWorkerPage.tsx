import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Clock, LogIn, LogOut, User, CalendarDays, Landmark, Save, Wrench, RotateCcw, FolderKanban, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';
import { logout } from '../../utils/auth';

const statusColor: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};
const statusLabel: Record<string, string> = {
  'on-track': 'Хугацаандаа', delayed: 'Хоцорсон', completed: 'Дууссан',
};

export default function FieldWorkerPage() {
  const [me, setMe] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const fetchData = async () => {
    try {
      const [meRes, projRes, equipRes] = await Promise.all([
        apiFetch('/api/worker/me'),
        apiFetch('/api/worker/projects'),
        apiFetch('/api/worker/equipment'),
      ]);
      const meData = await meRes.json();
      const projData = await projRes.json();
      const equipData = await equipRes.json();
      setMe(meData);
      setAttendance(meData.todayAttendance || null);
      setBankName(meData.bankAccount?.bankName || '');
      setAccountNumber(meData.bankAccount?.accountNumber || '');
      setProjects(projData.projects || []);
      setEquipment(equipData.equipment || []);
    } catch { toast.error('Мэдээлэл татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      const res = await apiFetch('/api/worker/attendance/checkin', { method: 'POST', body: JSON.stringify({ location: 'Талбай' }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success(`Ирц бүртгэгдлээ — ${data.record?.checkIn}`);
      setAttendance(data.record);
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setChecking(false); }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      const res = await apiFetch('/api/worker/attendance/checkout', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success(`Гарсан цаг бүртгэгдлээ — ${data.record?.checkOut}`);
      setAttendance(data.record);
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setChecking(false); }
  };

  const handleReturnEquip = async (projectId: string, eqId: string) => {
    try {
      const res = await apiFetch(`/api/worker/equipment/${projectId}/${eqId}/return`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Багаж буцаагдлаа');
      setEquipment(prev => prev.filter(e => String(e._id) !== eqId));
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      const res = await apiFetch('/api/worker/bank', {
        method: 'PUT',
        body: JSON.stringify({ bankName, accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Дансны мэдээлэл хадгалагдлаа');
      setMe((prev: any) => ({ ...prev, bankAccount: data.bankAccount }));
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSavingBank(false); }
  };

  const checkedIn = !!attendance?.checkIn;
  const checkedOut = !!attendance?.checkOut;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="min-h-screen bg-[#F5FBEF] flex flex-col">
      <header className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Сайн байна уу</p>
            <h1 className="font-bold text-lg">{me?.lastName} {me?.firstName}</h1>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            {me?.profile?.status === 'active' ? 'Идэвхтэй' : 'Ажилтан'}
          </Badge>
        </div>
      </header>

      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : activeTab === 'home' ? (
          <div className="space-y-4">
            {/* Today attendance */}
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-5">
                <h2 className="font-semibold text-[#1B5E20] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Өнөөдрийн ирц
                </h2>
                {attendance ? (
                  <div className="bg-[#F5FBEF] rounded-lg p-3 mb-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5D4037]/70">Ирсэн цаг</span>
                      <span className="font-medium">{attendance.checkIn || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D4037]/70">Гарсан цаг</span>
                      <span className="font-medium">{attendance.checkOut || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D4037]/70">Төлөв</span>
                      <Badge className={
                        attendance.status === 'present' ? 'bg-green-100 text-green-700' :
                        attendance.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }>
                        {attendance.status === 'present' ? 'Цагтаа' :
                         attendance.status === 'late' ? 'Хоцорсон' : 'Тасалсан'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#5D4037]/60 mb-4">Өнөөдрийн ирц бүртгэгдээгүй байна</p>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"
                    onClick={handleCheckIn} disabled={checking || checkedIn}>
                    <LogIn className="w-4 h-4" />
                    {checkedIn ? 'Ирсэн' : 'Ирцэд бүртгүүлэх'}
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline"
                    onClick={handleCheckOut} disabled={checking || !checkedIn || checkedOut}>
                    <LogOut className="w-4 h-4" />
                    {checkedOut ? 'Гарсан' : 'Гарсан тэмдэглэх'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Worked days stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-[#2E7D32]/10 text-center">
                <CardContent className="p-4">
                  <CalendarDays className="w-6 h-6 text-[#2E7D32] mx-auto mb-1" />
                  <p className="text-xl font-bold text-[#1B5E20]">{me?.workedDaysMonth ?? 0}</p>
                  <p className="text-xs text-[#5D4037]/60">Энэ сарын өдөр</p>
                </CardContent>
              </Card>
              <Card className="border-[#2E7D32]/10 text-center">
                <CardContent className="p-4">
                  <CalendarDays className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-[#1B5E20]">{me?.workedDaysYear ?? 0}</p>
                  <p className="text-xs text-[#5D4037]/60">Энэ жилийн өдөр</p>
                </CardContent>
              </Card>
            </div>

            {/* Salary card */}
            <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Энэ сарын цалин</p>
                    <p className="text-3xl font-bold">{fmt(me?.salary ?? 0)}₮</p>
                    <p className="text-sm opacity-70 mt-1">{fmt(me?.dailyRate ?? 50000)}₮/өдөр</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Landmark className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-sm">
                  <span className="opacity-70">Ажилсан өдөр</span>
                  <span className="font-semibold">{me?.workedDaysMonth ?? 0} өдөр × {fmt(me?.dailyRate ?? 50000)}₮</span>
                </div>
              </CardContent>
            </Card>

            {/* My projects */}
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-5">
                <h2 className="font-semibold text-[#1B5E20] mb-3 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" /> Миний төслүүд
                </h2>
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Оноогдсон төсөл байхгүй</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((p: any) => (
                      <div key={p._id} className="p-3 rounded-lg bg-[#F5FBEF]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm text-[#1B5E20]">{p.name}</p>
                          <Badge className={statusColor[p.status] || ''}>{statusLabel[p.status] || p.status}</Badge>
                        </div>
                        <p className="text-xs text-[#5D4037]/60 mb-2">{p.client}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div className="bg-[#2E7D32] h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{p.progress || 0}% гүйцэтгэл</span>
                          {p.deadline && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />Дуусах: {p.deadline}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manager equipment — only shows if worker is manager on a project */}
            {equipment.length > 0 && (
              <Card className="border-[#2E7D32]/10">
                <CardContent className="p-5">
                  <h2 className="font-semibold text-[#1B5E20] mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Хариуцсан багаж хэрэгсэл
                  </h2>
                  <div className="space-y-3">
                    {equipment.map((eq: any) => (
                      <div key={eq._id} className="p-3 rounded-lg bg-[#F5FBEF] border border-[#2E7D32]/10">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[#1B5E20]">{eq.equipmentName}</p>
                            <p className="text-xs text-[#5D4037]/60">Тоо: {eq.quantity}</p>
                            <p className="text-xs text-[#5D4037]/50">Төсөл: {eq.projectName}</p>
                            <p className="text-xs text-[#5D4037]/40">
                              Хэрэглэсэн: {eq.assignedAt ? new Date(eq.assignedAt).toLocaleDateString('mn-MN') : '—'}
                            </p>
                          </div>
                          <Button size="sm" variant="outline"
                            className="border-[#2E7D32]/20 text-[#2E7D32] hover:bg-[#F5FBEF] gap-1 shrink-0"
                            onClick={() => handleReturnEquip(eq.projectId, String(eq._id))}>
                            <RotateCcw className="w-3 h-3" /> Буцаах
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Profile Tab */
          <div className="space-y-4">
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1B5E20]">{me?.lastName} {me?.firstName}</h2>
                    <p className="text-sm text-[#5D4037]/70">{me?.profile?.position || 'Ажилтан'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#2E7D32]/10">
                    <span className="text-[#5D4037]/70">И-мэйл</span>
                    <span>{me?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#2E7D32]/10">
                    <span className="text-[#5D4037]/70">Утас</span>
                    <span>{me?.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#2E7D32]/10">
                    <span className="text-[#5D4037]/70">Үнэлгээ</span>
                    <span className="text-amber-500 font-medium">⭐ {me?.profile?.rating || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#5D4037]/70">Гүйцэтгэсэн даалгавар</span>
                    <span className="font-medium text-[#2E7D32]">{me?.profile?.tasksCompleted || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank account */}
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1B5E20] mb-4 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> Банкны дансны мэдээлэл
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-[#5D4037]/70">Банкны нэр</Label>
                    <Input
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      placeholder="Жишээ: Хаан банк, Голомт банк..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5D4037]/70">Дансны дугаар</Label>
                    <Input
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder="Дансны дугаар"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"
                    onClick={handleSaveBank}
                    disabled={savingBank}>
                    <Save className="w-4 h-4" />
                    {savingBank ? 'Хадгалж байна...' : 'Хадгалах'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50"
              onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Гарах
            </Button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2E7D32]/10 flex">
        {[
          { key: 'home', icon: Clock, label: 'Нүүр' },
          { key: 'profile', icon: User, label: 'Профайл' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              activeTab === tab.key ? 'text-[#2E7D32]' : 'text-gray-400'
            }`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
