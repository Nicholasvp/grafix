// src/app/itens/lista/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/protectedSupabase'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Navbar from '../../components/Navbar'
import { useUser } from '../../hooks/useUser'
import { Edit, Trash2, X } from 'lucide-react'

interface Item {
  id: string
  nome: string
  preco: number
  created_at: string
}

export default function ListaItensPage() {
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editPreco, setEditPreco] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    async function carregarItens() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('itens')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setItens(data || [])
      } catch (err: any) {
        setError(`Erro ao carregar itens: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    carregarItens()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!user) return
    
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('itens')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (error) {
        throw error
      }

      setItens(itens.filter(item => item.id !== id))
    } catch (err: any) {
      alert(`Erro ao excluir item: ${err.message}`)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setEditNome(item.nome)
    setEditPreco(item.preco.toString())
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingItem) return

    const precoNumber = parseFloat(editPreco)
    if (isNaN(precoNumber) || precoNumber <= 0) {
      alert('Por favor, insira um preço válido')
      return
    }

    setEditLoading(true)

    try {
      const { error } = await supabase
        .from('itens')
        .update({
          nome: editNome,
          preco: precoNumber,
        })
        .eq('id', editingItem.id)
        .eq('usuario_id', user.id)

      if (error) {
        throw error
      }

      // Atualizar a lista local
      setItens(itens.map(item => 
        item.id === editingItem.id 
          ? { ...item, nome: editNome, preco: precoNumber }
          : item
      ))

      // Fechar o modal
      setEditingItem(null)
      setEditNome('')
      setEditPreco('')
    } catch (err: any) {
      alert(`Erro ao editar item: ${err.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditNome('')
    setEditPreco('')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Lista de Itens</h1>
              <Link
                href="/itens"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Novo Item
              </Link>
            </div>

            {itens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum item encontrado.</p>
                <Link
                  href="/itens"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Criar Primeiro Item
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itens.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {item.preco.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                              title="Editar item"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Modal de Edição */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Editar Item</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="edit-nome" className="block text-sm font-medium text-gray-900 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="edit-nome"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Digite o nome do item"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-preco" className="block text-sm font-medium text-gray-900 mb-2">
                      Preço *
                    </label>
                    <input
                      type="number"
                      id="edit-preco"
                      value={editPreco}
                      onChange={(e) => setEditPreco(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={editLoading || !editNome.trim() || !editPreco.trim()}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {editLoading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
