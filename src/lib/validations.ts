import { z } from 'zod'

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim(),
  email: z.email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
})

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
})

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional(),
})

export const SettingsUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  broker: z.string().optional(),
  preferredRiskPct: z.number().min(0).max(100).optional(),
  language: z.string().optional(),
})

export type FormState =
  | {
      errors?: Record<string, string[]>
      message?: string
      success?: boolean
    }
  | undefined
