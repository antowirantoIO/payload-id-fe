'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'
import { PasswordInput } from './password-input'
export function LoginForm() {
  const t = useTranslations('app')
  const router = useRouter()
  const client = useQueryClient()
  const login = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await signIn('credentials', { ...data, redirect: false })
      if (!result || result.error) throw new Error('LOGIN_FAILED')
    },
    onSuccess: () => {
      client.clear()
      router.replace('/dashboard')
      router.refresh()
    },
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    login.mutate({ email: String(data.get('email')), password: String(data.get('password')) })
  }
  return (
    <form onSubmit={submit} className="w-full min-w-0 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t('email')}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@example.com"
          className="h-10 rounded-md bg-background shadow-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {t('password')}
        </label>
        <PasswordInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="h-10 rounded-md bg-background pr-12 shadow-none"
        />
      </div>
      {login.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t('loginError')}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={login.isPending}
        className="min-h-11 w-full rounded-md shadow-none"
      >
        {login.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {t(login.isPending ? 'signingIn' : 'signIn')}
      </Button>
    </form>
  )
}
