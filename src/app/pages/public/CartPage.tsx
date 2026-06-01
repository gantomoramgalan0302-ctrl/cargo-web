import { Link } from 'react-router';
import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Wrench, Package } from 'lucide-react';

interface CartPageProps {
  cartItems: any[];
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
}

export default function CartPage({ cartItems, removeFromCart, updateCartQuantity }: CartPageProps) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <PublicLayout cartItemsCount={0}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-[#2E7D32]/20 mb-6" />
          <h2 className="text-3xl font-bold text-[#1B5E20] mb-4">Таны сагс хоосон байна</h2>
          <p className="text-[#5D4037]/70 mb-8">Дэлгүүрээс бүтээгдэхүүн эсвэл үйлчилгээ сонгоно уу</p>
          <div className="flex gap-3 justify-center">
            <Link to="/store">
              <Button size="lg" className="rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg">
                Дэлгүүр
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="rounded-xl border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF] shadow-lg">
                Үйлчилгээ
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout cartItemsCount={cartItems.length}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-[#1B5E20] mb-8">Миний сагс</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isService = item.type === 'service';
              const displayName = item.nameMn || item.name || item.title || '—';
              return (
                <Card key={item.id} className="border-[#2E7D32]/10">
                  <CardContent className="p-4 flex gap-4">
                    {/* Image / icon */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={displayName}
                        className="w-24 h-24 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-[#F5FBEF] flex items-center justify-center shrink-0">
                        {isService
                          ? <Wrench className="w-8 h-8 text-[#2E7D32]/40" />
                          : <Package className="w-8 h-8 text-[#2E7D32]/40" />
                        }
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1B5E20] mb-1 truncate">{displayName}</h3>
                      <p className="text-sm text-[#5D4037]/60 mb-3">
                        {item.category || (isService ? 'Үйлчилгээ' : 'Бүтээгдэхүүн')}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-[#2E7D32]/20"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center rounded-lg border-[#2E7D32]/20"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-[#2E7D32]/20"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-[#2E7D32] mb-2">
                        {(item.price * item.quantity).toLocaleString()}₮
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24 border-[#2E7D32]/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#1B5E20] mb-6">Захиалгын дүн</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#5D4037]/70">
                    <span>Нийт ({cartItems.length} зүйл)</span>
                    <span>{total.toLocaleString()}₮</span>
                  </div>
                  <div className="flex justify-between text-[#5D4037]/70">
                    <span>Хүргэлт</span>
                    <span className="text-[#2E7D32]">Үнэгүй</span>
                  </div>
                  <div className="border-t border-[#2E7D32]/10 pt-3 flex justify-between font-bold text-lg">
                    <span className="text-[#1B5E20]">Нийт дүн</span>
                    <span className="text-[#2E7D32]">{total.toLocaleString()}₮</span>
                  </div>
                </div>

                <Button size="lg" className="w-full rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg mb-3">
                  Төлбөр төлөх
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="flex gap-2">
                  <Link to="/store" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full rounded-xl border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF]">
                      Дэлгүүр
                    </Button>
                  </Link>
                  <Link to="/services" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full rounded-xl border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FBEF]">
                      Үйлчилгээ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
