import { useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem('duofreitas-cookies-accepted');
  });

  if (!visible) return null;

  const handleClose = () => {
    localStorage.setItem('duofreitas-cookies-accepted', 'true');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm shadow-xl">
      <p className="text-gray-600 max-w-4xl">
        Usamos cookies para melhorar sua experiência de navegação, personalizar ofertas e analisar nosso tráfego, conforme a LGPD.
      </p>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button onClick={handleClose} className="px-6 py-2 border border-gray-300 font-bold hover:bg-gray-50 flex-1 sm:flex-none">
          RECUSAR
        </button>
        <button onClick={handleClose} className="px-6 py-2 bg-black text-white font-bold hover:bg-gray-800 flex-1 sm:flex-none">
          ACEITAR
        </button>
      </div>
    </div>
  );
}
