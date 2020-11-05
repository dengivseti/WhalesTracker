import { createContext } from 'react'

function noop() {}

interface IAuthContext {
  userId: string | null
  isAuthenticated: boolean

  logout(): void

  login(id: string): void
}

export const AuthContext = createContext<IAuthContext>({
  userId: null,
  isAuthenticated: false,
  logout: noop,
  login: noop,
})
