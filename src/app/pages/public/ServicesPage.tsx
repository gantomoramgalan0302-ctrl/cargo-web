import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Link } from 'react-router';
import { TreePine, Sprout, Flower2, Leaf, Scissors, Droplets, CheckCircle2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ServicesPageProps {
  addToCart?: (product: any, quantity?: number) => void;
}

export default function ServicesPage({ addToCart }: ServicesPageProps) {
  const services = [
    {
      id: 'service-landscape',
      icon: TreePine,
      title: 'Ландшафт дизайн',
      description: 'Мэргэжлийн зураг төсөл, 3D загварчлал, талбайн шинжилгээ',
      features: ['3D визуализаци', 'Талбайн шинжилгээ', 'Ургамлын сонголт', 'Зардлын тооцоо'],
      priceLabel: 'ажилгаа дүрслэлээс-100.000-аас',
      price: 500000,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
      category: 'Ландшафт',
    },
    {
      id: 'service-garden',
      icon: Sprout,
      title: 'Цэцэрлэгжүүлэлт',
      description: 'Ургамал суулгалт, хөрс бэлтгэлт, системийн суурилуулалт',
      features: ['Мод тарилт', 'Цэцэг суулгалт', 'Хөрс бэлтгэлт', 'Усалгаа систем'],
      priceLabel: 'м2=25000₮-аас',
      price: 300000,
      image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600',
      category: 'Цэцэрлэг',
    },
    {
      id: 'service-lawn',
      icon: Flower2,
      title: 'Зүлгэн засварлалт',
      description: 'Зүлгэн суулгалт, тэжээллэг хөрс, усалгааны систем',
      features: ['Өвс тарилт', 'Тэжээлжүүлэлт', 'Усалгаа', 'Тогтмол арчлалт'],
      priceLabel: 'm2=20000₮-аас',
      price: 200000,
      image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600',
      category: 'Зүлэг',
    },
    {
      id: 'service-park',
      icon: Leaf,
      title: 'Ногоон талбай',
      description: 'Паркийн талбай, алхах зам, амралтын газар бүтээлт',
      features: ['Парк дизайн', 'Зам тавилт', 'Гэрэлтүүлэг', 'Сандал суудал'],
      priceLabel: '50000₮-аас',
      price: 1000000,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
      category: 'Парк',
    },
    {
      id: 'service-maintenance',
      icon: Scissors,
      title: 'Арчлалт үйлчилгээ',
      description: 'Тогтмол арчилгаа, тайралт, цэвэрлэгээ үйлчилгээ',
      features: ['Тайралт', 'Бордоо', 'Хортон устгал', 'Цэвэрлэгээ'],
      priceLabel: '20,000₮/сараас',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600',
      category: 'Арчлалт',
    },
    {
      id: 'service-irrigation',
      icon: Droplets,
      title: 'Усалгааны систем',
      description: 'Автомат усалгааны систем суурилуулалт',
      features: ['Дуслын усалгаа', 'Автомат систем', 'Цагийн удирдлага', 'Засвар үйлчилгээ'],
      priceLabel: '40,000₮-аас',
      price: 400000,
      image: 'https://i0.wp.com/www.jjkokeshandson.com/wp-content/uploads/2024/07/residential-lawn-irrigation-system-1.jpg?w=1000&ssl=1',
      category: 'Усалгаа',
    },
  ];

  const handleAddToCart = (service: typeof services[0]) => {
    if (addToCart) {
      addToCart({
        id: service.id,
        nameMn: service.title,
        name: service.title,
        price: service.price,
        image: service.image,
        category: service.category,
        type: 'service',
      });
      toast.success(`"${service.title}" сагсанд нэмэгдлээ`);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Манай үйлчилгээ</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Мэргэжлийн багийн туслалцаатайгаар таны мөрөөдлийн орчныг бүтээцгээе
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-[#2E7D32]/10 h-full flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 w-14 h-14 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                    <service.icon className="w-7 h-7 text-[#2E7D32]" />
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-semibold text-[#1B5E20] mb-2">{service.title}</h3>
                  <p className="text-[#5D4037]/70 mb-4">{service.description}</p>

                  <div className="space-y-2 mb-4 flex-1">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#5D4037]/80">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#2E7D32]/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-[#2E7D32]">{service.priceLabel}</span>
                    </div>
                    <Button
                      className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2 rounded-xl"
                      onClick={() => handleAddToCart(service)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Сагсанд нэмэх
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/contact">
              <Button size="lg" className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg text-lg px-8">
                Захиалга өгөх
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
