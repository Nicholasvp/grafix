// src/app/pedidos/lista/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import Navbar from '../../components/Navbar'
import { useUser } from '../../hooks/useUser'
import { Play, CheckCircle, XCircle, Trash2, Eye, EyeOff, LayoutGrid, List, Clock, ArrowRight, Check, X, RotateCcw } from 'lucide-react'

interface Pedido {
  id: string
  total: number
  status: string
  data_pedido: string
  created_at: string
  clientes: {
    nome: string
    email: string | null
    telefone: string | null
  }
  pedido_itens: {
    quantidade: number
    preco_unitario: number
    subtotal: number
    itens: {
      nome: string
    }
  }[]
}

export default function ListaPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [visualizacao, setVisualizacao] = useState<'lista' | 'kanban'>('kanban')
  const { user } = useUser()

  useEffect(() => {
    carregarPedidos()
  }, [user])

  const carregarPedidos = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nome, email, telefone),
          pedido_itens (
            quantidade,
            preco_unitario,
            subtotal,
            itens (nome)
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPedidos(data || [])
    } catch (err: any) {
      setError(`Erro ao carregar pedidos: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const alterarStatus = async (pedidoId: string, novoStatus: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedidoId)
        .eq('usuario_id', user.id)

      if (error) throw error

      // Atualizar o estado local
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, status: novoStatus }
          : pedido
      ))
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`)
    }
  }

  const voltarStatus = async (pedidoId: string) => {
    if (!user) return
    
    const pedido = pedidos.find(p => p.id === pedidoId)
    if (!pedido) return

    let statusAnterior = ''
    switch (pedido.status) {
      case 'em_andamento':
        statusAnterior = 'pendente'
        break
      case 'concluido':
        statusAnterior = 'em_andamento'
        break
      case 'cancelado':
        statusAnterior = 'pendente' // Cancelado volta para pendente
        break
      default:
        return // Não há status anterior para pendente
    }

    if (statusAnterior && confirm(`Tem certeza que deseja voltar este pedido para "${getStatusText(statusAnterior)}"?`)) {
      await alterarStatus(pedidoId, statusAnterior)
    }
  }

  const excluirPedido = async (pedidoId: string) => {
    if (!user) return
    
    if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      // Primeiro excluir os itens do pedido
      const { error: itensError } = await supabase
        .from('pedido_itens')
        .delete()
        .eq('pedido_id', pedidoId)

      if (itensError) throw itensError

      // Depois excluir o pedido (verificando se pertence ao usuário)
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)
        .eq('usuario_id', user.id)

      if (pedidoError) throw pedidoError

      setPedidos(pedidos.filter(pedido => pedido.id !== pedidoId))
    } catch (err: any) {
      alert(`Erro ao excluir pedido: ${err.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluido':
        return 'Concluído'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const filtrarPedidos = () => {
    if (filtroStatus === 'todos') {
      return pedidos
    }
    return pedidos.filter(pedido => pedido.status === filtroStatus)
  }

  const agruparPedidosPorStatus = () => {
    const grupos = {
      pendente: pedidos.filter(p => p.status === 'pendente'),
      em_andamento: pedidos.filter(p => p.status === 'em_andamento'),
      concluido: pedidos.filter(p => p.status === 'concluido'),
      cancelado: pedidos.filter(p => p.status === 'cancelado')
    }
    return grupos
  }

  const renderPedidoCard = (pedido: Pedido, isKanban = false) => (
    <div key={pedido.id} className={`border border-gray-200 rounded-lg p-4 ${
      isKanban 
        ? 'mb-3 bg-white shadow-sm hover:shadow-md transition-shadow' 
        : 'hover:shadow-lg transition-shadow'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-gray-900 ${isKanban ? 'text-sm' : 'text-lg'}`}>
              {isKanban ? `#${pedido.id.slice(-6)}` : `Pedido #${pedido.id.slice(-8)}`}
            </h3>
            {!isKanban && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                {getStatusText(pedido.status)}
              </span>
            )}
          </div>
          <p className={`text-gray-900 ${isKanban ? 'text-sm' : ''}`}>
            {isKanban ? pedido.clientes.nome : `Cliente: ${pedido.clientes.nome}`}
          </p>
          <p className={`text-gray-600 ${isKanban ? 'text-xs' : 'text-sm'}`}>
            {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-bold text-gray-900 ${isKanban ? 'text-sm' : 'text-2xl'}`}>
            R$ {pedido.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setExpandedPedido(expandedPedido === pedido.id ? null : pedido.id)}
            className={`text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ${
              isKanban ? 'text-xs' : 'text-sm'
            }`}
          >
            {expandedPedido === pedido.id ? <EyeOff size={isKanban ? 14 : 16} /> : <Eye size={isKanban ? 14 : 16} />}
            {isKanban ? '' : (expandedPedido === pedido.id ? 'Ocultar' : 'Detalhes')}
          </button>
        </div>
        
        <div className="flex gap-1">
          {/* Botão de voltar status */}
          {pedido.status !== 'pendente' && (
            <button
              onClick={() => voltarStatus(pedido.id)}
              className={`bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors group ${
                isKanban ? 'p-1.5' : 'p-2'
              }`}
              title="Voltar status"
            >
              <RotateCcw size={isKanban ? 14 : 16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          
          {pedido.status === 'pendente' && (
            <button
              onClick={() => alterarStatus(pedido.id, 'em_andamento')}
              className={`bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors group ${
                isKanban ? 'p-1.5' : 'p-2'
              }`}
              title="Iniciar pedido"
            >
              <Play size={isKanban ? 14 : 16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          {pedido.status === 'em_andamento' && (
            <button
              onClick={() => alterarStatus(pedido.id, 'concluido')}
              className={`bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors group ${
                isKanban ? 'p-1.5' : 'p-2'
              }`}
              title="Concluir pedido"
            >
              <CheckCircle size={isKanban ? 14 : 16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          {pedido.status !== 'cancelado' && (
            <button
              onClick={() => alterarStatus(pedido.id, 'cancelado')}
              className={`bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors group ${
                isKanban ? 'p-1.5' : 'p-2'
              }`}
              title="Cancelar pedido"
            >
              <XCircle size={isKanban ? 14 : 16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={() => excluirPedido(pedido.id)}
            className={`bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors group ${
              isKanban ? 'p-1.5' : 'p-2'
            }`}
            title="Excluir pedido"
          >
            <Trash2 size={isKanban ? 14 : 16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandedPedido === pedido.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className={`font-semibold text-gray-900 mb-3 ${isKanban ? 'text-sm' : ''}`}>
            Itens do Pedido:
          </h4>
          <div className="space-y-2">
            {pedido.pedido_itens.map((item, index) => (
              <div key={index} className={`flex justify-between items-center bg-gray-50 p-2 rounded ${
                isKanban ? 'text-xs' : 'p-3'
              }`}>
                <div>
                  <span className="font-medium text-gray-900">{item.itens.nome}</span>
                  <span className="text-gray-700 ml-2">
                    {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                  </span>
                </div>
                <span className="font-medium text-gray-900">R$ {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          {pedido.clientes.email && (
            <p className={`mt-3 text-gray-800 ${isKanban ? 'text-xs' : 'text-sm'}`}>
              Email: {pedido.clientes.email}
            </p>
          )}
          {pedido.clientes.telefone && (
            <p className={`text-gray-800 ${isKanban ? 'text-xs' : 'text-sm'}`}>
              Telefone: {pedido.clientes.telefone}
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lista de Pedidos</h1>
            <div className="flex gap-3">
              <Link
                href="/pedidos"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Novo Pedido
              </Link>
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="filtro-status" className="block text-sm font-medium text-gray-900 mb-2">
                Filtrar por Status:
              </label>
              <select
                id="filtro-status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setVisualizacao(visualizacao === 'lista' ? 'kanban' : 'lista')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  visualizacao === 'kanban'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {visualizacao === 'lista' ? (
                  <>
                    <LayoutGrid size={18} />
                    Kanban
                  </>
                ) : (
                  <>
                    <List size={18} />
                    Lista
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Nenhum pedido encontrado.</p>
              <Link
                href="/pedidos"
                className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Criar Primeiro Pedido
              </Link>
            </div>
          ) : (
            <>
              {/* Visualização em Lista */}
              {visualizacao === 'lista' && (
                <div className="space-y-4">
                  {filtrarPedidos().map((pedido) => renderPedidoCard(pedido, false))}
                </div>
              )}

              {/* Visualização Kanban */}
              {visualizacao === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Coluna Pendente */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={18} className="text-yellow-600" />
                      <h3 className="font-semibold text-gray-900">Pendente</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {agruparPedidosPorStatus().pendente.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {agruparPedidosPorStatus().pendente.map((pedido) => renderPedidoCard(pedido, true))}
                    </div>
                  </div>

                  {/* Coluna Em Andamento */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowRight size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Em Andamento</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {agruparPedidosPorStatus().em_andamento.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {agruparPedidosPorStatus().em_andamento.map((pedido) => renderPedidoCard(pedido, true))}
                    </div>
                  </div>

                  {/* Coluna Concluído */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Check size={18} className="text-green-600" />
                      <h3 className="font-semibold text-gray-900">Concluído</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {agruparPedidosPorStatus().concluido.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {agruparPedidosPorStatus().concluido.map((pedido) => renderPedidoCard(pedido, true))}
                    </div>
                  </div>

                  {/* Coluna Cancelado */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <X size={18} className="text-red-600" />
                      <h3 className="font-semibold text-gray-900">Cancelado</h3>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {agruparPedidosPorStatus().cancelado.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {agruparPedidosPorStatus().cancelado.map((pedido) => renderPedidoCard(pedido, true))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
