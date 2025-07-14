'use client'

import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { useUser } from './useUser'
import { useUserStatus } from './useUserStatus'
import InactiveUserModal from '../components/InactiveUserModal'

interface UserActivityContextType {
  checkUserActivity: () => Promise<boolean>
  isUserActive: boolean | null
  showInactiveModal: boolean
  setShowInactiveModal: (show: boolean) => void
}

const UserActivityContext = createContext<UserActivityContextType | null>(null)

export function UserActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const { isActive, loading, refetchUserStatus } = useUserStatus(user)
  const [showInactiveModal, setShowInactiveModal] = useState(false)
  const [lastCheck, setLastCheck] = useState<number>(0)

  // Cache da verificação por 5 minutos para não sobrecarregar o servidor
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  const checkUserActivity = useCallback(async (): Promise<boolean> => {
    const now = Date.now()
    
    // Se já verificamos recentemente, usar o cache
    if (now - lastCheck < CACHE_DURATION && isActive !== null) {
      if (isActive === false) {
        setShowInactiveModal(true)
      }
      return isActive
    }

    // Atualizar verificação
    await refetchUserStatus()
    setLastCheck(now)
    
    return isActive ?? false
  }, [isActive, lastCheck, refetchUserStatus])

  // Verificar automaticamente quando o status muda
  useEffect(() => {
    if (!loading && isActive === false) {
      setShowInactiveModal(true)
    }
  }, [isActive, loading])

  // Escutar evento customizado de usuário inativo
  useEffect(() => {
    const handleUserInactive = () => {
      setShowInactiveModal(true)
    }

    window.addEventListener('userInactive', handleUserInactive)
    
    return () => {
      window.removeEventListener('userInactive', handleUserInactive)
    }
  }, [])

  const contextValue: UserActivityContextType = {
    checkUserActivity,
    isUserActive: isActive,
    showInactiveModal,
    setShowInactiveModal
  }

  return (
    <UserActivityContext.Provider value={contextValue}>
      {children}
      <InactiveUserModal 
        isOpen={showInactiveModal} 
        onClose={() => setShowInactiveModal(false)} 
      />
    </UserActivityContext.Provider>
  )
}

export function useUserActivity() {
  const context = useContext(UserActivityContext)
  if (!context) {
    throw new Error('useUserActivity deve ser usado dentro de UserActivityProvider')
  }
  return context
}
