import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CartSidebar() {
  const { isCartOpen, toggleCart, cart, removeFromCart, updateQuantity, coupon, applyCoupon, removeCoupon } = useStore();
  const [cep, setCep] = useState('');
  const [cepResult, setCepResult] = useState<{ price: number; days: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = coupon === 'PRIMEIRA10' ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  const isFreeShipping = total >= 199;
  const missingForFreeShipping = isFreeShipping ? 0 : 199 - total;
  const pixPrice = total * 0.95;

  const handleCep = () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepResult({ price: isFreeShipping ? 0 : 18.90, days: 4 });
    } else {
      setCepResult(null);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    if (applyCoupon(couponInput)) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido');
    }
  };

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => toggleCart(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">SUA SACOLA</h2>
          <button onClick={() => toggleCart(false)} className="hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 p-4 border-b border-gray-200 text-sm text-center font-bold">
          {isFreeShipping ? (
            <span className="text-green-600">PARABÉNS! VOCÊ GANHOU FRETE GRÁTIS</span>
          ) : (
            <span>Faltam R$ {missingForFreeShipping.toFixed(2).replace('.', ',')} para você ganhar FRETE GRÁTIS!</span>
          )}
          <div className="w-full h-1 bg-gray-300 mt-2">
            <div 
              className="h-full bg-black transition-all" 
              style={{ width: `${Math.min(100, (total / 199) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <p>SUA SACOLA ESTÁ VAZIA</p>
              <button onClick={() => toggleCart(false)} className="px-6 py-3 bg-black text-white font-bold text-sm">
                CONTINUAR COMPRANDO
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm uppercase leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Tamanho: {item.size}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-gray-400 hover:text-black underline ml-2">
                      Remover
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-gray-300">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-gray-100">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 flex flex-col gap-4">
            
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold block mb-1">CUPOM DE DESCONTO</label>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Ex: PRIMEIRA10"
                    className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black uppercase"
                  />
                </div>
                <button onClick={handleApplyCoupon} className="bg-black text-white px-4 py-2 text-sm font-bold h-10">
                  APLICAR
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              {coupon && (
                <div className="flex items-center justify-between bg-gray-100 p-2 text-xs font-bold">
                  <span>CUPOM: {coupon}</span>
                  <button onClick={removeCoupon} className="text-red-500 hover:underline">REMOVER</button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-bold block mb-1">CALCULAR FRETE</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="flex-1 border border-gray-300 p-2 text-sm outline-none focus:border-black"
                />
                <button onClick={handleCep} className="border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-50 h-10">
                  OK
                </button>
              </div>
              {cepResult && (
                <p className="text-xs mt-2 text-gray-600">
                  {cepResult.price === 0 ? 'Frete Grátis' : `R$ ${cepResult.price.toFixed(2).replace('.', ',')}`} — Estimativa: {cepResult.days} dias úteis
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto (10%)</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className="text-xs text-green-600 font-bold text-right">
                ou R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX (5% OFF)
              </p>
            </div>

            <button className="w-full bg-black text-white font-bold py-4 mt-2 hover:bg-gray-800 transition-colors">
              FINALIZAR COMPRA
            </button>
          </div>
        )}
      </div>
    </>
  );
}
