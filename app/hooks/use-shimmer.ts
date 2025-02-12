import { useState, useEffect } from 'react'

export function useShimmer(duration: number = 4000) {
  const [showShimmer, setShowShimmer] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShimmer(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  return showShimmer
}
