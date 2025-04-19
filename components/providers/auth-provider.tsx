"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface AuthContextType {
  user: any | null
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<any | null>("auth-user", null)
  const [token, setToken] = useLocalStorage<string | null>("auth-token", null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    setIsLoading(false)

    // Redirect if not authenticated and trying to access protected routes
    const publicRoutes = ["/login", "/register"]
    if (!token && !publicRoutes.includes(pathname || "")) {
      router.push("/login")
    }
  }, [token, pathname, router])

  const login = (newToken: string, newUser: any) => {
    setToken(newToken)
    setUser(newUser)
    router.push("/")
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
