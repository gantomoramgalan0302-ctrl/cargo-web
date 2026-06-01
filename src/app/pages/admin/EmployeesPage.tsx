import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, UserPlus, Star, Phone, Mail, Copy, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/employees${search ? `?q=${search}` : ''}`);
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch { toast.error('Ажилтнууд татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/admin/users?role=user');
      const data = await res.json();
      setUsers(data.users || []);
    } catch { toast.error('Хэрэглэгчид татахад алдаа гарлаа'); }
  };

  useEffect(() => { fetchEmployees(); }, [search]);

  const openAddModal = () => {
    fetchUsers();
    setShowModal(true);
  };

  const promoteToWorker = async (userId: string) => {
    setPromoting(userId);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: 'worker' }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Ажилтан болголоо');
      setUsers(prev => prev.filter(u => u._id !== userId));
      fetchEmployees();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setPromoting(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B5E20]">Ажилтнууд</h1>
          <Button onClick={openAddModal} className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
            <UserPlus className="w-4 h-4" /> Ажилтан нэмэх
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Хайх..." className="pl-9" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Ажилтан олдсонгүй</p>
            <Button onClick={openAddModal} className="mt-4 bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
              <UserPlus className="w-4 h-4" /> Ажилтан нэмэх
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp: any) => (
              <Card key={emp.id} className="border-[#2E7D32]/10 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#1B5E20]">{emp.lastName} {emp.firstName}</h3>
                      <p className="text-sm text-[#5D4037]/70">{emp.position}</p>
                    </div>
                    <Badge className={emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {emp.status === 'active' ? 'Идэвхтэй' : 'Офлайн'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#5D4037]/80">
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{emp.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{emp.email}</div>
                    {emp.bankAccount?.accountNumber && (
                      <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-[#F5FBEF] border border-[#2E7D32]/10">
                        <Landmark className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#5D4037]/60">{emp.bankAccount.bankName || 'Банк'}</p>
                          <p className="font-medium text-[#1B5E20] truncate">{emp.bankAccount.accountNumber}</p>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(emp.bankAccount.accountNumber); toast.success('Хуулагдлаа'); }}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-[#2E7D32]/10 transition-colors"
                          title="Хуулах">
                          <Copy className="w-3.5 h-3.5 text-[#2E7D32]" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2E7D32]/10">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{emp.rating}</span>
                    </div>
                    <div className="text-sm text-[#5D4037]/70">
                      Хоцролт: <span className="text-red-500 font-medium">{emp.lateCount}</span>
                    </div>
                    <div className="text-sm text-[#5D4037]/70">
                      Даалгавар: <span className="text-[#2E7D32] font-medium">{emp.tasksCompleted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">Ажилтан нэмэх</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5D4037]/70 mb-4">
            Бүртгэлтэй хэрэглэгчдээс ажилтан болгох хүнийг сонгоно уу.
          </p>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Нэмж болох хэрэглэгч олдсонгүй</p>
          ) : (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg border border-[#2E7D32]/10 hover:bg-[#F5FBEF]">
                  <div>
                    <p className="font-medium text-[#1B5E20]">{u.lastName} {u.firstName}</p>
                    <p className="text-xs text-[#5D4037]/70">{u.email} · {u.phone}</p>
                  </div>
                  <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20]"
                    disabled={promoting === u._id}
                    onClick={() => promoteToWorker(u._id)}>
                    {promoting === u._id ? '...' : 'Ажилтан болгох'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
