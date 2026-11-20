import { LogIn } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/features/auth/client'
import { AuthCard, AuthLayout } from '@/features/auth/server'
export default async function LoginPage() {
  const t = await getTranslations('auth.login')
  return (
    <AuthLayout>
      <AuthCard title={t('heading')} description={t('description')} icon={LogIn}>
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  )
}
