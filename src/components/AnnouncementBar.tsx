import { useState, useEffect } from 'react';

const MESSAGES = [
  'FRETE GRÁTIS ACIMA DE R$199',
  '10% OFF NA PRIMEIRA COMPRA — CUPOM: PRIMEIRA10',
  'ATÉ 3X SEM JUROS NO CARTÃO',
  'TROCA GRÁTIS EM ATÉ 30 DIAS'
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black text-white text-xs font-bold uppercase tracking-wider py-2 overflow-hidden relative h-8 flex items-center justify-center">
      {MESSAGES.map((msg, i) => (
        <div
          key={i}
          className={`absolute transition-all duration-500 ease-in-out ${
            i === index ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          {msg}
        </div>
      ))}
    </div>
  );
}
