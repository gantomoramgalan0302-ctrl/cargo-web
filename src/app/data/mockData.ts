// Mock data for NARLAG ORCHIN platform

export interface Product {
  id: string;
  name: string;
  nameMn: string;
  category: string;
  price: number;
  image: string;
  description: string;
  descriptionMn: string;
  stock: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  manager: string;
  progress: number;
  status: 'on-track' | 'delayed' | 'completed';
  startDate: string;
  deadline: string;
  actualEndDate?: string;
  budget: number;
  revenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  materials: Material[];
  employees: string[];
  photos: string[];
  documents: Document[];
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  salary: number;
  rating: number;
  tasksCompleted: number;
  status: 'active' | 'offline';
  lateCount: number;
  revenue: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent';
  location?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'design' | 'tender' | 'other';
  projectId?: string;
  uploadDate: string;
  size: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignedTo: string[];
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  photos?: string[];
}

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Fertilizer',
    nameMn: 'Органик бордоо',
    category: 'Бордоо',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    description: 'Premium organic fertilizer for all plants',
    descriptionMn: 'Бүх ургамалд тохиромжтой дээд зэргийн органик бордоо',
    stock: 150
  },
  {
    id: '2',
    name: 'Rose Plant',
    nameMn: 'Сарнай',
    category: 'Ургамал',
    price: 25000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy-ooscCkvXKW7tP0wqfDsY99m1yDQB3HEcQ&s',
    description: 'Beautiful red rose plant',
    descriptionMn: 'Үзэсгэлэнтэй улаан сарнай',
    stock: 80
  },
  {
    id: '3',
    name: 'Garden Soil',
    nameMn: 'Цэцэрлэгийн хөрс',
    category: 'Хөрс',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    description: 'Premium garden soil mix',
    descriptionMn: 'Дээд зэргийн цэцэрлэгийн хөрс',
    stock: 200
  },
  {
    id: '4',
    name: 'Lavender Plant',
    nameMn: 'Лаванда',
    category: 'Ургамал',
    price: 18000,
    image: 'https://5179935.ru/image/cache/catalog/Mnogoletki/lavanda%20Elegance_-1000x1000.jpg',
    description: 'Fragrant lavender plant',
    descriptionMn: 'Анхилуун үнэртэй лаванда ургамал',
    stock: 60
  },
  {
    id: '5',
    name: 'Garden Tools Set',
    nameMn: 'Цэцэрлэгийн багаж',
    category: 'Багаж',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400',
    description: 'Complete garden tools set',
    descriptionMn: 'Цэцэрлэгийн багажны иж бүрдэл',
    stock: 40
  },
  {
    id: '6',
    name: 'Grass Seeds',
    nameMn: 'Өвсний үр',
    category: 'Үр',
    price: 35000,
    image: 'https://blog.168.am/wp-content/uploads/2020/07/how-grass-works.jpg',
    description: 'Premium grass seeds for lawns',
    descriptionMn: 'Зүлгэнд зориулсан өвсний үр',
    stock: 120
  }
];

// Projects
export const projects: Project[] = [
  {
    id: 'proj-001',
    name: 'Төв цэцэрлэгт хүрээлэн',
    client: 'ТББ Хороо 5',
    manager: 'Болд',
    progress: 75,
    status: 'on-track',
    startDate: '2026-01-15',
    deadline: '2026-03-15',
    budget: 15000000,
    revenue: 18000000,
    totalCost: 12500000,
    profit: 5500000,
    profitMargin: 30.56,
    materials: [
      { id: 'm1', name: 'Органик бордоо', quantity: 500, unit: 'кг', cost: 2500000 },
      { id: 'm2', name: 'Ургамал', quantity: 200, unit: 'ширхэг', cost: 3000000 },
      { id: 'm3', name: 'Хөрс', quantity: 50, 'unit': 'м³', cost: 1500000 }
    ],
    employees: ['emp-001', 'emp-002', 'emp-003'],
    photos: [
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600'
    ],
    documents: []
  },
  {
    id: 'proj-002',
    name: 'Оффисын ногоон орчин',
    client: 'Монгол Корпораци ХХК',
    manager: 'Сарангэрэл',
    progress: 45,
    status: 'delayed',
    startDate: '2026-02-01',
    deadline: '2026-02-28',
    budget: 8000000,
    revenue: 9500000,
    totalCost: 7200000,
    profit: 2300000,
    profitMargin: 24.21,
    materials: [
      { id: 'm4', name: 'Дотор ургамал', quantity: 50, unit: 'ширхэг', cost: 1500000 },
      { id: 'm5', name: 'Ваар', quantity: 50, unit: 'ширхэг', cost: 800000 }
    ],
    employees: ['emp-002', 'emp-004'],
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'
    ],
    documents: []
  },
  {
    id: 'proj-003',
    name: 'Зүлгэн засварлалт',
    client: 'Амарын гэр бүл',
    manager: 'Болд',
    progress: 100,
    status: 'completed',
    startDate: '2026-01-10',
    deadline: '2026-01-25',
    actualEndDate: '2026-01-24',
    budget: 3500000,
    revenue: 4200000,
    totalCost: 2800000,
    profit: 1400000,
    profitMargin: 33.33,
    materials: [
      { id: 'm6', name: 'Өвсний үр', quantity: 10, unit: 'кг', cost: 350000 },
      { id: 'm7', name: 'Бордоо', quantity: 50, unit: 'кг', cost: 250000 }
    ],
    employees: ['emp-001', 'emp-003'],
    photos: [
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600'
    ],
    documents: []
  }
];

