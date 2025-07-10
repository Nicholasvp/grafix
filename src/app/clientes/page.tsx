// src/app/clientes/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import { useUser } from '../hooks/useUser'

export default function ClientesPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
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
        .from('clientes')
        .insert([
          {
            nome,
            email: email || null,
            telefone: telefone || null,
            usuario_id: user.id,
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setMessage('Cliente criado com sucesso!')
      setNome('')
      setEmail('')
      setTelefone('')
      
      // Redirecionar para a lista de clientes após 1.5 segundos
      setTimeout(() => {
        router.push('/clientes/lista')
      }, 500)
    } catch (error: any) {
      setMessage(`Erro ao criar cliente: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Cliente</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-2">
                Nome *
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Digite o email do cliente"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Digite o telefone do cliente"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md ${message.includes('sucesso') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !nome.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Cliente'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setNome('')
                  setEmail('')
                  setTelefone('')
                  setMessage('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
