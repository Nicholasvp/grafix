'use client'

import { supabase as originalSupabase } from '../supabase'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

// Lista de operações que devem verificar o status do usuário
const PROTECTED_OPERATIONS = [
  'select',
  'insert', 
  'update',
  'upsert',
  'delete'
]

// Lista de tabelas que devem ser verificadas
const PROTECTED_TABLES = [
  'clientes',
  'itens', 
  'pedidos',
  'pedido_itens'
]

// Função para verificar se o usuário está ativo
async function checkUserActivity(): Promise<boolean> {
  try {
    const { data: { session } } = await originalSupabase.auth.getSession()
    
    if (!session?.user) {
      return false
    }

    const { data, error } = await originalSupabase
      .from('usuarios_config')
      .select('ativo')
      .eq('id', session.user.id)
      .single()

    if (error) {
      // Se o usuário não existe na tabela usuarios_config, consideramos como inativo
      if (error.code === 'PGRST116') {
        return false
      }
      throw error
    }

    return data.ativo
  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error)
    return false
  }
}

// Proxy para interceptar chamadas do supabase
const createProtectedSupabase = () => {
  return new Proxy(originalSupabase, {
    get(target, prop) {
      if (prop === 'from') {
        return (tableName: string) => {
          const originalFrom = target.from(tableName)
          
          // Se não é uma tabela protegida, retorna normalmente
          if (!PROTECTED_TABLES.includes(tableName)) {
            return originalFrom
          }

          // Criar proxy para as operações da tabela
          return new Proxy(originalFrom, {
            get(tableTarget, tableProp) {
              const originalMethod = (tableTarget as any)[tableProp]
              
              // Se não é uma operação protegida, retorna normalmente
              if (!PROTECTED_OPERATIONS.includes(tableProp as string)) {
                return originalMethod?.bind(tableTarget)
              }

              // Interceptar a operação para verificar o status do usuário
              return function(...args: any[]) {
                // Criar uma promise que verifica o usuário e depois executa a query
                const executeWithCheck = async () => {
                  const isActive = await checkUserActivity()
                  
                  if (!isActive) {
                    // Disparar evento customizado para mostrar o modal
                    const event = new CustomEvent('userInactive', { 
                      detail: { message: 'Usuário não está ativo' }
                    })
                    window.dispatchEvent(event)
                    
                    throw new Error('Usuário não está ativo. Contate o administrador do sistema.')
                  }

                  // Se o usuário está ativo, executa a operação normalmente
                  return originalMethod.apply(tableTarget, args)
                }

                // Retornar o query builder normal e interceptar apenas na execução
                const result = originalMethod.apply(tableTarget, args)
                
                // Se o resultado tem métodos de query builder, mantém o chaining
                if (result && typeof result === 'object') {
                  // Proxy para interceptar métodos de execução como then, finally, etc
                  return new Proxy(result, {
                    get(queryTarget, queryProp) {
                      const queryMethod = (queryTarget as any)[queryProp]
                      
                      // Interceptar métodos que executam a query
                      if (queryProp === 'then' || queryProp === 'finally' || queryProp === 'catch') {
                        return function(...queryArgs: any[]) {
                          // Executar a verificação antes da query
                          return executeWithCheck().then(() => {
                            return queryMethod.apply(queryTarget, queryArgs)
                          })
                        }
                      }
                      
                      // Para outros métodos (eq, gte, neq, etc), manter o chaining normal
                      return queryMethod?.bind(queryTarget)
                    }
                  })
                }
                
                return result
              }
            }
          })
        }
      }
      
      // Para outras propriedades, retorna normalmente
      return (target as any)[prop]
    }
  })
}

export const supabase = createProtectedSupabase()
