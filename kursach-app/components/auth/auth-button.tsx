"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/auth/client"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
      setIsLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogin = () => {
    router.push("/auth")
  }

  if (isLoading) {
    return null
  }

  return isLoggedIn ? null : (
    <Button variant="ghost" size="sm" onClick={handleLogin}>
      <LogIn className="h-4 w-4 mr-2" />
      Login
    </Button>
  )
}
