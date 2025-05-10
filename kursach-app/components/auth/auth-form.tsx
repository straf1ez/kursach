"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { RegistrationSuccess } from "./registration-success"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AuthMode = "login" | "register" | "forgot-password" | "registration-success"

export function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState<string>("")

  // Switch to registration success screen with the registered email
  const handleRegistrationSuccess = (email: string) => {
    setEmail(email)
    setAuthMode("registration-success")
  }

  // If we're showing the registration success or forgot password screens,
  // render them directly instead of within tabs
  if (authMode === "registration-success") {
    return <RegistrationSuccess email={email} onBackToLogin={() => setAuthMode("login")} />
  }

  if (authMode === "forgot-password") {
    return <ForgotPasswordForm onBackToLogin={() => setAuthMode("login")} />
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-center mb-6">
        <img src="/simple-gray-globe.png" alt="Countryle Logo" className="w-16 h-16" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-6">Страны</h1>
      <h2 className="text-2xl font-bold mb-6 text-center">Вход в аккаунт</h2>

      <Tabs defaultValue="login" value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onForgotPassword={() => setAuthMode("forgot-password")} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm onSuccess={handleRegistrationSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
