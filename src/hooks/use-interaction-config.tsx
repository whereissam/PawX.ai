import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { InteractionConfig } from "@/types"

const defaultConfig: InteractionConfig = {
  styleMode: "describe",
  stylePrompt: "",
  replyCondition: "all",
  conditionPrompt: "",
}

interface InteractionConfigContextValue {
  config: InteractionConfig
  updateConfig: (partial: Partial<InteractionConfig>) => void
  resetConfig: () => void
  isConfigured: boolean
}

const InteractionConfigContext = createContext<InteractionConfigContextValue | null>(null)

export function InteractionConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<InteractionConfig>(defaultConfig)

  const updateConfig = useCallback((partial: Partial<InteractionConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig)
  }, [])

  const isConfigured = config.stylePrompt.trim().length > 0 || !!config.presetStyle

  const value = useMemo(
    () => ({ config, updateConfig, resetConfig, isConfigured }),
    [config, updateConfig, resetConfig, isConfigured]
  )

  return (
    <InteractionConfigContext.Provider value={value}>
      {children}
    </InteractionConfigContext.Provider>
  )
}

export function useInteractionConfig() {
  const ctx = useContext(InteractionConfigContext)
  if (!ctx) {
    throw new Error("useInteractionConfig must be used within InteractionConfigProvider")
  }
  return ctx
}
