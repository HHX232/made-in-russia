/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {persistor, store} from '@/store/store'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState, ReactNode} from 'react'
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'

export default function DefaultProvider({children}: {children: ReactNode}) {
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={<></>} persistor={persistor}>
          {children as any}
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  )
}
