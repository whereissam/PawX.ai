import { useCallback, useEffect, useRef, useState } from "react"
import { WS_URL } from "@/lib/api"

export type WsStatus = "disconnected" | "connecting" | "connected" | "error"

export interface WsSubscribedUser {
  id: string
  name: string
  screenName: string
}

export interface WsMessage {
  id: string
  tweetId: string | null
  type: string
  data: unknown
  receivedAt: string
}

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onOpen?: (send: (data: unknown) => void) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = false,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  // System message types that should not appear in the feed
  const SYSTEM_TYPES = new Set(["connected", "subscribed", "unsubscribed", "error", "ping", "pong"])

  const [status, setStatus] = useState<WsStatus>("disconnected")
  const [messages, setMessages] = useState<WsMessage[]>([])
  const [subscribedUsers, setSubscribedUsers] = useState<WsSubscribedUser[]>([])
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [subscriptionLimit, setSubscriptionLimit] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
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
      onOpenRef.current?.(sendMessage)
    }

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const msgType = parsed.type ?? "tweet"

        console.log("[WS]", msgType, parsed)

        // Handle system messages — extract subscribedUsers
        if (SYSTEM_TYPES.has(msgType)) {
          if (msgType === "connected") {
            setStatus("connected")
          }

          // Update subscribed users from connected/subscribed/unsubscribed messages
          const users = parsed.subscribedUsers as WsSubscribedUser[] | undefined
          if (users) {
            setSubscribedUsers(users)
          }
          if (parsed.subscriptions != null) {
            setSubscriptionCount(parsed.subscriptions)
          }
          if (parsed.subscriptionsLimit != null) {
            setSubscriptionLimit(parsed.subscriptionsLimit)
          }
          return
        }

        // Extract tweet id for deduplication
        const inner = parsed?.data as Record<string, any> | undefined
        const tweetId = (inner?.status?.id_str ?? null) as string | null

        const msg: WsMessage = {
          id: crypto.randomUUID(),
          tweetId,
          type: msgType,
          data: parsed,
          receivedAt: new Date().toISOString(),
        }

        setMessages((prev) => {
          // If user-full-tweet arrives, replace matching user-update with same tweetId
          if (msgType === "user-full-tweet" && tweetId) {
            const filtered = prev.filter(
              (m) => !(m.type === "user-update" && m.tweetId === tweetId)
            )
            return [msg, ...filtered]
          }
          // If user-update arrives but we already have user-full-tweet for it, skip
          if (msgType === "user-update" && tweetId) {
            if (prev.some((m) => m.type === "user-full-tweet" && m.tweetId === tweetId)) {
              return prev
            }
          }
          return [msg, ...prev]
        })
      } catch {
        // Non-JSON — ignore system pings
      }
    }

    ws.onerror = () => {
      setError("WebSocket connection error")
      setStatus("error")
    }

    ws.onclose = () => {
      setStatus("disconnected")
      wsRef.current = null

      if (reconnectCountRef.current < maxReconnectAttempts) {
        reconnectCountRef.current += 1
        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }
  }, [reconnectInterval, maxReconnectAttempts, sendMessage])

  const disconnect = useCallback(() => {
    reconnectCountRef.current = maxReconnectAttempts
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("disconnected")
  }, [maxReconnectAttempts])

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
    subscribedUsers,
    subscriptionCount,
    subscriptionLimit,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  }
}
