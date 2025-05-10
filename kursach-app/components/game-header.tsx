"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { AuthButton } from "./auth/auth-button"

interface GameHeaderProps {
  difficulty: string
  attemptsRemaining: number
  totalAttempts: number
  onReset: () => void
}

export function GameHeader({ difficulty, attemptsRemaining, totalAttempts, onReset }: GameHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex justify-between items-center w-full mb-4">
        <h1 className="text-3xl font-bold">Countryle</h1>
        <div className="flex items-center space-x-2">
          <AuthButton />
          <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset game">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-sm font-medium">
          <span className="capitalize">{difficulty}</span> mode
        </div>
        <div className="text-sm font-medium">
          Attempts: <span className="font-bold">{attemptsRemaining}</span>/{totalAttempts}
        </div>
      </div>
    </div>
  )
}
