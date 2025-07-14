'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

interface UserConfig {
  id: string
  ativo: boolean
  criado_em: string
  email: string
}

export function useUserStatus(user: User | null) {
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkUserStatus = useCallback(async () => {
    if (!user) {
      setIsActive(null)
      setUserConfig(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('usuarios_config')
        .select('*')
        .eq('id', user.id)
        .single()

      if (queryError) {
        // Se o usuário não existe na tabela usuarios_config, consideramos como inativo
        if (queryError.code === 'PGRST116') {
          setIsActive(false)
          setUserConfig(null)
        } else {
          throw queryError
        }
      } else {
        setUserConfig(data)
        setIsActive(data.ativo)
      }
    } catch (err) {
      console.error('Erro ao verificar status do usuário:', err)
      setError('Erro ao verificar status do usuário')
      setIsActive(false)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    checkUserStatus()
  }, [checkUserStatus])

  return {
    userConfig,
    isActive,
    loading,
    error,
    refetchUserStatus: checkUserStatus
  }
}
