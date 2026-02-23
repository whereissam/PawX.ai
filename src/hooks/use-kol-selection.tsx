import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { KolUser } from "@/types"

const STORAGE_KEY = "pawx-selected-kols"

function loadFromStorage(): Map<string, KolUser> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const entries: [string, KolUser][] = JSON.parse(raw)
    return new Map(entries)
  } catch {
    return new Map()
  }
}

function saveToStorage(map: Map<string, KolUser>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.entries())))
  } catch {
    // Storage full or unavailable
  }
}

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
  const [selectedKolMap, setSelectedKolMap] = useState<Map<string, KolUser>>(loadFromStorage)

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

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(selectedKolMap)
  }, [selectedKolMap])

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
