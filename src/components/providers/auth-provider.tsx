"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  image?: string | null
}

interface Session {
  user: User
}

interface AuthContextType {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/get-session")
        if (res.ok) {
          const data = await res.json()
          setSession(data)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
