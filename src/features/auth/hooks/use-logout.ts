'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
export function useLogout() {
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async () => {
      client.clear()
      await signOut({ redirect: false })
      window.location.reload()
    },
  })
  return { logout: () => mutation.mutate(), isPending: mutation.isPending }
}
