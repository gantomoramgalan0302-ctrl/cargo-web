import PublicLayout from '../../components/PublicLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Таны мессеж амжилттай илгээгдлээ!');
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Холбоо барих</h1>
          <p className="text-xl text-white/90">Бидэнтэй холбогдоход бэлэн байна</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-[#2E7D32]/10 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-6">Мессеж илгээх</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Нэр</Label>
                    <Input placeholder="Таны нэр" className="rounded-lg border-[#2E7D32]/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Утас</Label>
                    <Input type="tel" placeholder="99112233" className="rounded-lg border-[#2E7D32]/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>И-мэйл</Label>
                  <Input type="email" placeholder="example@email.com" className="rounded-lg border-[#2E7D32]/20" />
                </div>

                <div className="space-y-2">
                  <Label>Гарчиг</Label>
                  <Input placeholder="Мессежийн гарчиг" className="rounded-lg border-[#2E7D32]/20" />
                </div>

                <div className="space-y-2">
                  <Label>Мессеж</Label>
                  <Textarea 
                    placeholder="Таны мессеж..." 
                    className="min-h-32 rounded-lg border-[#2E7D32]/20"
                  />
                </div>

                <Button type="submit" className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]">
                  Илгээх
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Хаяг</h3>
                  <p className="text-[#5D4037]/70">
                    Сүхбаатар дүүрэг, 1-р хороо<br />
                    Улаанбаатар, Монгол Улс
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Утас</h3>
                  <p className="text-[#5D4037]/70">
                    +976 9604 8090<br />
                    +976 8011 9565
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">И-мэйл</h3>
                  <p className="text-[#5D4037]/70">
                    narlagorchin@gmail.com<br />
                    contact@narlag.mn
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#2E7D32]/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Ажлын цаг</h3>
                  <p className="text-[#5D4037]/70">
                    Даваа - Баасан: 09:00 - 18:00<br />
                    Бямба: 10:00 - 15:00<br />
                    Ням: Амарна
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
