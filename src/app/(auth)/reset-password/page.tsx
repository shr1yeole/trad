'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrainCircuit, Eye, EyeOff } from 'lucide-react'
import { confirmPasswordReset } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ResetPasswordForm() {
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const searchParams = useSearchParams()
  const oobCode = searchParams.get('oobCode') // Firebase uses oobCode

  if (!oobCode) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 w-full">
        <div className="p-4 text-sm rounded-md bg-red-500/10 border border-red-500/20 text-red-500 w-full">
          Missing or invalid reset token. Please request a new password reset link.
        </div>
        <Link href="/forgot-password" className={buttonVariants({ variant: 'default' })}>Go to Forgot Password</Link>
      </div>
    )
  }

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setPending(false)
      return
    }

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6 w-full">
      {success ? (
        <div className="space-y-4">
          <div className="p-4 text-sm rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-center">
            Your password has been successfully reset.
          </div>
          <Link href="/login" className={buttonVariants({ variant: 'default', className: 'w-full' })}>Go to login</Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                minLength={6} 
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                required 
                minLength={6} 
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(173,198,255,0.4)]">
          <BrainCircuit className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your new password below
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
