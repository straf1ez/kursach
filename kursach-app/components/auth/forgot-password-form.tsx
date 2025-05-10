"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/utils/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Назад ко входу
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Сброс пароля</h1>

      {isSuccess ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold">Проверьте почту</h2>
          <p className="text-gray-600">
            Мы отправили ссылку для сброса пароля на <span className="font-medium">{email}</span>
          </p>
          <Button onClick={onBackToLogin} className="mt-4">
            Назад ко входу
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-gray-600 mb-4">
            Введите свою электронную почту, и мы отправим ссылку для сброса пароля.
          </p>

          <div className="space-y-2">
            <Label htmlFor="reset-email">Электронная почта</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить ссылку для сброса"}
          </Button>
        </form>
      )}
    </div>
  )
}
