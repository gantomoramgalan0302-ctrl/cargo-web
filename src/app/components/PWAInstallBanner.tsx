import { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem('pwa-banner-dismissed')
  );
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  const handleInstall = async () => {
    await install();
    setDismissed(true);
  };

  // Show banner: on iOS (if not dismissed), or if install prompt available
  const showBanner = !isInstalled && !dismissed && (isIOS || canInstall);
  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#2E7D32]/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1B5E20] text-sm">NARLAG ORCHIN апп</p>
              <p className="text-xs text-[#5D4037]/70 mt-0.5">
                {isIOS
                  ? 'Safari → 📤 Share → "Add to Home Screen"'
                  : 'Утсандаа апп болгон суулгах уу?'}
              </p>
              <div className="flex gap-2 mt-3">
                {isIOS ? (
                  <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] h-8 text-xs"
                    onClick={() => setShowIOSGuide(true)}>
                    Заавар үзэх
                  </Button>
                ) : (
                  <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] h-8 text-xs gap-1.5"
                    onClick={handleInstall}>
                    <Download className="w-3.5 h-3.5" /> Суулгах
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-8 text-xs border-gray-200"
                  onClick={handleDismiss}>
                  Дараа нь
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS guide modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B5E20]">iPhone-д суулгах заавар</h3>
              <button onClick={() => setShowIOSGuide(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <ol className="space-y-3 text-sm text-[#5D4037]">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">1</span>
                <span>Safari-н доод хэсэгт байрлах <strong>📤 Share</strong> товчийг дарна</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">2</span>
                <span><strong>"Add to Home Screen"</strong> сонгоно</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs shrink-0 font-bold">3</span>
                <span>Баруун дээд буланд <strong>"Add"</strong> дарна</span>
              </li>
            </ol>
            <Button className="w-full mt-5 bg-[#2E7D32] hover:bg-[#1B5E20]"
              onClick={() => { setShowIOSGuide(false); handleDismiss(); }}>
              Ойлголоо
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
