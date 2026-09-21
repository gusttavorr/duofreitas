import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const hasSeen = localStorage.getItem('duofreitas-newsletter-seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('duofreitas-newsletter-seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 relative flex flex-col items-center text-center">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={24} />
        </button>
        
        <span className="text-xs font-bold text-gray-500 tracking-widest mb-2">NEWSLETTER</span>
        <h2 className="text-2xl font-bold uppercase mb-4">10% OFF na primeira compra</h2>
        
        {!submitted ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Cadastre seu e-mail e receba o cupom + acesso antecipado aos drops.
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="w-full border border-gray-300 p-3 outline-none focus:border-black"
              />
              <button type="submit" className="w-full bg-black text-white font-bold p-3 uppercase hover:bg-gray-800 transition-colors">
                QUERO MEU CUPOM
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 font-bold text-green-600">
            CUPOM PRIMEIRA10 ENVIADO PARA SEU E-MAIL.
          </div>
        )}
      </div>
    </div>
  );
}
