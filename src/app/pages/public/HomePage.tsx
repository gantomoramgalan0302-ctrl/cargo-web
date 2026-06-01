import { Link } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'motion/react';
import { 
  Leaf, 
  TreePine, 
  Sprout, 
  Flower2, 
  ArrowRight,
  Users,
  Award,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      icon: TreePine,
      title: 'Ландшафт дизайн',
      description: 'Мэргэжлийн зураг төсөл боловсруулалт'
    },
    {
      icon: Sprout,
      title: 'Цэцэрлэгжүүлэлт',
      description: 'Ургамал тарих, арчлалт үйлчилгээ'
    },
    {
      icon: Flower2,
      title: 'Зүлгэн засварлалт',
      description: 'Зүлгэн суулгах, арчлах ажил'
    },
    {
      icon: Leaf,
      title: 'Ногоон талбай',
      description: 'Паркийн талбай засаж байгуулалт'
    }
  ];

  const stats = [
    { value: '500+', label: 'Төсөл', icon: Award },
    { value: '1000+', label: 'Үйлчлүүлэгч', icon: Users },
    { value: '15+', label: 'Жилийн туршлага', icon: CheckCircle2 }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D32]/5 via-[#FBC02D]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] mb-6">
                🌿 Ногоон ирээдүйг хамтдаа бүтээцгээе
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1B5E20] mb-6 leading-tight">
                Байгалийн гоо үзэсгэлэнг таны амьдралд
              </h1>
              
              <p className="text-xl text-[#5D4037]/80 mb-8 leading-relaxed">
                Монголын тэргүүлэгч ландшафт дизайн болон цэцэрлэгжүүлэлтийн компани. 
                Мэргэжлийн багтай хамтран мөрөөдлийн орчноо бүтээцгээе.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/services">
                  <Button size="lg" className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg text-lg px-8">
                    Үйлчилгээ үзэх
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/store">
                  <Button size="lg" variant="outline" className="rounded-xl border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF] text-lg px-8">
                    Дэлгүүр очих
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-[#2E7D32]/20 to-[#FBC02D]/20 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800"
                alt="Garden landscape"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center border-[#2E7D32]/10 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-[#2E7D32] mb-2">{stat.value}</div>
                    <div className="text-[#5D4037]/70">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1B5E20] mb-4">Манай үйлчилгээ</h2>
            <p className="text-xl text-[#5D4037]/70 max-w-2xl mx-auto">
              Бид танд дараах чиглэлээр өндөр чанартай үйлчилгээ үзүүлдэг
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-[#2E7D32]/10 h-full cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1B5E20] mb-2">{service.title}</h3>
                    <p className="text-[#5D4037]/70">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" variant="outline" className="rounded-xl border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF]">
                Бүх үйлчилгээ үзэх
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Төслөө эхлүүлэхэд бэлэн үү?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Манай мэргэжилтнүүд танд тусална. Үнэгүй зөвлөгөө аваарай.
            </p>
            <Link to="/contact">
              <Button size="lg" className="rounded-xl bg-[#FBC02D] text-[#1B5E20] hover:bg-[#FBC02D]/90 shadow-xl text-lg px-8">
                Холбоо барих
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
