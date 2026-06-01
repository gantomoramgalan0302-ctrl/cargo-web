import { useState } from 'react';
import { Link } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { Search, ShoppingCart } from 'lucide-react';
import { products } from '../../data/mockData';
import { toast } from 'sonner';

interface StorePageProps {
  addToCart: (product: any, quantity: number) => void;
}

export default function StorePage({ addToCart }: StorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Бүгд');

  const categories = ['Бүгд', 'Бордоо', 'Ургамал', 'Хөрс', 'Багаж', 'Үр'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nameMn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Бүгд' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success(`${product.nameMn} сагсанд нэмэгдлээ`);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Онлайн дэлгүүр</h1>
          <p className="text-xl text-white/90">Чанартай бүтээгдэхүүн таны гэрт</p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white border-b border-[#2E7D32]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D4037]/40" />
              <Input
                placeholder="Бүтээгдэхүүн хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-[#2E7D32]/20"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`rounded-xl ${
                    selectedCategory === category
                      ? 'bg-[#2E7D32] hover:bg-[#1B5E20]'
                      : 'border-[#2E7D32]/20 text-[#2E7D32] hover:bg-[#F5FBEF]'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-[#2E7D32]/10 h-full flex flex-col">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.nameMn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.stock < 50 && (
                        <Badge className="absolute top-3 right-3 bg-[#FBC02D] text-[#1B5E20]">
                          Цөөн үлдсэн
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-4 flex-1 flex flex-col">
                    <Badge variant="outline" className="w-fit mb-2 border-[#2E7D32]/30 text-[#2E7D32]">
                      {product.category}
                    </Badge>
                    
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-[#1B5E20] mb-1 group-hover:text-[#2E7D32] transition-colors">
                        {product.nameMn}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-[#5D4037]/70 mb-3 flex-1">
                      {product.descriptionMn}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#2E7D32]/10">
                      <div>
                        <div className="text-2xl font-bold text-[#2E7D32]">
                          {product.price.toLocaleString()}₮
                        </div>
                        <div className="text-xs text-[#5D4037]/60">
                          Үлдэгдэл: {product.stock}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20]"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-[#5D4037]/60">Бүтээгдэхүүн олдсонгүй</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
