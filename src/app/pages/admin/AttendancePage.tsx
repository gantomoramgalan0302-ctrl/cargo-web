import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, MapPin, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [weekMap, setWeekMap] = useState<Record<string, Record<string, string>>>({});
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (d: Date) => {
    setLoading(true);
    try {
      const dateStr = fmt(d);
      const res = await apiFetch(`/api/admin/attendance?date=${dateStr}`);
      const data = await res.json();
      setAttendance(data.attendance || []);
    } catch { toast.error('Ирц татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  const fetchWeek = async (d: Date) => {
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const start = fmt(firstDay);
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    try {
      const res = await apiFetch(`/api/admin/attendance/week?start=${start}&days=${days}`);
      const data = await res.json();
      setWeekDates(data.dates || []);
      setWeekMap(data.map || {});
    } catch {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch('/api/admin/employees');
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch {}
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance(date);
    fetchWeek(date);
  }, []);

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    fetchAttendance(d);
    fetchWeek(d);
  };

  const present = attendance.filter(a => a.status === 'present').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const total = attendance.length;

  const getStatusBadge = (status: string) => {
    if (status === 'present') return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Ирсэн</Badge>;
    if (status === 'late') return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Хоцорсон</Badge>;
    return <Badge className="bg-red-100 text-red-600"><XCircle className="w-3 h-3 mr-1" />Тасалсан</Badge>;
  };

  const getCellColor = (status: string) => {
    if (status === 'present') return 'bg-green-200 title="Ирсэн"';
    if (status === 'late') return 'bg-yellow-200';
    if (status === 'absent') return 'bg-red-200';
    return 'bg-gray-100';
  };

  const attendancePct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-1">Ирц бүртгэл</h1>
          <p className="text-[#5D4037]/70">{fmt(date)} · Нийт ирц: {attendancePct}%</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/60">Нийт</p>
                <p className="text-2xl font-bold text-[#1B5E20]">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/60">Ирсэн</p>
                <p className="text-2xl font-bold text-green-600">{present}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/60">Хоцорсон</p>
                <p className="text-2xl font-bold text-yellow-600">{late}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[#5D4037]/60">Тасалсан</p>
                <p className="text-2xl font-bold text-red-500">{absent}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance List */}
          <div className="lg:col-span-2">
            <Card className="border-[#2E7D32]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1B5E20] text-lg">
                  <Activity className="w-5 h-5" />
                  {fmt(date)}-ний ирц
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-[#5D4037]/60">Уншиж байна...</div>
                ) : attendance.length === 0 ? (
                  <div className="text-center py-8 text-[#5D4037]/60">
                    Энэ өдрийн ирц бүртгэгдээгүй байна
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendance.map((rec: any) => (
                      <div key={rec.userId}
                        className="flex items-center justify-between p-4 rounded-xl bg-[#F5FBEF] hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white font-bold text-sm">
                            {rec.employeeName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1B5E20]">{rec.employeeName}</p>
                            {rec.location && (
                              <div className="flex items-center gap-1 text-xs text-[#5D4037]/60">
                                <MapPin className="w-3 h-3" />{rec.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-1">{getStatusBadge(rec.status)}</div>
                          <p className="text-xs text-[#5D4037]/70">
                            {rec.checkIn || '—'}
                            {rec.checkOut ? ` → ${rec.checkOut}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div>
            <Card className="border-[#2E7D32]/10">
              <CardHeader>
                <CardTitle className="text-[#1B5E20] text-lg">Календарь</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-xl border-[#2E7D32]/10"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-50">
                    <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />Ирсэн</span>
                    <span className="font-bold text-green-700">{present}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-yellow-50">
                    <span className="flex items-center gap-1 text-yellow-700"><Clock className="w-3.5 h-3.5" />Хоцорсон</span>
                    <span className="font-bold text-yellow-700">{late}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-red-50">
                    <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3.5 h-3.5" />Тасалсан</span>
                    <span className="font-bold text-red-600">{absent}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-[#F5FBEF] border border-[#2E7D32]/10">
                    <span className="text-[#1B5E20] font-medium">Нийт ирц</span>
                    <span className="font-bold text-[#2E7D32]">{attendancePct}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Heatmap */}
        <Card className="border-[#2E7D32]/10">
          <CardHeader>
            <CardTitle className="text-[#1B5E20]">
              Сарын ирц хуваарь — {date.getFullYear()}/{String(date.getMonth() + 1).padStart(2, '0')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-center text-gray-400 py-6">Ажилтан бүртгэгдээгүй байна</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2E7D32]/10">
                      <th className="text-left p-2 text-sm font-medium text-[#1B5E20] whitespace-nowrap min-w-32">Ажилтан</th>
                      {weekDates.map(d => (
                        <th key={d} className="p-1 text-center font-medium text-[#1B5E20]">
                          {d.slice(8)}
                        </th>
                      ))}
                      <th className="p-2 text-center font-medium text-[#1B5E20]">Хувь</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp: any) => {
                      const uid = String(emp.id);
                      const empMap = weekMap[uid] || {};
                      const worked = weekDates.filter(d => empMap[d] === 'present' || empMap[d] === 'late').length;
                      const pct = weekDates.length > 0 ? Math.round((worked / weekDates.length) * 100) : 0;
                      return (
                        <tr key={uid} className="border-b border-[#2E7D32]/5 hover:bg-[#F5FBEF]/50">
                          <td className="p-2 font-medium text-[#1B5E20] whitespace-nowrap">
                            {emp.lastName} {emp.firstName}
                          </td>
                          {weekDates.map(d => {
                            const s = empMap[d];
                            return (
                              <td key={d} className="p-1">
                                <div className={`w-6 h-6 rounded mx-auto ${
                                  s === 'present' ? 'bg-green-300' :
                                  s === 'late' ? 'bg-yellow-300' :
                                  s === 'absent' ? 'bg-red-300' :
                                  'bg-gray-100'
                                }`} title={s || 'мэдэгдэхгүй'} />
                              </td>
                            );
                          })}
                          <td className="p-2 text-center">
                            <span className={`font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#5D4037]/70">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-300 rounded inline-block" />Ирсэн</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-300 rounded inline-block" />Хоцорсон</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-300 rounded inline-block" />Тасалсан</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded inline-block" />Бүртгэлгүй</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
