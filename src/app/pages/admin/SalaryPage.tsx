import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function SalaryPage() {
  const today = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [salary, setSalary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [paying, setPaying] = useState(false);
  const [dailyRateEdit, setDailyRateEdit] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [halfDaysEdit, setHalfDaysEdit] = useState('0');
  const [savingHalfDays, setSavingHalfDays] = useState(false);

  const fetchSalary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/salary?month=${month}`);
      const data = await res.json();
      setSalary(data.salary || []);
    } catch { toast.error('Цалин татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSalary(); }, [month]);

  const handlePay = async (isPaid: boolean) => {
    if (!selected) return;
    setPaying(true);
    try {
      const res = await apiFetch(`/api/admin/salary/${selected.userId}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ month, isPaid }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success(isPaid ? 'Цалин олгогдлоо' : 'Цалин буцаагдлаа');
      setSelected(null);
      fetchSalary();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setPaying(false); }
  };

  const handleSaveDailyRate = async () => {
    if (!selected || !dailyRateEdit || Number(dailyRateEdit) <= 0) return;
    setSavingRate(true);
    try {
      const res = await apiFetch(`/api/admin/employees/${selected.userId}/dailyRate`, {
        method: 'PUT',
        body: JSON.stringify({ dailyRate: Number(dailyRateEdit) }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      const newRate = Number(dailyRateEdit);
      const hd = Number(halfDaysEdit) || 0;
      const newTotal = selected.workedDays * newRate - hd * (newRate / 2);
      setSelected((prev: any) => prev ? { ...prev, dailyRate: newRate, totalAmount: newTotal } : prev);
      setSalary(prev => prev.map(s =>
        s.userId === selected.userId ? { ...s, dailyRate: newRate, totalAmount: newTotal } : s
      ));
      toast.success('Өдрийн хөлс шинэчлэгдлээ');
      fetchSalary();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSavingRate(false); }
  };

  const handleSaveHalfDays = async () => {
    if (!selected) return;
    const n = Math.max(0, Math.floor(Number(halfDaysEdit) || 0));
    setSavingHalfDays(true);
    try {
      const res = await apiFetch(`/api/admin/salary/${selected.userId}/halfDays`, {
        method: 'PUT',
        body: JSON.stringify({ month, halfDays: n }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      setSelected((prev: any) => prev ? { ...prev, halfDays: n, totalAmount: data.totalAmount } : prev);
      setSalary(prev => prev.map(s =>
        s.userId === selected.userId ? { ...s, halfDays: n, totalAmount: data.totalAmount } : s
      ));
      toast.success('Хагас өдөр хадгалагдлаа');
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSavingHalfDays(false); }
  };

  // Нийт цалин тооцоо (dialog дотор live preview)
  const computedTotal = (workedDays: number, rate: number, hd: number) =>
    workedDays * rate - hd * (rate / 2);

  const totalPaid = salary.filter(s => s.isPaid).reduce((a, s) => a + s.totalAmount, 0);
  const totalUnpaid = salary.filter(s => !s.isPaid).reduce((a, s) => a + s.totalAmount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-[#1B5E20]">Цалингийн систем</h1>
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="w-44 border-[#2E7D32]/20" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/70">Нийт ажилтан</p>
                <p className="text-xl font-bold text-[#1B5E20]">{salary.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/70">Олгосон</p>
                <p className="text-xl font-bold text-[#1B5E20]">{totalPaid.toLocaleString()}₮</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/70">Олгоогүй</p>
                <p className="text-xl font-bold text-red-500">{totalUnpaid.toLocaleString()}₮</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : salary.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Энэ сард ажилтан бүртгэгдсэнгүй</div>
        ) : (
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20] text-lg">Цалингийн жагсаалт — {month}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#2E7D32]/10">
                {salary.map((s: any) => (
                  <div key={s.userId}
                    className="flex items-center justify-between px-5 py-4 hover:bg-[#F5FBEF] cursor-pointer transition-colors"
                    onClick={() => {
                      setSelected(s);
                      setDailyRateEdit(String(s.dailyRate));
                      setHalfDaysEdit(String(s.halfDays || 0));
                    }}>
                    <div>
                      <p className="font-medium text-[#1B5E20]">{s.lastName} {s.firstName}</p>
                      <p className="text-xs text-[#5D4037]/70">{s.position}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-[#5D4037]/70 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{s.workedDays} өдөр</span>
                        {s.halfDays > 0 && (
                          <span className="text-orange-500 text-xs">({s.halfDays} хагас)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{s.dailyRate.toLocaleString()}₮/өдөр</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1B5E20]">{s.totalAmount.toLocaleString()}₮</p>
                      <Badge className={s.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                        {s.isPaid ? 'Олгосон' : 'Олгоогүй'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">
              {selected?.lastName} {selected?.firstName}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-[#F5FBEF] rounded-lg p-4 space-y-3 text-sm">
                {/* Ажилсан өдөр */}
                <div className="flex justify-between items-center">
                  <span className="text-[#5D4037]/70">Ажилсан өдөр</span>
                  <span className="font-semibold">{selected.workedDays} өдөр</span>
                </div>

                {/* Хагас өдөр */}
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[#5D4037]/70 shrink-0">Хагас өдөр</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={selected.workedDays * 2}
                      step={1}
                      value={halfDaysEdit}
                      onChange={e => setHalfDaysEdit(e.target.value)}
                      className="w-20 h-8 text-right font-semibold text-orange-600"
                    />
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-xs shrink-0"
                      onClick={handleSaveHalfDays}
                      disabled={savingHalfDays || Number(halfDaysEdit) === (selected.halfDays || 0)}
                    >
                      {savingHalfDays ? '...' : 'Хадгалах'}
                    </Button>
                  </div>
                </div>

                {/* Өдрийн хөлс — шууд засварлах */}
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[#5D4037]/70 shrink-0">Өдрийн хөлс</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        min={1000}
                        step={1000}
                        value={dailyRateEdit}
                        onChange={e => setDailyRateEdit(e.target.value)}
                        className="w-32 h-8 text-right pr-6 font-semibold text-[#1B5E20]"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#5D4037]/60 pointer-events-none">₮</span>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-xs shrink-0"
                      onClick={handleSaveDailyRate}
                      disabled={savingRate || Number(dailyRateEdit) === selected.dailyRate}
                    >
                      {savingRate ? '...' : 'Хадгалах'}
                    </Button>
                  </div>
                </div>

                {/* Хагас өдрийн хасалт харуулах */}
                {Number(halfDaysEdit) > 0 && (
                  <div className="flex justify-between items-center text-orange-600">
                    <span>Хагас өдрийн хасалт ({halfDaysEdit} × {(Number(dailyRateEdit || selected.dailyRate) / 2).toLocaleString()}₮)</span>
                    <span>−{(Number(halfDaysEdit) * (Number(dailyRateEdit || selected.dailyRate) / 2)).toLocaleString()}₮</span>
                  </div>
                )}

                {/* Нийт цалин */}
                <div className="flex justify-between items-center border-t border-[#2E7D32]/10 pt-3">
                  <span className="text-[#5D4037] font-medium">Нийт цалин</span>
                  <span className="font-bold text-lg text-[#1B5E20]">
                    {computedTotal(
                      selected.workedDays,
                      Number(dailyRateEdit || selected.dailyRate),
                      Number(halfDaysEdit) || 0
                    ).toLocaleString()}₮
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handlePay(true)}
                  disabled={paying || selected.isPaid}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Олгосон
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => handlePay(false)}
                  disabled={paying || !selected.isPaid}>
                  <XCircle className="w-4 h-4 mr-1" /> Олгоогүй
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
