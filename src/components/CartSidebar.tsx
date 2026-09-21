import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Address {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
  complemento: string;
}

export default function CartSidebar() {
  const { isCartOpen, toggleCart, cart, updateQuantity, removeFromCart, coupon, applyCoupon, removeCoupon } = useStore();
  const [cep, setCep] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  
  const [freightValue, setFreightValue] = useState<number | null>(null);
  const [freightError, setFreightError] = useState('');
  
  // Checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState<Address>({
    cep: '', logradouro: '', bairro: '', localidade: '', uf: '', numero: '', complemento: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARTAO'>('PIX');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = coupon ? subtotal * 0.1 : 0;
  
  // Se for mais de 199, frete é grátis.
  const isFreeShipping = (subtotal - discount) >= 199;
  const missingForFreeShipping = isFreeShipping ? 0 : 199 - (subtotal - discount);
  
  const total = subtotal - discount + (isFreeShipping ? 0 : (freightValue || 0));

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    if (applyCoupon(couponInput)) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido');
    }
  };

  const calculateFreight = async (cepInput: string) => {
    setFreightError('');
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setFreightError('CEP inválido');
      return;
    }
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setFreightError('CEP não encontrado');
        return;
      }
      
      // Update address fields
      setAddress(prev => ({
        ...prev,
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf
      }));

      // Simulador de Frete Fixo por Região
      let cost = 30; // Padrão Brasil
      if (['SP', 'RJ', 'MG', 'ES'].includes(data.uf)) cost = 15;
      else if (['PR', 'SC', 'RS'].includes(data.uf)) cost = 20;
      
      setFreightValue(cost);
    } catch (e) {
      setFreightError('Erro ao consultar CEP');
    }
  };

  const finishOrderWhatsApp = () => {
    if (!address.logradouro || !address.numero) {
      alert('Por favor, calcule o frete e preencha o número do endereço antes de finalizar.');
      return;
    }

    const phone = '5511999999999'; // Número do lojista (depois configurar no painel, mas mockado agora)
    
    let message = `*NOVO PEDIDO - DUOFREITAS* 🛍️\n\n`;
    
    message += `*ITENS DO PEDIDO:*\n`;
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (Tam: ${item.size}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*VALORES:*\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    if (coupon) message += `Desconto (Cupom ${coupon}): - R$ ${discount.toFixed(2)}\n`;
    message += `Frete: ${isFreeShipping ? 'GRÁTIS' : `R$ ${freightValue?.toFixed(2) || '0.00'}`}\n`;
    
    const finalTotal = paymentMethod === 'PIX' ? total * 0.95 : total;
    message += `*TOTAL: R$ ${finalTotal.toFixed(2)}*\n\n`;
    
    message += `*ENDEREÇO DE ENTREGA:*\n`;
    message += `${address.logradouro}, ${address.numero}\n`;
    if (address.complemento) message += `${address.complemento}\n`;
    message += `${address.bairro} - ${address.localidade}/${address.uf}\n`;
    message += `CEP: ${address.cep}\n\n`;
    
    message += `*FORMA DE PAGAMENTO:*\n`;
    message += paymentMethod === 'PIX' ? `Pix (Aguardando Chave/QR Code)` : `Cartão de Crédito (Aguardando Link de Pagamento)`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    
    toggleCart(false);
  };

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => toggleCart(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider">
            <ShoppingBag size={20} />
            {isCheckingOut ? 'Finalizar Compra' : 'Sua Sacola'}
          </h2>
          <button onClick={() => toggleCart(false)} className="hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        {!isCheckingOut && (
          <div className="bg-gray-50 p-4 border-b border-gray-200 text-sm text-center font-bold">
            {isFreeShipping ? (
              <span className="text-green-600">PARABÉNS! VOCÊ GANHOU FRETE GRÁTIS</span>
            ) : (
              <span>Faltam R$ {missingForFreeShipping.toFixed(2).replace('.', ',')} para você ganhar FRETE GRÁTIS!</span>
            )}
            <div className="w-full h-1 bg-gray-300 mt-2">
              <div 
                className="h-full bg-black transition-all" 
                style={{ width: `${Math.min(100, ((subtotal - discount) / 199) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 p-6">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>SUA SACOLA ESTÁ VAZIA</p>
              <button onClick={() => toggleCart(false)} className="px-6 py-3 bg-black text-white font-bold text-sm">
                CONTINUAR COMPRANDO
              </button>
            </div>
          ) : !isCheckingOut ? (
            <div className="p-6 flex flex-col gap-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm uppercase leading-tight">{item.name}</h3>
                        <button onClick={() => removeFromCart(`${item.id}-${item.size}`)} className="text-gray-400 hover:text-black">
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">TAM: {item.size}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-gray-300">
                        <button onClick={() => updateQuantity(`${item.id}-${item.size}`, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-gray-100">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(`${item.id}-${item.size}`, item.quantity + 1)} className="p-1 hover:bg-gray-100">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Checkout Form
            <div className="p-6 flex flex-col gap-6 animate-in fade-in">
              <button onClick={() => setIsCheckingOut(false)} className="text-xs text-gray-500 hover:text-black font-bold uppercase mb-2 flex items-center gap-1">
                ← Voltar para sacola
              </button>

              <div className="flex flex-col gap-4">
                <h3 className="font-black uppercase tracking-widest text-sm border-b pb-2">Endereço de Entrega</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex gap-2">
                    <input disabled value={address.cep} placeholder="CEP" className="border border-gray-200 p-3 w-1/3 bg-gray-50" />
                    <input disabled value={address.logradouro} placeholder="Rua" className="border border-gray-200 p-3 flex-1 bg-gray-50" />
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Número" required value={address.numero} onChange={e => setAddress({...address, numero: e.target.value})} className="border border-gray-300 p-3 w-1/3 outline-none focus:border-black" />
                    <input type="text" placeholder="Complemento (Opcional)" value={address.complemento} onChange={e => setAddress({...address, complemento: e.target.value})} className="border border-gray-300 p-3 flex-1 outline-none focus:border-black" />
                  </div>
                  <div className="flex gap-2">
                    <input disabled value={address.bairro} placeholder="Bairro" className="border border-gray-200 p-3 flex-1 bg-gray-50" />
                    <input disabled value={`${address.localidade} - ${address.uf}`} placeholder="Cidade" className="border border-gray-200 p-3 flex-1 bg-gray-50" />
                  </div>
                </div>

                <h3 className="font-black uppercase tracking-widest text-sm border-b pb-2 mt-4">Forma de Pagamento</h3>
                <div className="flex flex-col gap-3">
                  <label className={`border p-4 flex items-center gap-3 cursor-pointer transition-colors ${paymentMethod === 'PIX' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'PIX'} onChange={() => setPaymentMethod('PIX')} className="accent-black w-4 h-4" />
                    <div>
                      <p className="font-bold text-sm">PIX</p>
                      <p className="text-xs text-gray-500">Aprovação imediata (5% de desconto)</p>
                    </div>
                  </label>
                  <label className={`border p-4 flex items-center gap-3 cursor-pointer transition-colors ${paymentMethod === 'CARTAO' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'CARTAO'} onChange={() => setPaymentMethod('CARTAO')} className="accent-black w-4 h-4" />
                    <div>
                      <p className="font-bold text-sm">Cartão de Crédito / Boleto</p>
                      <p className="text-xs text-gray-500">Enviaremos o link de pagamento seguro no WhatsApp</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && !isCheckingOut && (
          <div className="border-t border-gray-200 p-6 flex flex-col gap-4 bg-gray-50">
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
                <button onClick={handleApplyCoupon} className="bg-black text-white px-4 py-2 text-sm font-bold h-9">
                  APLICAR
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              {coupon && (
                <div className="flex items-center justify-between bg-gray-200 p-2 text-xs font-bold mt-2">
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
                <button onClick={() => calculateFreight(cep)} className="border border-gray-300 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100 h-9 transition-colors">
                  OK
                </button>
              </div>
              {freightError && <p className="text-xs mt-2 text-red-500">{freightError}</p>}
              {freightValue !== null && (
                <p className="text-xs mt-2 text-green-600 font-bold">
                  Entrega para {address.localidade}/{address.uf}: {isFreeShipping ? 'GRÁTIS' : `R$ ${freightValue.toFixed(2).replace('.', ',')}`}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete</span>
                <span className="font-bold text-gray-500">
                  {freightValue === null ? '--' : (isFreeShipping ? 'Grátis' : `R$ ${freightValue.toFixed(2).replace('.', ',')}`)}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-black mt-2">
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (freightValue === null) {
                  alert("Por favor, calcule o frete para prosseguir.");
                  return;
                }
                setIsCheckingOut(true);
              }}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 mt-2 hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
            >
              Finalizar Compra <ArrowRight size={18} />
            </button>
          </div>
        )}

        {cart.length > 0 && isCheckingOut && (
          <div className="border-t border-gray-200 p-6 flex flex-col gap-4 bg-gray-50">
            <div className="flex justify-between text-lg font-black mb-2">
              <span>TOTAL (com {paymentMethod})</span>
              <span>R$ {(paymentMethod === 'PIX' ? total * 0.95 : total).toFixed(2).replace('.', ',')}</span>
            </div>
            <button 
              onClick={finishOrderWhatsApp}
              className="w-full bg-green-600 text-white font-bold uppercase tracking-widest py-4 hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
            >
              Concluir no WhatsApp <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
