import {useState, useCallback, useContext} from 'react'
import {AuthContext} from "../context/AuthContext"

interface IRequestProps {
    url: string,
    method?: "GET" | "POST" | "DELETE"
    body?: string | null
    headers?: object
    qs?: object
}

const  getQueryString = (params: any) => {
    var esc = encodeURIComponent;
    return Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
}

export const useHttp = () => {
    const {logout} = useContext(AuthContext)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const request = useCallback(async (
        url: string,
        method: "GET" | "POST" | "DELETE"= "GET",
        body: any = null,
        headers: any = {},
        qs: any = null,
    ): Promise<any> => {
        setLoading(true)
        try {
            if (body) {
                body = JSON.stringify(body)
                headers['Content-Type'] = 'application/json'
            }
            if (qs) {
                url = url + '?' + getQueryString(qs)
            }
            const response = await fetch(url, {method, body, headers})
            const data = await response.json()
            if (!response.ok) {
                if (response.status === 401) {
                    logout()
                }
                throw new Error(data.message || 'Something went wrong')
            }
            setLoading(false)
            return data
        } catch (e) {
            setLoading(false)
            setError(e.message)
            throw e
        }
    }, [logout])

    const clearError = (): void => setError(null)

    return {loading, request, error, clearError}
}