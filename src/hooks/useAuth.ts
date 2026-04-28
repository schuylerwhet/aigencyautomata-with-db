import { useEffect, useState } from 'react'
import { blink } from '../lib/blink'
import { BlinkUser } from '@blinkdotnew/sdk'

export function useAuth() {
  const [user, setUser] = useState<BlinkUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Safety timeout: if Blink auth doesn't resolve in 3s, unblock the app
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      clearTimeout(timeout)
      setUser(state.user)
      setIsLoading(state.isLoading)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: () => blink.auth.login(),
    logout: () => blink.auth.logout(),
  }
}
