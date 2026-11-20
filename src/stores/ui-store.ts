'use client'
import { create } from 'zustand'

type UIState = {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  sidebar: { isOpen: boolean }
  toggleSidebar: () => void
}
export const useUIStore = create<UIState>((set) => ({
  sidebar: { isOpen: true },
  toggleSidebar: () => set((state) => ({ sidebar: { isOpen: !state.sidebar.isOpen } })),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))
