import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import type { Product, Size } from '../types';
import { Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Plus, Settings, LogOut, Upload, X } from 'lucide-react';

export default function AdminPanel() {
  const { isAuthenticated, user, loading, checkAuth, logout } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct, siteSettings, updateSettings } = useStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  
  // Settings Form State
  const [heroSlides, setHeroSlides] = useState<string[]>(siteSettings.heroSlides);
  const [colors, setColors] = useState({
    themeColorOffwhite: siteSettings.themeColorOffwhite,
    themeColorWhite: siteSettings.themeColorWhite,
    themeColorBlack: siteSettings.themeColorBlack
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoginError(error.message);
      } else {
        await checkAuth();
      }
    } catch {
      setLoginError('Erro de conexão');
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload', error);
      alert('Erro ao fazer upload da imagem.');
      return null;
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newProducts = [...products].sort((a, b) => a.order - b.order);
    if (direction === 'up' && index > 0) {
      const temp = newProducts[index].order;
      newProducts[index].order = newProducts[index - 1].order;
      newProducts[index - 1].order = temp;
      await updateProduct(newProducts[index]);
      await updateProduct(newProducts[index - 1]);
    } else if (direction === 'down' && index < newProducts.length - 1) {
      const temp = newProducts[index].order;
      newProducts[index].order = newProducts[index + 1].order;
      newProducts[index + 1].order = temp;
      await updateProduct(newProducts[index]);
      await updateProduct(newProducts[index + 1]);
    }
  };

  const handleToggleVisible = (product: Product) => {
    updateProduct({ ...product, visible: !product.visible });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const openForm = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        id: Date.now().toString(),
        name: '',
        category: 'Camisetas',
        description: '',
        priceCurrent: 0,
        visible: true,
        imageFront: '',
        imageBack: '',
        stock: { P: 0, M: 0, G: 0, GG: 0 },
        order: products.length > 0 ? Math.max(...products.map(p => p.order)) + 1 : 1
      });
    }
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (products.find(p => p.id === editingProduct.id)) {
      updateProduct(editingProduct);
    } else {
      addProduct(editingProduct);
    }
    setEditingProduct(null);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ heroSlides, ...colors });
    alert('Configurações salvas!');
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-widest uppercase mb-2">DUOFREITAS</h1>
            <h2 className="text-sm font-bold text-gray-500">ACESSO ADMIN SECURE</h2>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">E-MAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 p-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">SENHA</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 p-3 outline-none focus:border-black" />
            </div>
            {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
            <button type="submit" className="w-full bg-black text-white font-bold p-3 mt-2 hover:bg-gray-800">
              ENTRAR
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-black underline">VOLTAR PARA A LOJA</Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase">Painel do Catálogo</h1>
          <p className="text-sm text-gray-500">Logado como: {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 border border-gray-300 text-sm font-bold ${activeTab === 'products' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
            PRODUTOS
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 border border-gray-300 text-sm font-bold flex items-center gap-2 ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
            <Settings size={16} /> CONFIGURAÇÕES
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white text-sm font-bold hover:bg-red-700 ml-4 flex items-center gap-2">
            <LogOut size={16} /> SAIR
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-6">Configurações do Site</h2>
          <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="flex flex-col gap-6">
              <h3 className="font-bold text-sm border-b pb-2">Cores do Tema</h3>
              <div>
                <label className="block text-xs font-bold mb-1">Fundo Principal (Off-white)</label>
                <div className="flex gap-2">
                  <input type="color" value={colors.themeColorOffwhite} onChange={e => setColors({...colors, themeColorOffwhite: e.target.value})} className="h-10 w-10 cursor-pointer" />
                  <input type="text" value={colors.themeColorOffwhite} onChange={e => setColors({...colors, themeColorOffwhite: e.target.value})} className="border p-2 text-sm flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Fundo Secundário (Branco/Cards)</label>
                <div className="flex gap-2">
                  <input type="color" value={colors.themeColorWhite} onChange={e => setColors({...colors, themeColorWhite: e.target.value})} className="h-10 w-10 cursor-pointer" />
                  <input type="text" value={colors.themeColorWhite} onChange={e => setColors({...colors, themeColorWhite: e.target.value})} className="border p-2 text-sm flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Cor Primária (Textos, Botões)</label>
                <div className="flex gap-2">
                  <input type="color" value={colors.themeColorBlack} onChange={e => setColors({...colors, themeColorBlack: e.target.value})} className="h-10 w-10 cursor-pointer" />
                  <input type="text" value={colors.themeColorBlack} onChange={e => setColors({...colors, themeColorBlack: e.target.value})} className="border p-2 text-sm flex-1" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="font-bold text-sm border-b pb-2">Banner Principal (Hero)</h3>
              {heroSlides.map((slide, i) => (
                <div key={i} className="flex gap-2 items-start border p-2">
                  <img src={slide} alt="Slide" className="w-24 h-16 object-cover" />
                  <div className="flex-1">
                    <input type="text" value={slide} onChange={e => {
                      const ns = [...heroSlides]; ns[i] = e.target.value; setHeroSlides(ns);
                    }} className="w-full border p-1 text-xs mb-1" />
                    <label className="cursor-pointer text-xs bg-gray-200 px-2 py-1 flex items-center justify-center gap-1 w-24 hover:bg-gray-300">
                      <Upload size={12}/> UPLOAD
                      <input type="file" className="hidden" accept="image/*" onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const url = await uploadImage(e.target.files[0]);
                          if (url) {
                            const ns = [...heroSlides]; ns[i] = url; setHeroSlides(ns);
                          }
                        }
                      }} />
                    </label>
                  </div>
                  <button type="button" onClick={() => setHeroSlides(heroSlides.filter((_, idx) => idx !== i))} className="text-red-500 p-1"><X size={16}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setHeroSlides([...heroSlides, ''])} className="border border-dashed p-4 text-sm font-bold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Plus size={16}/> ADICIONAR SLIDE
              </button>
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <button type="submit" className="px-8 py-3 bg-black text-white font-bold text-sm hover:bg-gray-800">
                SALVAR CONFIGURAÇÕES
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openForm()} className="px-4 py-2 bg-black text-white text-sm font-bold flex items-center gap-2 hover:bg-gray-800">
              <Plus size={16} /> NOVO PRODUTO
            </button>
          </div>

          {editingProduct ? (
            <div className="bg-white border border-gray-200 p-6 shadow-sm mb-8">
              <h2 className="text-lg font-bold mb-6">{products.find(p => p.id === editingProduct.id) ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h2>
              <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ... existing form fields for products ... */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">NOME</label>
                    <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border p-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">CATEGORIA</label>
                      <input required type="text" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full border p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">SELO (OPCIONAL)</label>
                      <input type="text" value={editingProduct.badge || ''} onChange={e => setEditingProduct({...editingProduct, badge: e.target.value})} className="w-full border p-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">PREÇO ATUAL (R$)</label>
                      <input required type="number" step="0.01" min="0" value={editingProduct.priceCurrent} onChange={e => setEditingProduct({...editingProduct, priceCurrent: parseFloat(e.target.value)})} className="w-full border p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">PREÇO ANTIGO (OPCIONAL)</label>
                      <input type="number" step="0.01" min="0" value={editingProduct.priceOld || ''} onChange={e => setEditingProduct({...editingProduct, priceOld: parseFloat(e.target.value) || undefined})} className="w-full border p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">DESCRIÇÃO</label>
                    <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border p-2 text-sm" />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="checkbox" checked={editingProduct.visible} onChange={e => setEditingProduct({...editingProduct, visible: e.target.checked})} className="w-4 h-4 accent-black" />
                    VISÍVEL NA LOJA
                  </label>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">IMAGEM FRENTE (URL ou Upload)</label>
                      <input required type="text" value={editingProduct.imageFront} onChange={e => setEditingProduct({...editingProduct, imageFront: e.target.value})} className="w-full border p-2 text-sm mb-2" />
                      
                      <label className="cursor-pointer text-xs bg-gray-200 px-2 py-1 mb-2 inline-flex items-center gap-1 hover:bg-gray-300">
                        <Upload size={12}/> UPLOAD IMAGEM
                        <input type="file" className="hidden" accept="image/*" onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            const url = await uploadImage(e.target.files[0]);
                            if (url) setEditingProduct({...editingProduct, imageFront: url});
                          }
                        }} />
                      </label>
                      {editingProduct.imageFront && <img src={editingProduct.imageFront} alt="Preview" className="w-full h-32 object-cover border" />}
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">IMAGEM COSTAS (URL ou Upload)</label>
                      <input required type="text" value={editingProduct.imageBack} onChange={e => setEditingProduct({...editingProduct, imageBack: e.target.value})} className="w-full border p-2 text-sm mb-2" />
                      
                      <label className="cursor-pointer text-xs bg-gray-200 px-2 py-1 mb-2 inline-flex items-center gap-1 hover:bg-gray-300">
                        <Upload size={12}/> UPLOAD IMAGEM
                        <input type="file" className="hidden" accept="image/*" onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            const url = await uploadImage(e.target.files[0]);
                            if (url) setEditingProduct({...editingProduct, imageBack: url});
                          }
                        }} />
                      </label>
                      {editingProduct.imageBack && <img src={editingProduct.imageBack} alt="Preview" className="w-full h-32 object-cover border" />}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold mb-2">ESTOQUE POR TAMANHO</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['P', 'M', 'G', 'GG'] as Size[]).map(size => (
                        <div key={size}>
                          <label className="block text-[10px] text-center mb-1">{size}</label>
                          <input 
                            type="number" min="0" 
                            value={editingProduct.stock[size]} 
                            onChange={e => setEditingProduct({
                              ...editingProduct, 
                              stock: { ...editingProduct.stock, [size]: parseInt(e.target.value) || 0 }
                            })} 
                            className="w-full border p-2 text-center text-sm" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4 pt-4 border-t border-gray-200">
                  <button type="submit" className="px-8 py-3 bg-black text-white font-bold text-sm hover:bg-gray-800">SALVAR PRODUTO</button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-3 border border-gray-300 font-bold text-sm hover:bg-gray-50">CANCELAR</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
              {/* Product Table - unchanged, but wrapped in a check */}
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-4 w-16">ORDEM</th>
                    <th className="p-4 w-16">FOTO</th>
                    <th className="p-4">NOME</th>
                    <th className="p-4">PREÇO</th>
                    <th className="p-4">ESTOQUE</th>
                    <th className="p-4 text-center">STATUS</th>
                    <th className="p-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((p, index) => {
                    const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-center">
                            <button disabled={index === 0} onClick={() => handleMove(index, 'up')} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp size={16} /></button>
                            <span className="text-xs font-bold">{p.order}</span>
                            <button disabled={index === sortedProducts.length - 1} onClick={() => handleMove(index, 'down')} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown size={16} /></button>
                          </div>
                        </td>
                        <td className="p-4">
                          <img src={p.imageFront} alt={p.name} className="w-12 h-16 object-cover border border-gray-200" />
                        </td>
                        <td className="p-4">
                          <p className="font-bold uppercase">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold">R$ {p.priceCurrent.toFixed(2)}</p>
                          {p.priceOld && <p className="text-xs text-gray-400 line-through">R$ {p.priceOld.toFixed(2)}</p>}
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${totalStock === 0 ? 'text-red-500' : ''}`}>{totalStock} unid.</p>
                          <p className="text-[10px] text-gray-500 uppercase">
                            {Object.entries(p.stock).map(([s, q]) => `${s}:${q}`).join(' | ')}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleToggleVisible(p)} className={`flex flex-col items-center gap-1 mx-auto ${p.visible ? 'text-green-600' : 'text-gray-400'}`} title={p.visible ? 'Visível' : 'Oculto'}>
                            {p.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2 text-gray-500">
                            <button onClick={() => openForm(p)} className="p-2 hover:text-blue-600 bg-white border border-gray-200"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-600 bg-white border border-gray-200"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
