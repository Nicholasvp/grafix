// src/app/itens/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import { useUser } from '../hooks/useUser'

export default function ItensPage() {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage('Usuário não autenticado')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('itens')
        .insert([
          {
            nome,
            preco: parseFloat(preco),
            usuario_id: user.id,
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setMessage('Item criado com sucesso!')
      setNome('')
      setPreco('')
      
      // Redirecionar para a lista de itens após 1.5 segundos
      setTimeout(() => {
        router.push('/itens/lista')
      }, 500)
    } catch (error: any) {
      setMessage(`Erro ao criar item: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Novo Item</h1>
              <Link
                href="/itens/lista"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Ver Lista
              </Link>
            </div>

            {message && (
              <div className={`mb-4 p-4 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Item
                </label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço
                </label>
                <input
                  type="number"
                  id="preco"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Item'}
              </button>
            </form>

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
      </div>
    </ProtectedRoute>
  )
}
