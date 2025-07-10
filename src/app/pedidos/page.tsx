// src/app/pedidos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import { useUser } from '../hooks/useUser'

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
}

interface Item {
  id: string
  nome: string
  preco: number
}

interface PedidoItem {
  item_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

export default function NovoPedidoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [itens, setItens] = useState<Item[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
  const [pedidoItens, setPedidoItens] = useState<PedidoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showItemForm, setShowItemForm] = useState(false)
  const { user } = useUser()
  const router = useRouter()
  
  // Estados para o formulário de novo item
  const [novoItemNome, setNovoItemNome] = useState('')
  const [novoItemPreco, setNovoItemPreco] = useState('')
  const [criandoItem, setCriandoItem] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [user])

  // Fechar lista de clientes quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.cliente-selector')) {
        setMostrarListaClientes(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const carregarDados = async () => {
    if (!user) return

    try {
      // Carregar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome')

      if (clientesError) throw clientesError
      setClientes(clientesData || [])

      // Carregar itens
      const { data: itensData, error: itensError } = await supabase
        .from('itens')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome')

      if (itensError) throw itensError
      setItens(itensData || [])
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setMessage(`Erro ao carregar dados: ${error.message}`)
    }
  }

  const criarNovoItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage('Usuário não autenticado')
      return
    }

    setCriandoItem(true)

    try {
      const { data, error } = await supabase
        .from('itens')
        .insert([
          {
            nome: novoItemNome,
            preco: parseFloat(novoItemPreco),
            usuario_id: user.id,
          }
        ])
        .select()

      if (error) throw error

      // Atualizar lista de itens
      await carregarDados()
      
      // Limpar formulário
      setNovoItemNome('')
      setNovoItemPreco('')
      setShowItemForm(false)
      setMessage('Item criado com sucesso!')
    } catch (error: any) {
      setMessage(`Erro ao criar item: ${error.message}`)
    } finally {
      setCriandoItem(false)
    }
  }

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase())
  )

  const selecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente.id)
    setBuscaCliente(cliente.nome)
    setMostrarListaClientes(false)
  }

  const limparSelecaoCliente = () => {
    setClienteSelecionado('')
    setBuscaCliente('')
    setMostrarListaClientes(false)
  }

  const adicionarItemAoPedido = (itemId: string) => {
    const item = itens.find(i => i.id === itemId)
    if (!item) return

    const itemExistente = pedidoItens.find(pi => pi.item_id === itemId)
    
    if (itemExistente) {
      // Aumentar quantidade
      setPedidoItens(pedidoItens.map(pi => 
        pi.item_id === itemId 
          ? { ...pi, quantidade: pi.quantidade + 1, subtotal: (pi.quantidade + 1) * pi.preco_unitario }
          : pi
      ))
    } else {
      // Adicionar novo item
      setPedidoItens([...pedidoItens, {
        item_id: itemId,
        nome: item.nome,
        preco_unitario: item.preco,
        quantidade: 1,
        subtotal: item.preco
      }])
    }
  }

  const removerItemDoPedido = (itemId: string) => {
    setPedidoItens(pedidoItens.filter(pi => pi.item_id !== itemId))
  }

  const alterarQuantidade = (itemId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItemDoPedido(itemId)
      return
    }

    setPedidoItens(pedidoItens.map(pi => 
      pi.item_id === itemId 
        ? { ...pi, quantidade: novaQuantidade, subtotal: novaQuantidade * pi.preco_unitario }
        : pi
    ))
  }

  const calcularTotal = () => {
    return pedidoItens.reduce((acc, item) => acc + item.subtotal, 0)
  }

  const criarPedido = async () => {
    if (!user) {
      setMessage('Usuário não autenticado')
      return
    }

    if (!clienteSelecionado) {
      setMessage('Selecione um cliente')
      return
    }

    if (pedidoItens.length === 0) {
      setMessage('Adicione pelo menos um item ao pedido')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const total = calcularTotal()

      // Criar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
          {
            cliente_id: clienteSelecionado,
            total: total,
            status: 'pendente',
            usuario_id: user.id,
          }
        ])
        .select()

      if (pedidoError) throw pedidoError

      const pedidoId = pedidoData[0].id

      // Criar itens do pedido
      const itensParaInserir = pedidoItens.map(item => ({
        pedido_id: pedidoId,
        item_id: item.item_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
        // subtotal será calculado automaticamente pelo banco
      }))

      const { error: itensError } = await supabase
        .from('pedido_itens')
        .insert(itensParaInserir)

      if (itensError) throw itensError

      setMessage('Pedido criado com sucesso!')
      
      // Limpar formulário
      setClienteSelecionado('')
      setBuscaCliente('')
      setPedidoItens([])
      
      // Redirecionar para a lista de pedidos após 1.5 segundos
      setTimeout(() => {
        router.push('/pedidos/lista')
      }, 500)
    } catch (error: any) {
      setMessage(`Erro ao criar pedido: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Pedido</h1>

          {/* Seleção do Cliente */}
          <div className="mb-6">
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-900 mb-2">
              Cliente *
            </label>
            <div className="relative cliente-selector">
              <input
                type="text"
                value={buscaCliente}
                onChange={(e) => {
                  setBuscaCliente(e.target.value)
                  setMostrarListaClientes(true)
                  if (e.target.value === '') {
                    setClienteSelecionado('')
                  }
                }}
                onFocus={() => setMostrarListaClientes(true)}
                placeholder="Digite o nome do cliente para buscar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              {clienteSelecionado && (
                <button
                  type="button"
                  onClick={limparSelecaoCliente}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
              
              {/* Lista de clientes filtrados */}
              {mostrarListaClientes && buscaCliente && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {clientesFiltrados.length > 0 ? (
                    <>
                      {clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => selecionarCliente(cliente)}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="font-medium text-gray-900">{cliente.nome}</div>
                          {cliente.telefone && (
                            <div className="text-sm text-gray-600">{cliente.telefone}</div>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-gray-200 p-2">
                        <button
                          onClick={() => router.push('/clientes')}
                          className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                        >
                          + Criar novo cliente
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-3 py-2">
                      <div className="text-gray-500 mb-2">Nenhum cliente encontrado</div>
                      <button
                        onClick={() => router.push('/clientes')}
                        className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                      >
                        + Criar novo cliente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Itens */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Itens do Pedido</h2>
              <button
                onClick={() => setShowItemForm(!showItemForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                {showItemForm ? 'Cancelar' : 'Criar Novo Item'}
              </button>
            </div>

            {/* Formulário para criar novo item */}
            {showItemForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Criar Novo Item</h3>
                <form onSubmit={criarNovoItem} className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={novoItemNome}
                      onChange={(e) => setNovoItemNome(e.target.value)}
                      placeholder="Nome do item"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      value={novoItemPreco}
                      onChange={(e) => setNovoItemPreco(e.target.value)}
                      placeholder="Preço"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={criandoItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                  >
                    {criandoItem ? 'Criando...' : 'Criar'}
                  </button>
                </form>
              </div>
            )}

            {/* Lista de itens disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {itens.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900">{item.nome}</h3>
                  <p className="text-gray-700">R$ {item.preco.toFixed(2)}</p>
                  <button
                    onClick={() => adicionarItemAoPedido(item.id)}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>

            {/* Itens no pedido */}
            {pedidoItens.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens no Pedido</h3>
                <div className="space-y-2">
                  {pedidoItens.map((item) => (
                    <div key={item.item_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.nome}</span>
                        <span className="text-gray-700 ml-2">R$ {item.preco_unitario.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alterarQuantidade(item.item_id, item.quantidade - 1)}
                          className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-gray-900">{item.quantidade}</span>
                        <button
                          onClick={() => alterarQuantidade(item.item_id, item.quantidade + 1)}
                          className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                        >
                          +
                        </button>
                        <span className="ml-4 font-medium text-gray-900">R$ {item.subtotal.toFixed(2)}</span>
                        <button
                          onClick={() => removerItemDoPedido(item.item_id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors ml-2"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-blue-600">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('sucesso') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-4">
            <button
              onClick={criarPedido}
              disabled={loading || !clienteSelecionado || pedidoItens.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando Pedido...' : 'Criar Pedido'}
            </button>
            
            <button
              onClick={() => {
                setClienteSelecionado('')
                setBuscaCliente('')
                setPedidoItens([])
                setMessage('')
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
