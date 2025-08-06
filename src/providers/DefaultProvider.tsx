'use client'
import {store} from '@/store/store'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState, useEffect, ReactNode} from 'react'
import {Provider as ReduxProvider} from 'react-redux'

// Типизированная обертка для Redux Provider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Provider = ({children, ...props}: any) => {
  return <ReduxProvider {...props}>{children}</ReduxProvider>
}

export default function DefaultProvider({children}: {children: ReactNode}) {
  const [isClient, setIsClient] = useState(false)
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    })
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{isClient ? children : children}</Provider>
    </QueryClientProvider>
  )
}
