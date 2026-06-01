import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, DollarSign, FolderKanban, Users } from 'lucide-react';
import { analyticsData, projects, employees } from '../../data/mockData';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const COLORS = ['#2E7D32', '#66BB6A', '#FBC02D'];

  const projectCompletionData = projects.map(p => ({
    name: p.name.substring(0, 20),
    progress: p.progress,
    profit: p.profit / 1000000
  }));

  const employeePerformance = employees.map(e => ({
    name: e.name,
    rating: e.rating,
    tasks: e.tasksCompleted,
    revenue: e.revenue / 1000000
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-2">Шинжилгээ ба тайлан</h1>
          <p className="text-[#5D4037]/70">Бизнесийн гүйцэтгэлийн нарийвчилсан шинжилгээ</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <p className="text-sm text-[#5D4037]/60 mb-1">Нийт орлого</p>
              <p className="text-2xl font-bold text-[#1B5E20]">{analyticsData.totalRevenue.toLocaleString()}₮</p>
            </CardContent>
          </Card>

          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#FBC02D]/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-[#FBC02D]" />
              </div>
              <p className="text-sm text-[#5D4037]/60 mb-1">Нийт зардал</p>
              <p className="text-2xl font-bold text-[#1B5E20]">{analyticsData.totalExpenses.toLocaleString()}₮</p>
            </CardContent>
          </Card>

          <Card className="border-[#66BB6A]/20 bg-gradient-to-br from-white to-[#66BB6A]/5">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#66BB6A]/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-[#66BB6A]" />
              </div>
              <p className="text-sm text-[#5D4037]/60 mb-1">Нийт ашиг</p>
              <p className="text-2xl font-bold text-[#2E7D32]">{analyticsData.totalProfit.toLocaleString()}₮</p>
            </CardContent>
          </Card>

          <Card className="border-[#2E7D32]/10">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center mb-3">
                <FolderKanban className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <p className="text-sm text-[#5D4037]/60 mb-1">Нийт төсөл</p>
              <p className="text-2xl font-bold text-[#1B5E20]">{analyticsData.totalProjects}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="border-[#2E7D32]/10">
          <CardHeader>
            <CardTitle className="text-[#1B5E20]">Орлого ба зардлын чиг хандлага</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData.revenueGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E7D32" opacity={0.1} />
                <XAxis dataKey="month" stroke="#5D4037" />
                <YAxis stroke="#5D4037" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #2E7D32',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={3} name="Орлого" />
                <Line type="monotone" dataKey="expenses" stroke="#FBC02D" strokeWidth={3} name="Зардал" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20]">Төслийн төлөвийн хуваарилалт</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.projectStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.projectStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20]">Зардлын задаргаа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.expenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1B5E20]">{item.name}</span>
                      <span className="text-sm font-bold text-[#2E7D32]">
                        {item.value.toLocaleString()}₮
                      </span>
                    </div>
                    <div className="h-3 bg-[#F5FBEF] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]"
                        style={{ 
                          width: `${(item.value / analyticsData.totalExpenses * 100).toFixed(0)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Performance */}
        <Card className="border-[#2E7D32]/10">
          <CardHeader>
            <CardTitle className="text-[#1B5E20]">Төслийн гүйцэтгэл ба ашиг</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E7D32" opacity={0.1} />
                <XAxis dataKey="name" stroke="#5D4037" />
                <YAxis stroke="#5D4037" />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#2E7D32" name="Гүйцэтгэл %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#66BB6A" name="Ашиг (сая)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card className="border-[#2E7D32]/10">
          <CardHeader>
            <CardTitle className="text-[#1B5E20]">Ажилтнуудын гүйцэтгэл</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E7D32" opacity={0.1} />
                <XAxis dataKey="name" stroke="#5D4037" />
                <YAxis stroke="#5D4037" />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#FBC02D" name="Үнэлгээ" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tasks" fill="#2E7D32" name="Даалгавар" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
