import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calculator, Send, Download, Settings, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function QuotationPage() {
  const [area, setArea] = useState('');
  const [plantType, setPlantType] = useState('');
  const [workers, setWorkers] = useState('');
  const [duration, setDuration] = useState('');
  const [quotation, setQuotation] = useState<any>(null);

  // Pricing formulas (admin can edit these)
  const PRICE_PER_SQM = 50000; // ₮ per m²
  const WORKER_COST_PER_DAY = 100000; // ₮ per worker per day
  const PLANT_MULTIPLIERS: any = {
    'basic': 1,
    'premium': 1.5,
    'exotic': 2
  };

  const calculateQuotation = () => {
    if (!area || !plantType || !workers || !duration) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    const areaNum = parseFloat(area);
    const workersNum = parseInt(workers);
    const durationNum = parseInt(duration);
    const plantMultiplier = PLANT_MULTIPLIERS[plantType] || 1;

    const materialCost = areaNum * PRICE_PER_SQM * plantMultiplier;
    const laborCost = workersNum * WORKER_COST_PER_DAY * durationNum;
    const totalCost = materialCost + laborCost;
    const profit = totalCost * 0.2; // 20% profit margin
    const finalPrice = totalCost + profit;

    setQuotation({
      area: areaNum,
      plantType,
      workers: workersNum,
      duration: durationNum,
      materialCost,
      laborCost,
      totalCost,
      profit,
      finalPrice
    });

    toast.success('Үнийн санал тооцоолов');
  };

  const getQuotationText = (q: any) => `НАРЛАГ ОРЧИН — ҮНИЙН САНАЛ
================================
Огноо: ${new Date().toLocaleDateString('mn-MN')}

ТӨСЛИЙН МЭДЭЭЛЭЛ:
- Талбайн хэмжээ: ${q.area} м²
- Ургамлын төрөл: ${getPlantTypeName(q.plantType)}
- Ажилчдын тоо: ${q.workers} хүн
- Ажлын хугацаа: ${q.duration} хоног

ҮНЭ ТООЦОО:
- Материалын зардал: ${q.materialCost.toLocaleString()}₮
- Ажлын хөлс: ${q.laborCost.toLocaleString()}₮
- Нийт зардал: ${q.totalCost.toLocaleString()}₮
- Ашиг (20%): ${q.profit.toLocaleString()}₮

НИЙТ ҮНЭ: ${q.finalPrice.toLocaleString()}₮
================================
НАРЛАГ ОРЧИН ХХК`;

  const handleCopy = () => {
    if (!quotation) return;
    navigator.clipboard.writeText(getQuotationText(quotation));
    toast.success('Текст хуулагдлаа');
  };

  const handleDownloadDoc = () => {
    if (!quotation) return;
    const text = getQuotationText(quotation);
    const blob = new Blob(['﻿' + text], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uniin_sanal_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('.doc файл татагдлаа');
  };

  const getPlantTypeName = (type: string) => {
    switch (type) {
      case 'basic': return 'Энгийн';
      case 'premium': return 'Дунд зэрэг';
      case 'exotic': return 'Онцгой';
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1B5E20] mb-2">Үнийн санал үүсгэгч</h1>
            <p className="text-[#5D4037]/70">Автомат үнийн санал тооцоолох систем</p>
          </div>
          <Button variant="outline" className="rounded-xl border-[#2E7D32]/20">
            <Settings className="w-5 h-5 mr-2" />
            Үнийн тохиргоо
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20] flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Төслийн мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Талбайн хэмжээ (м²)</Label>
                <Input
                  type="number"
                  placeholder="Жишээ: 500"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="rounded-lg border-[#2E7D32]/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Ургамлын төрөл</Label>
                <Select value={plantType} onValueChange={setPlantType}>
                  <SelectTrigger className="rounded-lg border-[#2E7D32]/20">
                    <SelectValue placeholder="Сонгох..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Энгийн (×1.0)</SelectItem>
                    <SelectItem value="premium">Дунд зэрэг (×1.5)</SelectItem>
                    <SelectItem value="exotic">Онцгой (×2.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Хэдэн ажилчин шаардлагатай</Label>
                <Input
                  type="number"
                  placeholder="Жишээ: 5"
                  value={workers}
                  onChange={(e) => setWorkers(e.target.value)}
                  className="rounded-lg border-[#2E7D32]/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Ажлын хугацаа (хоног)</Label>
                <Input
                  type="number"
                  placeholder="Жишээ: 10"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="rounded-lg border-[#2E7D32]/20"
                />
              </div>

              <Button 
                className="w-full rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]"
                onClick={calculateQuotation}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Тооцоолох
              </Button>
            </CardContent>
          </Card>

          {/* Quotation Result */}
          <Card className="border-[#2E7D32]/10">
            <CardHeader>
              <CardTitle className="text-[#1B5E20]">Үнийн санал</CardTitle>
            </CardHeader>
            <CardContent>
              {quotation ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-[#F5FBEF] border border-[#2E7D32]/10">
                    <h4 className="font-semibold text-[#1B5E20] mb-3">Төслийн мэдээлэл</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70">Талбайн хэмжээ:</span>
                        <span className="font-medium text-[#1B5E20]">{quotation.area} м²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70">Ургамлын төрөл:</span>
                        <span className="font-medium text-[#1B5E20]">{getPlantTypeName(quotation.plantType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70">Ажилчид:</span>
                        <span className="font-medium text-[#1B5E20]">{quotation.workers} хүн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70">Хугацаа:</span>
                        <span className="font-medium text-[#1B5E20]">{quotation.duration} хоног</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-[#2E7D32]/10">
                      <span className="text-[#5D4037]/70">Материалын зардал:</span>
                      <span className="text-lg font-bold text-[#1B5E20]">
                        {quotation.materialCost.toLocaleString()}₮
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-[#2E7D32]/10">
                      <span className="text-[#5D4037]/70">Ажлын хөлс:</span>
                      <span className="text-lg font-bold text-[#1B5E20]">
                        {quotation.laborCost.toLocaleString()}₮
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-[#2E7D32]/10">
                      <span className="text-[#5D4037]/70">Нийт зардал:</span>
                      <span className="text-lg font-bold text-[#1B5E20]">
                        {quotation.totalCost.toLocaleString()}₮
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-[#66BB6A]/5 border border-[#66BB6A]/20">
                      <span className="text-[#5D4037]/70">Ашиг (20%):</span>
                      <span className="text-lg font-bold text-[#66BB6A]">
                        {quotation.profit.toLocaleString()}₮
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white">
                      <span className="font-semibold">Эцсийн үнэ:</span>
                      <span className="text-2xl font-bold">
                        {quotation.finalPrice.toLocaleString()}₮
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button className="flex-1 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Текст хуулах
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-lg border-[#2E7D32]/20 hover:bg-[#F5FBEF]" onClick={handleDownloadDoc}>
                      <Download className="w-4 h-4 mr-2" />
                      .doc татах
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 mx-auto text-[#2E7D32]/20 mb-4" />
                  <p className="text-[#5D4037]/60">Үнийн санал үүсгэхийн тулд мэдээллээ оруулна уу</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Settings */}
        <Card className="border-[#2E7D32]/10">
          <CardHeader>
            <CardTitle className="text-[#1B5E20]">Үнийн тохиргоо</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F5FBEF]">
                <p className="text-sm text-[#5D4037]/70 mb-1">Нэг м² үнэ</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{PRICE_PER_SQM.toLocaleString()}₮</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FBEF]">
                <p className="text-sm text-[#5D4037]/70 mb-1">Ажилчдын хөлс/өдөр</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{WORKER_COST_PER_DAY.toLocaleString()}₮</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FBEF]">
                <p className="text-sm text-[#5D4037]/70 mb-1">Ашгийн хувь</p>
                <p className="text-2xl font-bold text-[#2E7D32]">20%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
