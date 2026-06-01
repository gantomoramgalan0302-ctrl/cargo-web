import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  ArrowLeft, Calendar, User, DollarSign, Package, Users,
  CheckCircle2, Clock, AlertTriangle, Wrench, Plus, Trash2,
  RotateCcw, ChevronDown, ChevronUp, Edit2, Check, X
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const statusLabel: Record<string, string> = {
  'on-track': 'Хугацаандаа', delayed: 'Хоцорсон', completed: 'Дууссан',
};
const statusColor: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editStatus, setEditStatus] = useState(false);
  const [editDeadline, setEditDeadline] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  // Employee modal
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);

  // Material modal
  const [showAddMat, setShowAddMat] = useState(false);
  const [matForm, setMatForm] = useState({ name: '', quantity: 1, unit: 'ш', cost: 0 });

  // Equipment modal
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [equipList, setEquipList] = useState<any[]>([]);
  const [selEquip, setSelEquip] = useState('');
  const [equipQty, setEquipQty] = useState(1);

  // Active tab
  const [tab, setTab] = useState<'materials' | 'employees' | 'equipment'>('materials');

  const fetchProject = async () => {
    try {
      const res = await apiFetch(`/api/projects/${id}`);
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      setTeam(data.team || []);
    } catch { toast.error('Мэдээлэл татахад алдаа'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const patch = async (body: any) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      toast.success('Хадгалагдлаа');
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSaving(false); }
  };

  const saveStatus = async () => {
    await patch({ status: newStatus });
    setEditStatus(false);
  };

  const saveDeadline = async () => {
    await patch({ deadline: newDeadline });
    setEditDeadline(false);
  };

  // Employee management
  const fetchWorkers = async () => {
    try {
      const res = await apiFetch('/api/admin/employees');
      const data = await res.json();
      setAllWorkers(data.employees || []);
    } catch {}
  };

  const addEmployee = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${id}/employees`, { method: 'POST', body: JSON.stringify({ userId }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setTeam(data.team);
      toast.success('Ажилтан нэмэгдлээ');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const removeEmployee = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${id}/employees/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setTeam(data.team);
      fetchProject();
      toast.success('Ажилтан хасагдлаа');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const changeManager = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${id}/manager`, { method: 'PUT', body: JSON.stringify({ userId: userId || null }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      toast.success('Менежер солигдлоо');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  // Material management
  const addMaterial = async () => {
    if (!matForm.name.trim()) return toast.error('Нэр оруулна уу');
    try {
      const res = await apiFetch(`/api/projects/${id}/materials`, { method: 'POST', body: JSON.stringify(matForm) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      setMatForm({ name: '', quantity: 1, unit: 'ш', cost: 0 });
      setShowAddMat(false);
      toast.success('Материал нэмэгдлээ');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const deleteMaterial = async (mid: string) => {
    try {
      const res = await apiFetch(`/api/projects/${id}/materials/${mid}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      toast.success('Устгалаа');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  // Equipment management
  const fetchEquipment = async () => {
    try {
      const res = await apiFetch('/api/equipment');
      const data = await res.json();
      setEquipList(Array.isArray(data) ? data : (data.equipment || []));
    } catch {}
  };

  const assignEquipment = async () => {
    if (!selEquip) return toast.error('Багаж сонгоно уу');
    try {
      const res = await apiFetch(`/api/projects/${id}/equipment`, {
        method: 'POST',
        body: JSON.stringify({ equipmentId: selEquip, quantity: equipQty }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      setShowAddEquip(false);
      setSelEquip('');
      setEquipQty(1);
      toast.success('Багаж хэрэглэгдлээ');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const returnEquipment = async (eqId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${id}/equipment/${eqId}/return`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setProject(data.project);
      toast.success('Багаж буцаагдлаа');
    } catch { toast.error('Алдаа гарлаа'); }
  };

  if (loading) return <AdminLayout><div className="text-center py-20 text-[#5D4037]">Уншиж байна...</div></AdminLayout>;

  if (!project) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl text-[#1B5E20] mb-4">Төсөл олдсонгүй</h2>
          <Link to="/admin/projects"><Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">Буцах</Button></Link>
        </div>
      </AdminLayout>
    );
  }

  const teamIds = team.map((t: any) => String(t._id));
  const notInTeam = allWorkers.filter((w: any) => !teamIds.includes(String(w.id)));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link to="/admin/projects">
            <Button variant="ghost" className="mb-4 text-[#2E7D32] hover:bg-[#F5FBEF]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Буцах
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1B5E20] mb-1">{project.name}</h1>
              <p className="text-[#5D4037]/70">Захиалагч: {project.client}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Inline status edit */}
              {editStatus ? (
                <div className="flex items-center gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">Хугацаандаа</SelectItem>
                      <SelectItem value="delayed">Хоцорсон</SelectItem>
                      <SelectItem value="completed">Дууссан</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={saveStatus} disabled={saving}><Check className="w-4 h-4 text-green-600" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditStatus(false)}><X className="w-4 h-4 text-red-500" /></Button>
                </div>
              ) : (
                <Badge className={`${statusColor[project.status]} cursor-pointer gap-1`} onClick={() => { setNewStatus(project.status); setEditStatus(true); }}>
                  {statusLabel[project.status]} <Edit2 className="w-3 h-3" />
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card className="border-[#2E7D32]/10">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[#1B5E20] mb-4">Төслийн явц</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#5D4037]/70">Гүйцэтгэл</span>
                  <span className="text-2xl font-bold text-[#2E7D32]">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-4 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#F5FBEF]">
                    <Calendar className="w-4 h-4 text-[#2E7D32] mb-1" />
                    <p className="text-xs text-[#5D4037]/60">Эхлэх</p>
                    <p className="font-semibold text-[#1B5E20]">{project.startDate || '—'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F5FBEF]">
                    <div className="flex items-center justify-between mb-1">
                      <Clock className="w-4 h-4 text-[#2E7D32]" />
                      {!editDeadline && (
                        <button onClick={() => { setNewDeadline(project.deadline || ''); setEditDeadline(true); }}>
                          <Edit2 className="w-3 h-3 text-[#2E7D32]/60 hover:text-[#2E7D32]" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#5D4037]/60">Дуусах</p>
                    {editDeadline ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="h-7 text-xs" />
                        <button onClick={saveDeadline} disabled={saving}><Check className="w-4 h-4 text-green-600" /></button>
                        <button onClick={() => setEditDeadline(false)}><X className="w-4 h-4 text-red-500" /></button>
                      </div>
                    ) : (
                      <p className="font-semibold text-[#1B5E20]">{project.deadline || '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#1B5E20] mb-4">Санхүүгийн мэдээлэл</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#F5FBEF]">
                    <p className="text-xs text-[#5D4037]/60">Төсөв</p>
                    <p className="font-bold text-[#1B5E20]">{(project.budget || 0).toLocaleString()}₮</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-xs text-[#5D4037]/60">Орлого</p>
                    <p className="font-bold text-green-600">{(project.revenue || 0).toLocaleString()}₮</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xs text-[#5D4037]/60">Нийт зардал</p>
                    <p className="font-bold text-amber-600">{(project.totalCost || 0).toLocaleString()}₮</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#2E7D32] to-[#66BB6A]">
                    <p className="text-xs text-white/80">Ашиг</p>
                    <p className="font-bold text-white">{((project.revenue || 0) - (project.totalCost || 0)).toLocaleString()}₮</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2E7D32]" />
                  <div>
                    <p className="text-xs text-[#5D4037]/60">Хариуцсан менежер</p>
                    <p className="font-semibold text-[#1B5E20]">{project.managerName || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#2E7D32]/10">
          {[
            { key: 'materials', label: 'Материал', icon: Package },
            { key: 'employees', label: 'Ажилтнууд', icon: Users },
            { key: 'equipment', label: 'Багаж', icon: Wrench },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-transparent text-[#5D4037]/60 hover:text-[#1B5E20]'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Materials Tab */}
        {tab === 'materials' && (
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#1B5E20]">
                <span className="flex items-center gap-2"><Package className="w-5 h-5" /> Материал</span>
                <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1" onClick={() => setShowAddMat(true)}>
                  <Plus className="w-3.5 h-3.5" /> Нэмэх
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(project.materials || []).length === 0 ? (
                <p className="text-center text-gray-400 py-8">Материал байхгүй байна</p>
              ) : (
                <div className="space-y-3">
                  {project.materials.map((m: any) => (
                    <div key={m._id} className="flex items-center justify-between p-4 rounded-xl bg-[#F5FBEF]">
                      <div>
                        <p className="font-semibold text-[#1B5E20]">{m.name}</p>
                        <p className="text-sm text-[#5D4037]/60">{m.quantity} {m.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-[#2E7D32]">{(m.cost || 0).toLocaleString()}₮</p>
                        <button onClick={() => deleteMaterial(m._id)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-[#2E7D32]/5 to-[#66BB6A]/5 border border-[#2E7D32]/10 flex items-center justify-between">
                    <span className="font-semibold text-[#1B5E20]">Нийт:</span>
                    <span className="text-xl font-bold text-[#2E7D32]">
                      {(project.materials || []).reduce((s: number, m: any) => s + (m.cost || 0), 0).toLocaleString()}₮
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employees Tab */}
        {tab === 'employees' && (
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#1B5E20]">
                <span className="flex items-center gap-2"><Users className="w-5 h-5" /> Ажилтнууд ({team.length})</span>
                <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1"
                  onClick={() => { fetchWorkers(); setShowAddEmp(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Нэмэх
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Ажилтан байхгүй байна</p>
              ) : (
                <div className="space-y-3">
                  {/* Manager selector */}
                  <div className="p-3 rounded-lg bg-[#F5FBEF] border border-[#2E7D32]/10 mb-4">
                    <Label className="text-xs text-[#5D4037]/60 mb-2 block">Хариуцсан менежер</Label>
                    <Select value={project.managerUserId ? String(project.managerUserId) : 'none'} onValueChange={v => changeManager(v === 'none' ? '' : v)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Менежер сонгох..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Менежергүй —</SelectItem>
                        {team.map((t: any) => (
                          <SelectItem key={String(t._id)} value={String(t._id)}>
                            {t.lastName} {t.firstName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {team.map((emp: any) => (
                    <div key={emp._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#F5FBEF]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white font-bold">
                        {emp.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1B5E20]">{emp.lastName} {emp.firstName}</p>
                        <p className="text-xs text-[#5D4037]/60">{emp.email}</p>
                      </div>
                      {String(project.managerUserId) === String(emp._id) && (
                        <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] text-xs">Менежер</Badge>
                      )}
                      <button onClick={() => removeEmployee(String(emp._id))}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Equipment Tab */}
        {tab === 'equipment' && (
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#1B5E20]">
                <span className="flex items-center gap-2"><Wrench className="w-5 h-5" /> Багаж хэрэгсэл</span>
                <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1"
                  onClick={() => { fetchEquipment(); setShowAddEquip(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Хэрэглэх
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(project.equipmentUsed || []).length === 0 ? (
                <p className="text-center text-gray-400 py-8">Багаж хэрэгсэл байхгүй байна</p>
              ) : (
                <div className="space-y-3">
                  {project.equipmentUsed.map((eq: any) => (
                    <div key={eq._id} className={`p-4 rounded-xl border ${eq.isReturned ? 'bg-gray-50 border-gray-200' : 'bg-[#F5FBEF] border-[#2E7D32]/10'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#1B5E20]">{eq.equipmentName}</p>
                            {eq.isReturned ? (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">Буцаасан</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">Хэрэглэгдэж байна</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#5D4037]/70">Тоо: {eq.quantity}</p>
                          <p className="text-xs text-[#5D4037]/50">
                            Менежер: {eq.assignedManagerName || '—'}
                          </p>
                          <p className="text-xs text-[#5D4037]/50">
                            Хэрэглэсэн: {eq.assignedAt ? new Date(eq.assignedAt).toLocaleDateString('mn-MN') : '—'}
                          </p>
                          {eq.isReturned && eq.returnedAt && (
                            <p className="text-xs text-gray-500">
                              Буцаасан: {new Date(eq.returnedAt).toLocaleDateString('mn-MN')}
                            </p>
                          )}
                        </div>
                        {!eq.isReturned && (
                          <Button size="sm" variant="outline" className="gap-1 border-[#2E7D32]/20 text-[#2E7D32] hover:bg-[#F5FBEF] shrink-0"
                            onClick={() => returnEquipment(eq._id)}>
                            <RotateCcw className="w-3.5 h-3.5" /> Буцаах
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Material Dialog */}
      <Dialog open={showAddMat} onOpenChange={setShowAddMat}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-[#1B5E20]">Материал нэмэх</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Нэр *</Label><Input value={matForm.name} onChange={e => setMatForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Тоо</Label><Input type="number" value={matForm.quantity} onChange={e => setMatForm(p => ({ ...p, quantity: Number(e.target.value) }))} /></div>
              <div><Label>Нэгж</Label><Input value={matForm.unit} onChange={e => setMatForm(p => ({ ...p, unit: e.target.value }))} /></div>
            </div>
            <div><Label>Зардал (₮)</Label><Input type="number" value={matForm.cost} onChange={e => setMatForm(p => ({ ...p, cost: Number(e.target.value) }))} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddMat(false)}>Болих</Button>
              <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={addMaterial}>Нэмэх</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmp} onOpenChange={setShowAddEmp}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-[#1B5E20]">Ажилтан нэмэх</DialogTitle></DialogHeader>
          {notInTeam.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Нэмж болох ажилтан байхгүй</p>
          ) : (
            <div className="space-y-2">
              {notInTeam.map((w: any) => (
                <div key={String(w.id)} className="flex items-center justify-between p-3 rounded-lg border border-[#2E7D32]/10 hover:bg-[#F5FBEF]">
                  <div>
                    <p className="font-medium text-[#1B5E20]">{w.lastName} {w.firstName}</p>
                    <p className="text-xs text-[#5D4037]/60">{w.phone}</p>
                  </div>
                  <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20]"
                    onClick={() => { addEmployee(String(w.id)); }}>
                    Нэмэх
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Equipment Dialog */}
      <Dialog open={showAddEquip} onOpenChange={setShowAddEquip}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-[#1B5E20]">Багаж хэрэглэх</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Багаж сонгох *</Label>
              <Select value={selEquip} onValueChange={setSelEquip}>
                <SelectTrigger><SelectValue placeholder="Сонгох..." /></SelectTrigger>
                <SelectContent>
                  {equipList.map((e: any) => (
                    <SelectItem key={e._id} value={e._id} disabled={(e.available ?? e.quantity) <= 0}>
                      {e.name} — нийт: {e.quantity}, үлдсэн: {e.available ?? e.quantity} {e.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Тоо хэмжээ</Label><Input type="number" min={1} value={equipQty} onChange={e => setEquipQty(Number(e.target.value))} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddEquip(false)}>Болих</Button>
              <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={assignEquipment}>Хэрэглэх</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
