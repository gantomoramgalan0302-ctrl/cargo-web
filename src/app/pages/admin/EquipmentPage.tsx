import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Wrench, Trash2, Search, ImagePlus, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, API_BASE } from '../../utils/api';

const conditionLabel: Record<string, string> = {
  good: 'Сайн', fair: 'Дунд', poor: 'Муу',
};
const conditionColor: Record<string, string> = {
  good: 'bg-green-100 text-green-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-red-100 text-red-600',
};

const emptyForm = { name: '', description: '', quantity: 1, unit: 'ширхэг', condition: 'good' };

function getToken() {
  return localStorage.getItem('token') || '';
}

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New equipment modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Image detail modal
  const [imgItem, setImgItem] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null); // index of zoomed image
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/equipment');
      const data = await res.json();
      setItems(data || []);
    } catch { toast.error('Багаж татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.name) return toast.error('Нэрийг оруулна уу');
    setSaving(true);
    try {
      const res = await apiFetch('/api/equipment', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Багаж нэмэгдлээ');
      setShowModal(false);
      setForm(emptyForm);
      fetchItems();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/equipment/${id}`, { method: 'DELETE' });
      toast.success('Устгагдлаа');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setDeleting(null); }
  };

  // Upload image to an equipment item
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imgItem) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/api/equipment/${imgItem._id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Зураг нэмэгдлээ');
      // Update both imgItem and items list
      const updated = { ...imgItem, images: data.images };
      setImgItem(updated);
      setItems(prev => prev.map(i => i._id === imgItem._id ? { ...i, images: data.images } : i));
    } catch { toast.error('Upload алдаа гарлаа'); }
    finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (idx: number) => {
    if (!imgItem) return;
    try {
      const res = await apiFetch(`/api/equipment/${imgItem._id}/images/${idx}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Зураг устгагдлаа');
      const updated = { ...imgItem, images: data.images };
      setImgItem(updated);
      setItems(prev => prev.map(i => i._id === imgItem._id ? { ...i, images: data.images } : i));
      if (lightbox !== null) {
        if (data.images.length === 0) setLightbox(null);
        else setLightbox(Math.min(lightbox, data.images.length - 1));
      }
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const filtered = items.filter(i =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  const images: string[] = imgItem?.images || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B5E20]">Багаж хэрэгсэл</h1>
          <Button onClick={() => setShowModal(true)} className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
            <Plus className="w-4 h-4" /> Шинэ багаж нэмэх
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[#1B5E20]">{items.length}</p>
              <p className="text-sm text-[#5D4037]/70">Нийт төрөл</p>
            </CardContent>
          </Card>
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[#1B5E20]">{items.reduce((a, i) => a + (i.quantity || 0), 0)}</p>
              <p className="text-sm text-[#5D4037]/70">Нийт тоо</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{items.reduce((a, i) => a + (i.inUse || 0), 0)}</p>
              <p className="text-sm text-[#5D4037]/70">Ашиглагдаж байна</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{items.reduce((a, i) => a + (i.available || 0), 0)}</p>
              <p className="text-sm text-[#5D4037]/70">Боломжит тоо</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Хайх..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Багаж олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item: any) => {
              const thumb = item.images?.[0];
              return (
                <Card key={item._id} className="border-[#2E7D32]/10 hover:shadow-md transition-shadow overflow-hidden">
                  {/* Thumbnail strip */}
                  {thumb ? (
                    <div
                      className="w-full h-36 bg-gray-100 cursor-pointer overflow-hidden relative group"
                      onClick={() => setImgItem(item)}
                    >
                      <img
                        src={`${API_BASE}${thumb}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                          +{item.images.length - 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setImgItem(item)}
                      className="w-full h-24 bg-[#F5FBEF] flex flex-col items-center justify-center gap-1 hover:bg-[#e8f5e0] transition-colors border-b border-[#2E7D32]/10"
                    >
                      <Camera className="w-6 h-6 text-[#2E7D32]/40" />
                      <span className="text-xs text-[#5D4037]/50">Зураг нэмэх</span>
                    </button>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#F5FBEF] flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-[#2E7D32]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1B5E20]">{item.name}</p>
                          <Badge className={conditionColor[item.condition]}>{conditionLabel[item.condition]}</Badge>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.description && (
                      <p className="text-sm text-[#5D4037]/70 mb-3">{item.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-1 text-center mt-2">
                      <div className="p-1.5 rounded-lg bg-[#F5FBEF]">
                        <p className="text-sm font-bold text-[#1B5E20]">{item.quantity}</p>
                        <p className="text-xs text-[#5D4037]/50">Нийт</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-50">
                        <p className="text-sm font-bold text-blue-600">{item.inUse || 0}</p>
                        <p className="text-xs text-[#5D4037]/50">Ашиглаж буй</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-green-50">
                        <p className="text-sm font-bold text-green-600">{item.available ?? item.quantity}</p>
                        <p className="text-xs text-[#5D4037]/50">Үлдсэн</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── New equipment modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">Шинэ багаж нэмэх</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Багажны нэр *</Label>
              <Input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Жишээ: Хусуур, Тариурч..." />
            </div>
            <div className="space-y-1">
              <Label>Онцлог / Тайлбар</Label>
              <Input value={form.description} onChange={e => f('description', e.target.value)} placeholder="Загвар, хэмжээ..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Тоо ширхэг</Label>
                <Input type="number" min={1} value={form.quantity}
                  onChange={e => f('quantity', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Хэмжих нэгж</Label>
                <Input value={form.unit} onChange={e => f('unit', e.target.value)} placeholder="ширхэг, иж..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Төлөв</Label>
              <Select value={form.condition} onValueChange={v => f('condition', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Сайн</SelectItem>
                  <SelectItem value="fair">Дунд</SelectItem>
                  <SelectItem value="poor">Муу</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Болих</Button>
              <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={handleCreate} disabled={saving}>
                {saving ? 'Нэмж байна...' : 'Нэмэх'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Image gallery modal ── */}
      <Dialog open={!!imgItem && lightbox === null} onOpenChange={() => setImgItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20] flex items-center gap-2">
              <Wrench className="w-4 h-4" /> {imgItem?.name} — Зурагнууд
            </DialogTitle>
          </DialogHeader>
          {imgItem && (
            <div className="space-y-4">
              {/* Upload button */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
                <Button
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploading ? 'Байршуулж байна...' : 'Зураг нэмэх'}
                </Button>
              </div>

              {/* Gallery grid */}
              {images.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Зураг байхгүй байна</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img
                        src={`${API_BASE}${url}`}
                        alt={`${imgItem.name} ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setLightbox(idx)}
                      />
                      <button
                        onClick={() => handleDeleteImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Lightbox ── */}
      {imgItem && lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          <img
            src={`${API_BASE}${images[lightbox]}`}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Close + delete */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              className="w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={e => { e.stopPropagation(); handleDeleteImage(lightbox); }}
              title="Устгах"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
