'use client'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/client'
import { profileSchema } from '@/lib/api/contracts'
export const profileOptions = () =>
  queryOptions({
    queryKey: ['account', 'profile'],
    queryFn: async ({ signal }) => {
      const body = await apiGet<{ data: unknown }>('/api/iam/me', signal)
      return profileSchema.parse(body.data)
    },
  })
