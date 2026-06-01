import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';
import { Link } from 'react-router';

const statusLabel: Record<string, string> = {
  'on-track': 'Хугацаандаа', delayed: 'Хоцорсон', completed: 'Дууссан',
};
const statusColor: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const emptyForm = {
  name: '', client: '', status: 'on-track', progress: 0,
  managerUserId: '', managerName: '', startDate: '', deadline: '',
  budget: 0, revenue: 0, totalCost: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filter !== 'all') params.set('status', filter);
      const res = await apiFetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch { toast.error('Төслүүд татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  const fetchWorkers = async () => {
    try {
      const res = await apiFetch('/api/admin/employees');
      const data = await res.json();
      setWorkers(data.employees || []);
    } catch {}
  };

  useEffect(() => { fetchProjects(); }, [search, filter]);

  const openModal = () => {
    fetchWorkers();
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.name || !form.client) return toast.error('Нэр болон захиалагчийг оруулна уу');
    setSaving(true);
    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Төсөл үүслээ');
      setShowModal(false);
      setForm(emptyForm);
      fetchProjects();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSaving(false); }
  };

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B5E20]">Төслүүд</h1>
          <Button onClick={openModal} className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
            <Plus className="w-4 h-4" /> Шинэ төсөл
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Хайх..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'on-track', 'delayed', 'completed'].map(s => (
              <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'}
                onClick={() => setFilter(s)}
                className={filter === s ? 'bg-[#2E7D32] text-white' : ''}>
                {s === 'all' ? 'Бүгд' : statusLabel[s]}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Төсөл олдсонгүй</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((p: any) => (
              <Link key={p._id} to={`/admin/projects/${p._id}`}>
                <Card className="border-[#2E7D32]/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-[#1B5E20]">{p.name}</h3>
                          <Badge className={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                        </div>
                        <p className="text-sm text-[#5D4037]/70 mb-3">
                          Захиалагч: {p.client} · Менежер: {p.managerName || '—'}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div className="bg-[#2E7D32] h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">{p.progress}% гүйцэтгэл</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[#2E7D32]">{(p.revenue || 0).toLocaleString()}₮</p>
                        <p className="text-xs text-gray-500">Орлого</p>
                        <p className="text-sm font-medium text-[#5D4037] mt-1">{(p.budget || 0).toLocaleString()}₮</p>
                        <p className="text-xs text-gray-500">Төсөв</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">Шинэ төсөл үүсгэх</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Төслийн нэр *</Label>
              <Input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Нэр" />
            </div>
            <div className="space-y-1">
              <Label>Захиалагч *</Label>
              <Input value={form.client} onChange={e => f('client', e.target.value)} placeholder="Захиалагчийн нэр" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Төлөв</Label>
                <Select value={form.status} onValueChange={v => f('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-track">Хугацаандаа</SelectItem>
                    <SelectItem value="delayed">Хоцорсон</SelectItem>
                    <SelectItem value="completed">Дууссан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Гүйцэтгэл (%)</Label>
                <Input type="number" min={0} max={100} value={form.progress}
                  onChange={e => f('progress', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Менежер</Label>
                <Select
                  value={form.managerUserId || 'none'}
                  onValueChange={v => {
                    if (v === 'none') { f('managerUserId', ''); f('managerName', ''); return; }
                    const w = workers.find((w: any) => String(w.id) === v);
                    f('managerUserId', v);
                    f('managerName', w ? `${w.lastName} ${w.firstName}` : '');
                  }}>
                  <SelectTrigger><SelectValue placeholder="Сонгох..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Менежергүй —</SelectItem>
                    {workers.map((w: any) => (
                      <SelectItem key={String(w.id)} value={String(w.id)}>
                        {w.lastName} {w.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Эхлэх огноо</Label>
                <Input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Дуусах огноо</Label>
                <Input type="date" value={form.deadline} onChange={e => f('deadline', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Төсөв (₮)</Label>
                <Input type="number" value={form.budget} onChange={e => f('budget', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Орлого (₮)</Label>
                <Input type="number" value={form.revenue} onChange={e => f('revenue', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Нийт зардал (₮)</Label>
                <Input type="number" value={form.totalCost} onChange={e => f('totalCost', Number(e.target.value))} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Болих</Button>
              <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={handleCreate} disabled={saving}>
                {saving ? 'Хадгалж байна...' : 'Үүсгэх'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
