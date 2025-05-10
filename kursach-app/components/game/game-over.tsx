"use client"

import { Button } from "@/components/ui/button"
import { WorldMap } from "@/components/game/world-map"

interface GameOverProps {
  gameState: "won" | "lost"
  targetCountry: any
  attempts: number
  onPlayAgain: () => void
}

export function GameOver({ gameState, targetCountry, attempts, onPlayAgain }: GameOverProps) {
  // For the map, we'll only show the target country if the player won
  const mapGuesses = gameState === "won" ? [{ ...targetCountry, isCorrect: true }] : []

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center my-8">
      <h2 className="text-3xl font-bold mb-6">{gameState === "won" ? "Поздравляем!" : "Игра окончена"}</h2>

      <div className="flex items-center justify-center mb-6">
        <span className="text-2xl font-medium">{targetCountry.country}</span>
      </div>

      <p className="text-lg mb-8">
        {gameState === "won"
          ? `Вы угадали страну за ${attempts} ${attempts === 1 ? "попытку" : attempts < 5 ? "попытки" : "попыток"}!`
          : `Загаданная страна: ${targetCountry.country}. Попробуйте ещё раз!`}
      </p>

      {/* Add the world map to show the target country only if player won */}
      <div className="mb-8">
        <WorldMap guesses={mapGuesses} targetCountry={gameState === "won" ? targetCountry : null} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium">Континент</div>
          <div>{targetCountry.continent}</div>
        </div>

        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium">Население</div>
          <div>{formatNumber(targetCountry.population)}</div>
        </div>

        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium">ВВП</div>
          <div>${formatNumber(targetCountry.gdp)}</div>
        </div>

        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium">Средний возраст</div>
          <div>{targetCountry.median_age} лет</div>
        </div>
      </div>

      <Button onClick={onPlayAgain} className="w-full py-6">
        Играть ещё раз
      </Button>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B"
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
