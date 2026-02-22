import { useCallback, useEffect, useRef, useState } from "react"
import { WS_URL } from "@/lib/api"

export type WsStatus = "disconnected" | "connecting" | "connected" | "error"

export interface WsMessage {
  id: string
  type: string
  data: unknown
  receivedAt: string
}

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = false,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const [status, setStatus] = useState<WsStatus>("disconnected")
  const [messages, setMessages] = useState<WsMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus("connecting")
    setError(null)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus("connected")
      reconnectCountRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const msg: WsMessage = {
          id: crypto.randomUUID(),
          type: parsed.type ?? "tweet",
          data: parsed,
          receivedAt: new Date().toISOString(),
        }
        setMessages((prev) => [msg, ...prev])
      } catch {
        // Non-JSON message — wrap as raw
        const msg: WsMessage = {
          id: crypto.randomUUID(),
          type: "raw",
          data: event.data,
          receivedAt: new Date().toISOString(),
        }
        setMessages((prev) => [msg, ...prev])
      }
    }

    ws.onerror = () => {
      setError("WebSocket connection error")
      setStatus("error")
    }

    ws.onclose = () => {
      setStatus("disconnected")
      wsRef.current = null

      // Auto-reconnect
      if (reconnectCountRef.current < maxReconnectAttempts) {
        reconnectCountRef.current += 1
        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }
  }, [reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    reconnectCountRef.current = maxReconnectAttempts // prevent reconnect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("disconnected")
  }, [maxReconnectAttempts])

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [autoConnect, connect])

  return {
    status,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  }
}
