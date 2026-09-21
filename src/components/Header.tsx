import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const { toggleCart, cart } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { products } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery
    ? products.filter(p => p.visible && p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center">
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl md:text-2xl font-black tracking-[0.2em] uppercase">
              DUOFREITAS
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link to="/" className="hover:text-gray-500">NOVIDADES</Link>
            <div className="group relative">
              <span className="cursor-pointer hover:text-gray-500 py-4">COLEÇÕES</span>
              <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-white border border-gray-200 shadow-lg p-4 min-w-[200px] z-50">
                <Link to="/" className="py-2 hover:text-gray-500">Essentials</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Utility</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Off Season</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Lookbook 26</Link>
              </div>
            </div>
            <div className="group relative">
              <span className="cursor-pointer hover:text-gray-500 py-4">CATEGORIAS</span>
              <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-white border border-gray-200 shadow-lg p-4 min-w-[200px] z-50">
                <Link to="/" className="py-2 hover:text-gray-500">Camisetas</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Moletons</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Calças</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Shorts</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Bonés</Link>
                <Link to="/" className="py-2 hover:text-gray-500">Chinelos</Link>
              </div>
            </div>
            <Link to="/" className="text-red-600 hover:text-red-800">SALE</Link>
          </nav>

          <div className="flex items-center gap-4 md:gap-6 relative">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-gray-500" aria-label="Buscar">
              <Search size={22} />
            </button>
            <Link to="/admin" className="hover:text-gray-500 hidden md:block" aria-label="Conta">
              <User size={22} />
            </Link>
            <button className="hover:text-gray-500 hidden md:block" aria-label="Favoritos">
              <Heart size={22} />
            </button>
            <button className="hover:text-gray-500 relative" onClick={() => toggleCart()} aria-label="Sacola">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {isSearchOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 md:w-96 bg-white border border-gray-200 shadow-xl p-4 z-50">
                <div className="flex items-center border-b border-gray-300 pb-2 mb-4">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Buscar produtos..."
                    className="w-full outline-none text-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && (
                  <div className="flex flex-col gap-3">
                    {searchResults.length > 0 ? (
                      searchResults.map(p => (
                        <Link key={p.id} to="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2" onClick={() => setIsSearchOpen(false)}>
                          <img src={p.imageFront} alt={p.name} className="w-10 h-12 object-cover" />
                          <div>
                            <p className="text-xs font-bold">{p.name}</p>
                            <p className="text-xs text-gray-500">R$ {p.priceCurrent.toFixed(2).replace('.', ',')}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4">Nenhum produto encontrado.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-xl font-black tracking-[0.2em]">DUOFREITAS</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <nav className="flex flex-col p-6 font-bold text-lg gap-6 overflow-y-auto">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>NOVIDADES</Link>
            <div className="flex flex-col gap-3">
              <span className="text-gray-400 text-sm">COLEÇÕES</span>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Essentials</Link>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Utility</Link>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Lookbook 26</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-gray-400 text-sm">CATEGORIAS</span>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Camisetas</Link>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Calças</Link>
              <Link to="/" className="pl-4" onClick={() => setIsMobileMenuOpen(false)}>Moletons</Link>
            </div>
            <Link to="/" className="text-red-600" onClick={() => setIsMobileMenuOpen(false)}>SALE</Link>
            <div className="border-t border-gray-200 pt-6 mt-2 flex flex-col gap-4">
              <Link to="/admin" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={20} /> Minha Conta / Admin
              </Link>
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <Heart size={20} /> Favoritos
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
