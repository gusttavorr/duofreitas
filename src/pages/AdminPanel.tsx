import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Product, Size } from '../types';
import { Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Plus, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  
  const { products, setProducts, addProduct, updateProduct, deleteProduct, restoreCatalog } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && pass) setIsAuthenticated(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...products].sort((a, b) => a.order - b.order);
    if (direction === 'up' && index > 0) {
      const temp = newProducts[index].order;
      newProducts[index].order = newProducts[index - 1].order;
      newProducts[index - 1].order = temp;
    } else if (direction === 'down' && index < newProducts.length - 1) {
      const temp = newProducts[index].order;
      newProducts[index].order = newProducts[index + 1].order;
      newProducts[index + 1].order = temp;
    }
    setProducts([...newProducts].sort((a, b) => a.order - b.order));
  };

  const handleToggleVisible = (product: Product) => {
    updateProduct({ ...product, visible: !product.visible });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleRestore = () => {
    if (window.confirm('Isso apagará todas as suas edições e restaurará o catálogo original. Confirmar?')) {
      restoreCatalog();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-widest uppercase mb-2">DUOFREITAS</h1>
            <h2 className="text-sm font-bold text-gray-500">ACESSO ADMIN</h2>
          </div>
          
          <div className="bg-blue-50 text-blue-800 p-4 mb-6 text-sm flex gap-3 items-start border border-blue-200">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>Acesso livre para testes: entre com qualquer usuário e senha.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">USUÁRIO</label>
              <input type="text" required value={user} onChange={e => setUser(e.target.value)} className="w-full border border-gray-300 p-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">SENHA</label>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full border border-gray-300 p-3 outline-none focus:border-black" />
            </div>
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
          <p className="text-sm text-gray-500">Total: {products.length} produtos. Dados salvos localmente.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRestore} className="px-4 py-2 border border-gray-300 text-sm font-bold hover:bg-gray-50">
            RESTAURAR PADRÃO
          </button>
          <button onClick={() => openForm()} className="px-4 py-2 bg-black text-white text-sm font-bold flex items-center gap-2 hover:bg-gray-800">
            <Plus size={16} /> NOVO PRODUTO
          </button>
        </div>
      </div>

      {editingProduct ? (
        <div className="bg-white border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-6">{products.find(p => p.id === editingProduct.id) ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h2>
          <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
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
                  <label className="block text-xs font-bold mb-1">IMAGEM FRENTE (URL ou /imagens/)</label>
                  <input required type="text" value={editingProduct.imageFront} onChange={e => setEditingProduct({...editingProduct, imageFront: e.target.value})} className="w-full border p-2 text-sm mb-2" />
                  {editingProduct.imageFront && <img src={editingProduct.imageFront} alt="Preview" className="w-full h-32 object-cover border" />}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">IMAGEM COSTAS (URL ou /imagens/)</label>
                  <input required type="text" value={editingProduct.imageBack} onChange={e => setEditingProduct({...editingProduct, imageBack: e.target.value})} className="w-full border p-2 text-sm mb-2" />
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
    </div>
  );
}
