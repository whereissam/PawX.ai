import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { KolUser } from "@/types"

interface KolSelectionContextValue {
  selectedKolIds: Set<string>
  selectedKols: KolUser[]
  toggleKolSelection: (kol: KolUser) => void
  removeKol: (id: string) => void
  clearSelection: () => void
  isSelected: (kolId: string) => boolean
}

const KolSelectionContext = createContext<KolSelectionContextValue | null>(null)

export function KolSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedKolMap, setSelectedKolMap] = useState<Map<string, KolUser>>(new Map())

  const toggleKolSelection = useCallback((kol: KolUser) => {
    setSelectedKolMap((prev) => {
      const next = new Map(prev)
      if (next.has(kol.id)) {
        next.delete(kol.id)
      } else {
        next.set(kol.id, kol)
      }
      return next
    })
  }, [])

  const removeKol = useCallback((id: string) => {
    setSelectedKolMap((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKolMap(new Map())
  }, [])

  const selectedKolIds = useMemo(
    () => new Set(selectedKolMap.keys()),
    [selectedKolMap]
  )

  const selectedKols = useMemo(
    () => Array.from(selectedKolMap.values()),
    [selectedKolMap]
  )

  const isSelected = useCallback(
    (kolId: string) => selectedKolMap.has(kolId),
    [selectedKolMap]
  )

  const value = useMemo(
    () => ({
      selectedKolIds,
      selectedKols,
      toggleKolSelection,
      removeKol,
      clearSelection,
      isSelected,
    }),
    [selectedKolIds, selectedKols, toggleKolSelection, removeKol, clearSelection, isSelected]
  )

  return (
    <KolSelectionContext.Provider value={value}>
      {children}
    </KolSelectionContext.Provider>
  )
}

export function useKolSelection() {
  const ctx = useContext(KolSelectionContext)
  if (!ctx) {
    throw new Error("useKolSelection must be used within KolSelectionProvider")
  }
  return ctx
}
