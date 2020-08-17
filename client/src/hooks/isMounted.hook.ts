import { useEffect, useRef } from "react"

export const useIsMounted = () => {
    const isMounted = useRef(false)
    useEffect((): any => {
        isMounted.current = true;
        return () => (isMounted.current = false)
    }, [])
    return isMounted
}