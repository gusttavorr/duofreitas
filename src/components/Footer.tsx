export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 px-4 md:px-8 mt-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        
        {/* Marca */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-black tracking-[0.2em] uppercase">DUOFREITAS</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
            Streetwear feito no Brasil. Peças oversized, tecidos pesados e cortes urbanos.
          </p>
          <div className="flex gap-4 mt-2">
            {/* Ícones simples usando span para não precisar importar bibliotecas extras que podem não ter sido instaladas, ou Lucide se aplicável. O prompt diz: "Ícones de Instagram, X/Twitter e YouTube". Vamos usar textos curtos ou Lucide não os tem todos. */}
            <a href="#" className="font-bold text-sm hover:text-gray-500">INSTA</a>
            <a href="#" className="font-bold text-sm hover:text-gray-500">X/TWITTER</a>
            <a href="#" className="font-bold text-sm hover:text-gray-500">YOUTUBE</a>
          </div>
        </div>

        {/* Institucional */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold mb-2 uppercase text-sm">Institucional</h4>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Sobre Nós</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Trabalhe com a gente</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Políticas de Privacidade</a>
        </div>

        {/* Ajuda */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold mb-2 uppercase text-sm">Ajuda</h4>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Trocas e Devoluções</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Rastreie seu Pedido</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Guia de Tamanhos</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black">Fale Conosco</a>
        </div>

        {/* Pagamento */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold mb-2 uppercase text-sm">Formas de Pagamento</h4>
          <div className="flex flex-wrap gap-2">
            {['PIX', 'VISA', 'MASTER', 'ELO', 'AMEX', 'BOLETO'].map(method => (
              <span key={method} className="border border-gray-300 text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                {method}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="border border-gray-400 rounded-full w-5 h-5 flex items-center justify-center">🛡️</span>
              COMPRA 100% SEGURA
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="border border-gray-400 rounded-full w-5 h-5 flex items-center justify-center">🔒</span>
              SITE PROTEGIDO SSL
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-[1400px] mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-center text-center text-xs text-gray-500">
        <p>© 2026 DUOFREITAS — CNPJ 00.000.000/0001-00</p>
      </div>
    </footer>
  );
}
