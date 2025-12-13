'use client'

import {useWebSocket} from '@/hooks/useWebSocket'

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  useWebSocket()
  return <>{children}</>
}
