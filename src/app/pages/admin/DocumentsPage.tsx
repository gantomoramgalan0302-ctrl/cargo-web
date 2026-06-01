import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Upload, FileText, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, apiUpload, API_BASE } from '../../utils/api';

const typeLabel: Record<string, string> = {
  contract: 'Гэрээ', design: 'Зураг', tender: 'Тендер', other: 'Бусад',
};
const typeColor: Record<string, string> = {
  contract: 'bg-blue-100 text-blue-700',
  design: 'bg-purple-100 text-purple-700',
  tender: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('other');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/documents');
      const data = await res.json();
      setDocs(data.documents || []);
    } catch { toast.error('Баримт бичгүүд татахад алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {}
  };

  useEffect(() => { fetchDocs(); fetchProjects(); }, []);

  const handleUpload = async () => {
    if (!file || !projectId) return toast.error('Файл болон төсөл сонгоно уу');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', projectId);
      fd.append('name', docName || file.name);
      fd.append('type', docType);
      const res = await apiUpload('/api/admin/documents/upload', fd);
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Баримт нэмэгдлээ');
      setShowUpload(false);
      setFile(null); setDocName(''); setProjectId(''); setDocType('other');
      fetchDocs();
    } catch { toast.error('Upload алдаа гарлаа'); }
    finally { setUploading(false); }
  };

  const filtered = docs.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B5E20]">Баримт бичгийн сан</h1>
          <Button onClick={() => setShowUpload(true)} className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
            <Upload className="w-4 h-4" /> Файл байрлуулах
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Хайх..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5D4037]">Уншиж байна...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Баримт бичиг олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc: any, i: number) => (
              <Card key={i} className="border-[#2E7D32]/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F5FBEF] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#2E7D32]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1B5E20] truncate">{doc.name}</p>
                      <p className="text-xs text-[#5D4037]/60 truncate">{doc.projectName}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={typeColor[doc.type] || typeColor.other}>
                          {typeLabel[doc.type] || 'Бусад'}
                        </Badge>
                        {doc.size && <span className="text-xs text-gray-400">{doc.size}</span>}
                      </div>
                    </div>
                  </div>
                  {doc.url && (
                    <a href={`${API_BASE}${doc.url}`} target="_blank" rel="noreferrer"
                      className="mt-3 flex items-center gap-1 text-xs text-[#2E7D32] hover:underline">
                      <ExternalLink className="w-3 h-3" /> Нээх
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">Файл байрлуулах</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Төсөл сонгох *</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Төсөл сонгоно уу..." /></SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Баримтын нэр</Label>
              <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Файлын нэр (заавал биш)" />
            </div>
            <div className="space-y-1">
              <Label>Төрөл</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Гэрээ</SelectItem>
                  <SelectItem value="design">Зураг</SelectItem>
                  <SelectItem value="tender">Тендер</SelectItem>
                  <SelectItem value="other">Бусад</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>PDF файл *</Label>
              <div
                className="border-2 border-dashed border-[#2E7D32]/30 rounded-lg p-6 text-center cursor-pointer hover:bg-[#F5FBEF] transition-colors"
                onClick={() => fileRef.current?.click()}>
                {file ? (
                  <p className="text-sm text-[#1B5E20] font-medium">{file.name}</p>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#2E7D32]/50 mx-auto mb-2" />
                    <p className="text-sm text-[#5D4037]/60">Энд дарж файл сонгоно уу</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>Болих</Button>
              <Button className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Байршуулж байна...' : 'Байршуулах'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
