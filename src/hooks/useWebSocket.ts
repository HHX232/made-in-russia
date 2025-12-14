import {useEffect, useRef} from 'react'
import {webSocketClient} from '@/lib/websocket-client'
import {getAccessToken} from '@/services/auth/auth.helper'

export const useWebSocket = () => {
  const isConnectedRef = useRef(false)

  useEffect(() => {
    const token = getAccessToken()

    if (!token) {
      console.log('[useWebSocket] No token available, skipping WebSocket connection')
      return
    }

    if (!isConnectedRef.current) {
      console.log('[useWebSocket] Connecting to WebSocket...')
      webSocketClient.connect(() => {
        console.log('[useWebSocket] WebSocket connection established')
        isConnectedRef.current = true
      })
    }

    return () => {
      if (isConnectedRef.current) {
        console.log('[useWebSocket] Disconnecting from WebSocket...')
        webSocketClient.disconnect()
        isConnectedRef.current = false
      }
    }
  }, [])

  return webSocketClient
}
