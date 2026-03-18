/**
 * SuppliesList - Lista de útiles escolares
 */

'use client';

import { useState } from 'react';

interface Supply {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  category: string;
}

export default function SuppliesList() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('Papelería');

  const categories = ['Papelería', 'Libros', 'Tecnología', 'Arte', 'Otros'];

  const addSupply = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupply: Supply = {
      id: Date.now().toString(),
      name,
      quantity: parseInt(quantity),
      checked: false,
      category,
    };
    setSupplies([...supplies, newSupply]);
    setName('');
    setQuantity('1');
  };

  const toggleSupply = (id: string) => {
    setSupplies(supplies.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const removeSupply = (id: string) => {
    setSupplies(supplies.filter(s => s.id !== id));
  };

  const groupedSupplies = supplies.reduce((acc, supply) => {
    if (!acc[supply.category]) acc[supply.category] = [];
    acc[supply.category].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  const progress = supplies.length > 0 
    ? (supplies.filter(s => s.checked).length / supplies.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={addSupply} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Útil escolar</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cuaderno profesional"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Útil
        </button>
      </form>

      {supplies.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Progreso</span>
              <span className="text-sm text-gray-600">{supplies.filter(s => s.checked).length} de {supplies.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedSupplies).map(([cat, items]) => (
              <div key={cat} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {cat === 'Papelería' && '📝'}
                    {cat === 'Libros' && '📚'}
                    {cat === 'Tecnología' && '💻'}
                    {cat === 'Arte' && '🎨'}
                    {cat === 'Otros' && '📦'}
                  </span>
                  {cat}
                </h4>
                <div className="space-y-2">
                  {items.map(supply => (
                    <div key={supply.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => toggleSupply(supply.id)}
                        className="flex-shrink-0"
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          supply.checked 
                            ? 'bg-current border-current' 
                            : 'border-gray-300 hover:border-current'
                        }`}
                        style={{ backgroundColor: supply.checked ? 'var(--color-primary)' : undefined, borderColor: supply.checked ? 'var(--color-primary)' : undefined }}
                        >
                          {supply.checked && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <div className="flex-1">
                        <span className={`font-medium ${supply.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {supply.name}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">x{supply.quantity}</span>
                      </div>
                      <button
                        onClick={() => removeSupply(supply.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {supplies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Agrega los útiles que necesitas para el ciclo escolar</p>
        </div>
      )}
    </div>
  );
}
