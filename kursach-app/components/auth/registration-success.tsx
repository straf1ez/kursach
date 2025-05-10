"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface RegistrationSuccessProps {
  email: string
  onBackToLogin: () => void
}

export function RegistrationSuccess({ email, onBackToLogin }: RegistrationSuccessProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold mb-4">Регистрация успешна!</h1>

      <p className="text-gray-600 mb-6">
        Мы отправили письмо подтверждения на <span className="font-medium">{email}</span>. Пожалуйста, проверьте свою почту и
        следуйте инструкциям для подтверждения аккаунта.
      </p>

      <div className="space-y-4">
        <Button onClick={onBackToLogin} className="w-full bg-green-500 hover:bg-green-600">
          Вернуться к входу
        </Button>
      </div>
    </div>
  )
}
