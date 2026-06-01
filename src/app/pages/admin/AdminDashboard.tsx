import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router';
import { apiFetch } from '../../utils/api';

const statusLabel: Record<string, string> = {
  'on-track': 'Хугацаандаа', delayed: 'Хоцорсон', completed: 'Дууссан',
};
const statusColor: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-[#5D4037]">Уншиж байна...</div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Нийт орлого',
      value: `${(data?.totalRevenue || 0).toLocaleString()}₮`,
      icon: DollarSign,
      sub: `${data?.projectCount || 0} төсөл`,
      color: 'from-[#2E7D32] to-[#66BB6A]',
    },
    {
      title: 'Нийт зардал',
      value: `${(data?.totalCost || 0).toLocaleString()}₮`,
      icon: TrendingUp,
      sub: `${data?.completedCount || 0} дууссан`,
      color: 'from-[#FBC02D] to-[#F57C00]',
    },
    {
      title: 'Нийт ашиг',
      value: `${(data?.totalProfit || 0).toLocaleString()}₮`,
      icon: Activity,
      sub: data?.totalRevenue ? `${(((data.totalProfit || 0) / data.totalRevenue) * 100).toFixed(1)}% margin` : '—',
      color: 'from-[#66BB6A] to-[#2E7D32]',
    },
    {
      title: 'Нийт ажилтан',
      value: data?.workerCount || 0,
      icon: Users,
      sub: `${data?.delayedCount || 0} хоцорсон төсөл`,
      color: 'from-[#2E7D32] to-[#1B5E20]',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-2">Хяналтын самбар</h1>
          <p className="text-[#5D4037]/70">Таны бизнесийн ерөнхий үзүүлэлт</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index}>
              <Card className="border-[#2E7D32]/10 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1B5E20] mb-1">{stat.value}</div>
                  <div className="text-sm text-[#5D4037]/60">{stat.title}</div>
                  <div className="text-xs text-[#5D4037]/40 mt-0.5">{stat.sub}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20]">Орлого ба зардал (сараар)</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.revenueGrowth?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2E7D32" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#5D4037" />
                    <YAxis stroke="#5D4037" tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #2E7D32', borderRadius: '8px' }}
                      formatter={(value: number) => `${value.toLocaleString()}₮`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2E7D32" name="Орлого" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="#FBC02D" name="Зардал" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-400">Мэдээлэл алга</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#1B5E20]">
                <span>Идэвхитэй төслүүд</span>
                <Link to="/admin/projects" className="text-sm text-[#2E7D32] hover:underline">Бүгдийг үзэх</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.recentProjects || []).length === 0 ? (
                <p className="text-center text-gray-400 py-8">Төсөл байхгүй байна</p>
              ) : (
                (data?.recentProjects || []).map((p: any) => (
                  <Link key={p._id} to={`/admin/projects/${p._id}`}>
                    <div className="p-4 rounded-xl bg-[#F5FBEF] hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-[#1B5E20]">{p.name}</h4>
                          <p className="text-sm text-[#5D4037]/60">{p.client}</p>
                        </div>
                        <Badge className={statusColor[p.status]}>
                          {p.status === 'on-track' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {statusLabel[p.status]}
                        </Badge>
                      </div>
                      <Progress value={p.progress || 0} className="h-2 mb-1" />
                      <p className="text-xs text-[#5D4037]/60">{p.progress || 0}% дууссан</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-[#2E7D32]/10 text-center">
            <CardContent className="p-5">
              <FolderKanban className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1B5E20]">{data?.projectCount || 0}</p>
              <p className="text-xs text-[#5D4037]/60">Нийт төсөл</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/30 text-center">
            <CardContent className="p-5">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{data?.completedCount || 0}</p>
              <p className="text-xs text-[#5D4037]/60">Дууссан</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/30 text-center">
            <CardContent className="p-5">
              <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">{data?.delayedCount || 0}</p>
              <p className="text-xs text-[#5D4037]/60">Хоцорсон</p>
            </CardContent>
          </Card>
          <Card className="border-[#2E7D32]/10 text-center">
            <CardContent className="p-5">
              <Users className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1B5E20]">{data?.workerCount || 0}</p>
              <p className="text-xs text-[#5D4037]/60">Ажилтан</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
