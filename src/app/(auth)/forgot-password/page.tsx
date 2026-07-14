'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, ArrowLeft } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // For security, it's often better to pretend it succeeded even if user not found,
        // but we'll show an error if you prefer.
        setError('No account found with this email.')
      } else {
        setError(err.message || 'Failed to send reset email.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(173,198,255,0.4)]">
          <BrainCircuit className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 text-sm rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-center">
            If an account exists for that email, we have sent a password reset link.
          </div>
          <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>Return to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>

          {error && (
            <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Sending link...' : 'Send reset link'}
          </Button>
        </form>
      )}

      <div className="flex justify-center">
        <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
