'use client'
import {persistor, store} from '@/store/store'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState, useEffect, ReactNode} from 'react'
import {Provider as ReduxProvider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'

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
      <Provider store={store}>
        {isClient ? (
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        ) : (
          children
        )}
      </Provider>
    </QueryClientProvider>
  )
}
