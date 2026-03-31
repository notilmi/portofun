'use client'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FormValue, useForm, Value } from '@/lib/form'
import { cn } from '@/lib/utils'
import { DoorOpenIcon } from 'lucide-react'
import { toast } from 'sonner'

type LoginFormValues = {
  email: FormValue<string>
  password: FormValue<string>
}

type LoginFormProps = {
  onSubmit: (values: Value<LoginFormValues>) => void
  className?: string
}

export function LoginForm({ className, onSubmit }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    email: {
      value: '',
      validate(value) {
        if (value.trim().length === 0) {
          return 'Email wajib diisi.'
        }
        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'Format email tidak valid.'
        }
      },
    },
    password: {
      value: '',
      validate(value) {
        if (value.trim().length === 0) {
          return 'Password wajib diisi.'
        }
      },
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Portofun</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Masuk menggunakan akun email anda.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={form.values.email.value}
            onChange={(e) => form.handleChange('email', e.target.value)}
            required
          />
          <FieldError>{form.values.email.error}</FieldError>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <p
              onClick={() =>
                toast.info('Coming Soon', {
                  description: 'This is still work in progress. Check #40',
                })
              }
              className="ml-auto text-sm underline-offset-4 hover:underline hover:cursor-pointer"
            >
              Forgot your password?
            </p>
          </div>
          <Input
            id="password"
            type="password"
            value={form.values.password.value}
            onChange={(e) => form.handleChange('password', e.target.value)}
            required
          />
          <FieldError>{form.values.password.error}</FieldError>
        </Field>
        <Field>
          <Button
            type="submit"
            onClick={() => {
              if (form.validate()) {
                onSubmit?.({ ...form.getValues() })
              }
            }}
          >
            <DoorOpenIcon />
            Login
          </Button>
        </Field>
      </FieldGroup>
    </div>
  )
}