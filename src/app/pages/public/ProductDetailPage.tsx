import { useState } from 'react';
import { useParams, Link } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { motion } from 'motion/react';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package } from 'lucide-react';
import { products } from '../../data/mockData';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  addToCart: (product: any, quantity: number) => void;
}

export default function ProductDetailPage({ addToCart }: ProductDetailPageProps) {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl text-[#1B5E20] mb-4">Бүтээгдэхүүн олдсонгүй</h2>
          <Link to="/store">
            <Button className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20]">Буцах</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.nameMn} сагсанд нэмэгдлээ`);
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/store">
          <Button variant="ghost" className="mb-6 text-[#2E7D32] hover:bg-[#F5FBEF]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
              <img
                src={product.image}
                alt={product.nameMn}
                className="w-full aspect-square object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="mb-4 bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20">
              {product.category}
            </Badge>

            <h1 className="text-4xl font-bold text-[#1B5E20] mb-4">{product.nameMn}</h1>
            <p className="text-xl text-[#5D4037]/70 mb-6">{product.descriptionMn}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <div className="text-4xl font-bold text-[#2E7D32]">
                {product.price.toLocaleString()}₮
              </div>
            </div>

            <Card className="mb-6 border-[#2E7D32]/10">
              <CardContent className="p-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#2E7D32]" />
                <span className="text-[#5D4037]/80">
                  Үлдэгдэл: <strong className="text-[#2E7D32]">{product.stock}</strong> ширхэг
                </span>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-[#1B5E20] font-medium">Тоо ширхэг:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg border-[#2E7D32]/20"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center rounded-lg border-[#2E7D32]/20"
                    min="1"
                    max={product.stock}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg border-[#2E7D32]/20"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Сагсанд нэмэх
                </Button>
                <Link to="/cart" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full rounded-xl border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF]">
                    Сагс үзэх
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-[#1B5E20] mb-8">Холбоотой бүтээгдэхүүн</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link key={related.id} to={`/product/${related.id}`}>
                  <Card className="group hover:shadow-xl transition-all border-[#2E7D32]/10 h-full">
                    <div className="relative h-48 overflow-hidden bg-gray-100 rounded-t-lg">
                      <img
                        src={related.image}
                        alt={related.nameMn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-[#1B5E20] mb-2">{related.nameMn}</h3>
                      <div className="text-xl font-bold text-[#2E7D32]">
                        {related.price.toLocaleString()}₮
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
