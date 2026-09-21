import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Heart } from 'lucide-react';
import type { Size } from '../types';

function HeroBanner() {
  const { siteSettings } = useStore();
  const slides = siteSettings?.heroSlides || [];
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-offwhite">
      {/* Imagem invisível para a altura do container dinamicamente */}
      <img src={slides[0]} alt="" className="w-full h-auto invisible pointer-events-none block" />
      
      {slides.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${slide === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={img} alt={`Banner ${i}`} className="w-full h-full object-contain block" />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-1 transition-all ${slide === i ? 'w-8 bg-black/80' : 'w-4 bg-black/30'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function BenefitsStrip() {
  return (
    <div className="bg-offwhite border-y border-gray-200 py-10 mt-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div className="pt-8 md:pt-0 px-4">
          <h3 className="font-bold mb-2">FRETE GRÁTIS</h3>
          <p className="text-sm text-gray-600">Em pedidos acima de R$199 para todo o Brasil.</p>
        </div>
        <div className="pt-8 md:pt-0 px-4">
          <h3 className="font-bold mb-2">5% OFF NO PIX</h3>
          <p className="text-sm text-gray-600">Desconto aplicado automaticamente no checkout.</p>
        </div>
        <div className="pt-8 md:pt-0 px-4">
          <h3 className="font-bold mb-2">TROCA GRÁTIS</h3>
          <p className="text-sm text-gray-600">Primeira troca sem custo em até 30 dias.</p>
        </div>
      </div>
    </div>
  );
}

export default function Storefront() {
  const { products, addToCart } = useStore();
  const visibleProducts = products.filter(p => p.visible).sort((a, b) => a.order - b.order);

  const handleAdd = (product: any, selectedSize?: Size) => {
    let sizeToAdd = selectedSize;
    if (!sizeToAdd) {
      const availableSizes = (['P', 'M', 'G', 'GG'] as Size[]).filter(s => product.stock[s] > 0);
      if (availableSizes.length > 0) sizeToAdd = availableSizes[0];
    }
    
    if (sizeToAdd) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.priceCurrent,
        quantity: 1,
        size: sizeToAdd,
        image: product.imageFront
      });
    }
  };

  return (
    <div className="w-full">
      <HeroBanner />
      
      <div id="vitrine" className="max-w-[1400px] mx-auto px-4 md:px-8 mt-16 md:mt-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">DROP EM DESTAQUE</p>
            <h2 className="text-3xl font-black uppercase">Camisetas & Calças</h2>
          </div>
          <a href="#" className="text-sm font-bold border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors hidden md:block">
            VER TUDO
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
          {visibleProducts.map(product => {
            const hasStock = Object.values(product.stock).some(qty => qty > 0);
            const sizes: Size[] = ['P', 'M', 'G', 'GG'];
            const pixPrice = product.priceCurrent * 0.95;
            const installment = product.priceCurrent / 3;

            return (
              <div key={product.id} className="group relative flex flex-col">
                {product.badge && (
                  <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] font-bold px-2 py-1">
                    {product.badge}
                  </div>
                )}
                
                <button className="absolute top-2 right-2 z-10 bg-white p-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Favoritar">
                  <Heart size={18} />
                </button>

                <div className="relative aspect-[9/11] mb-4 overflow-hidden bg-gray-100">
                  <img src={product.imageFront} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                  <img src={product.imageBack} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  
                  {hasStock && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 flex justify-center gap-2">
                      {sizes.map(size => (
                        product.stock[size] > 0 ? (
                          <button key={size} onClick={() => handleAdd(product, size)} className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xs hover:border-black hover:bg-black hover:text-white font-bold transition-colors">
                            {size}
                          </button>
                        ) : (
                          <span key={size} className="w-8 h-8 flex items-center justify-center text-xs text-gray-300 line-through">
                            {size}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <h3 className="font-bold text-sm uppercase leading-tight mb-2">{product.name}</h3>
                  <div className="flex items-end gap-2 mb-1">
                    {product.priceOld && (
                      <span className="text-xs text-gray-400 line-through">R$ {product.priceOld.toFixed(2).replace('.', ',')}</span>
                    )}
                    <span className="font-bold text-base">R$ {product.priceCurrent.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-4 flex flex-col gap-0.5">
                    <span>3x de R$ {installment.toFixed(2).replace('.', ',')} s/ juros</span>
                    <span className="text-green-700 font-bold">R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX</span>
                  </div>
                  
                  <button 
                    disabled={!hasStock}
                    onClick={() => handleAdd(product)}
                    className={`mt-auto w-full py-3 text-sm font-bold transition-colors ${hasStock ? 'bg-black text-white hover:bg-white hover:text-black border border-black' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    {hasStock ? 'ADICIONAR AO CARRINHO' : 'ESGOTADO - SEM ESTOQUE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <a href="#" className="text-sm font-bold border-b border-black pb-1 hover:text-gray-600 transition-colors">
            VER TUDO
          </a>
        </div>
      </div>

      <BenefitsStrip />
    </div>
  );
}
