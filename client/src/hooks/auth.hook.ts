import { useState, useCallback, useEffect } from 'react'

const storangeName: string = 'Data'

export const useAuth = () => {
  const [userId, setUserId] = useState<string>('')
  const [ready, setReady] = useState<boolean>(false)

  const login = useCallback((id: string) => {
    setUserId(id)
    localStorage.setItem(storangeName, JSON.stringify({ userId: id }))
  }, [])

  const logout = useCallback(() => {
    setUserId('')
    localStorage.removeItem(storangeName)
  }, [])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(storangeName)!)
    if (data && data.userId) {
      login(data.userId)
    }
    setReady(true)
  }, [login])

  return { userId, ready, login, logout }
}
