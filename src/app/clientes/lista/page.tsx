// src/app/clientes/lista/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Navbar from '../../components/Navbar'
import { useUser } from '../../hooks/useUser'
import { Edit, Trash2, X } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  created_at: string
}

export default function ListaClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelefone, setEditTelefone] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    async function carregarClientes() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setClientes(data || [])
      } catch (err: any) {
        setError(`Erro ao carregar clientes: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    carregarClientes()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!user) return
    
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (error) {
        throw error
      }

      setClientes(clientes.filter(cliente => cliente.id !== id))
    } catch (err: any) {
      alert(`Erro ao excluir cliente: ${err.message}`)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setEditNome(cliente.nome)
    setEditEmail(cliente.email || '')
    setEditTelefone(cliente.telefone || '')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingCliente) return

    setEditLoading(true)

    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: editNome,
          email: editEmail || null,
          telefone: editTelefone || null,
        })
        .eq('id', editingCliente.id)
        .eq('usuario_id', user.id)

      if (error) {
        throw error
      }

      // Atualizar a lista local
      setClientes(clientes.map(cliente => 
        cliente.id === editingCliente.id 
          ? { ...cliente, nome: editNome, email: editEmail || null, telefone: editTelefone || null }
          : cliente
      ))

      // Fechar o modal
      setEditingCliente(null)
      setEditNome('')
      setEditEmail('')
      setEditTelefone('')
    } catch (err: any) {
      alert(`Erro ao editar cliente: ${err.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCliente(null)
    setEditNome('')
    setEditEmail('')
    setEditTelefone('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lista de Clientes</h1>
            <Link
              href="/clientes"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Novo Cliente
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Nenhum cliente encontrado.</p>
              <Link
                href="/clientes"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Cliente
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
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
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {cliente.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {cliente.telefone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar cliente"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir cliente"
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
        </div>
          </div>
        </div>

        {/* Modal de Edição */}
        {editingCliente && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
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
                      placeholder="Digite o nome do cliente"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Digite o email do cliente"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-telefone" className="block text-sm font-medium text-gray-900 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="edit-telefone"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Digite o telefone do cliente"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={editLoading || !editNome.trim()}
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