// Employees
export const employees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Болд',
    position: 'Төсөл менежер',
    phone: '99112233',
    email: 'bold@narlag.mn',
    salary: 2500000,
    rating: 4.8,
    tasksCompleted: 24,
    status: 'active',
    lateCount: 2,
    revenue: 12000000
  },
  {
    id: 'emp-002',
    name: 'Сарангэрэл',
    position: 'Төсөл менежер',
    phone: '99223344',
    email: 'saraa@narlag.mn',
    salary: 2500000,
    rating: 4.9,
    tasksCompleted: 28,
    status: 'active',
    lateCount: 0,
    revenue: 15000000
  },
  {
    id: 'emp-003',
    name: 'Дорж',
    position: 'Ажилчин',
    phone: '99334455',
    email: 'dorj@narlag.mn',
    salary: 1500000,
    rating: 4.5,
    tasksCompleted: 18,
    status: 'offline',
    lateCount: 5,
    revenue: 8000000
  },
  {
    id: 'emp-004',
    name: 'Оюунаа',
    position: 'Ажилчин',
    phone: '99445566',
    email: 'oyunaa@narlag.mn',
    salary: 1500000,
    rating: 4.7,
    tasksCompleted: 22,
    status: 'active',
    lateCount: 1,
    revenue: 10000000
  }
];

// Attendance
export const attendance: Attendance[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    employeeName: 'Болд',
    date: '2026-02-12',
    checkIn: '08:00',
    checkOut: '17:30',
    status: 'present',
    location: 'Төв цэцэрлэг'
  },
  {
    id: 'att-002',
    employeeId: 'emp-002',
    employeeName: 'Сарангэрэл',
    date: '2026-02-12',
    checkIn: '08:05',
    checkOut: '17:45',
    status: 'present',
    location: 'Монгол Корпораци'
  },
  {
    id: 'att-003',
    employeeId: 'emp-003',
    employeeName: 'Дорж',
    date: '2026-02-12',
    checkIn: '08:25',
    status: 'late',
    location: 'Төв цэцэрлэг'
  },
  {
    id: 'att-004',
    employeeId: 'emp-004',
    employeeName: 'Оюунаа',
    date: '2026-02-12',
    checkIn: '08:00',
    status: 'present',
    location: 'Монгол Корпораци'
  }
];

// Tasks
export const tasks: Task[] = [
  {
    id: 'task-001',
    title: 'Хөрс бэлтгэх',
    projectId: 'proj-001',
    assignedTo: ['emp-001', 'emp-003'],
    status: 'completed',
    dueDate: '2026-02-10'
  },
  {
    id: 'task-002',
    title: 'Ургамал суулгах',
    projectId: 'proj-001',
    assignedTo: ['emp-001', 'emp-003'],
    status: 'in-progress',
    dueDate: '2026-02-15'
  },
  {
    id: 'task-003',
    title: 'Дотор ургамал суурилуулах',
    projectId: 'proj-002',
    assignedTo: ['emp-002', 'emp-004'],
    status: 'in-progress',
    dueDate: '2026-02-20'
  }
];

// Documents
export const documents: Document[] = [
  {
    id: 'doc-001',
    name: 'Гэрээ - Төв цэцэрлэг.pdf',
    type: 'contract',
    projectId: 'proj-001',
    uploadDate: '2026-01-15',
    size: '2.4 MB',
    url: '#'
  },
  {
    id: 'doc-002',
    name: 'Зураг төсөл - Оффис.pdf',
    type: 'design',
    projectId: 'proj-002',
    uploadDate: '2026-02-01',
    size: '5.8 MB',
    url: '#'
  },
  {
    id: 'doc-003',
    name: 'Тендерийн баримт бичиг.pdf',
    type: 'tender',
    uploadDate: '2026-01-20',
    size: '1.2 MB',
    url: '#'
  }
];

// Analytics data
export const analyticsData = {
  totalRevenue: 31700000,
  totalExpenses: 22500000,
  totalProfit: 9200000,
  totalProjects: 15,
  totalEmployees: 12,
  
  revenueGrowth: [
    { month: 'Сар 1', revenue: 8500000, expenses: 6200000 },
    { month: 'Сар 2', revenue: 12000000, expenses: 8500000 },
    { month: 'Сар 3', revenue: 11200000, expenses: 7800000 }
  ],
  
  expenseBreakdown: [
    { name: 'Цалин', value: 9000000 },
    { name: 'Материал', value: 8500000 },
    { name: 'Тээвэр', value: 3000000 },
    { name: 'Бусад', value: 2000000 }
  ],
  
  projectStatus: [
    { status: 'Хугацаандаа', count: 8 },
    { status: 'Хоцорсон', count: 3 },
    { status: 'Дууссан', count: 4 }
  ]
};
