"use client"

import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-8">
      <h1 className="text-4xl font-bold">Добро пожаловать в</h1>
      <h2 className="text-5xl font-extrabold tracking-tight">Countryle</h2>

      <div className="w-48 h-48 relative my-8">
        <img src="/simple-gray-globe.png" alt="Глобус" className="w-full h-full" />
      </div>

      <p className="text-xl max-w-md">Игра, в которой каждый день новая страна — угадай её по подсказкам!</p>

      <div className="flex flex-col items-center mt-12 space-y-4 w-full max-w-xs">
        <Button onClick={onStart} className="w-full bg-green-500 hover:bg-green-600 text-white py-6">
          НАЧАТЬ
        </Button>
        <button onClick={onStart} className="text-gray-500 hover:text-gray-700">
          Пропустить
        </button>
      </div>

      <div className="flex space-x-2 mt-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-500" : "bg-gray-300"}`} />
        ))}
      </div>
    </div>
  )
}
