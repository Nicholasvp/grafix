// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import { useUser } from '../hooks/useUser'
import { 
  Users, 
  UserPlus, 
  Package, 
  Plus, 
  ShoppingCart, 
  List, 
  TrendingUp, 
  Calendar,
  Eye,
  PlusCircle
} from 'lucide-react'

export default function DashboardPage() {
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [faturamento, setFaturamento] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalItens, setTotalItens] = useState(0)
  const { user } = useUser()

  useEffect(() => {
    async function carregarDados() {
      if (!user) return

      // Carregar dados dos pedidos
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('total, data_pedido')
        .eq('usuario_id', user.id)
        .gte('data_pedido', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .neq('status', 'cancelado')

      if (!pedidosError && pedidosData) {
        setTotalPedidos(pedidosData.length)
        const total = pedidosData.reduce((acc: number, p: any) => acc + Number(p.total), 0)
        setFaturamento(total)
      }

      // Carregar total de clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id', { count: 'exact' })
        .eq('usuario_id', user.id)

      if (!clientesError && clientesData) {
        setTotalClientes(clientesData.length)
      }

      // Carregar total de itens
      const { data: itensData, error: itensError } = await supabase
        .from('itens')
        .select('id', { count: 'exact' })
        .eq('usuario_id', user.id)

      if (!itensError && itensData) {
        setTotalItens(itensData.length)
      }
    }

    carregarDados()
  }, [user])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Dashboard</h1>
          
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide">Pedidos/Mês</h2>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{totalPedidos}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide">Faturamento</h2>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">R$ {faturamento.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide">Clientes</h2>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{totalClientes}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide">Itens</h2>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{totalItens}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Seções organizadas em 3 colunas no desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Seção Clientes */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-5">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                Clientes
              </h2>
              <div className="space-y-3">
                <Link
                  href="/clientes"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <UserPlus className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Novo Cliente</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Cadastrar cliente</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/clientes/lista"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Listar Clientes</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Ver todos os clientes</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Seção Itens */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-5">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                Itens
              </h2>
              <div className="space-y-3">
                <Link
                  href="/itens"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-orange-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <PlusCircle className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Novo Item</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Cadastrar item</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/itens/lista"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-orange-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <List className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Listar Itens</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Ver todos os itens</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Seção Pedidos */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-5">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                Pedidos
              </h2>
              <div className="space-y-3">
                <Link
                  href="/pedidos"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-purple-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Novo Pedido</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Criar pedido</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/pedidos/lista"
                  className="block border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-purple-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900">Listar Pedidos</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Ver todos os pedidos</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}