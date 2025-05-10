"use client"

import { Button } from "@/components/ui/button"

interface DifficultySelectorProps {
  currentDifficulty: "easy" | "medium" | "hard"
  onSelect: (difficulty: "easy" | "medium" | "hard") => void
}

export function DifficultySelector({ currentDifficulty, onSelect }: DifficultySelectorProps) {
  const difficultyLabel: Record<string, string> = {
    easy: "Лёгкая",
    medium: "Средняя",
    hard: "Сложная",
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center my-8">
      <h2 className="text-2xl font-bold mb-6">Выберите сложность</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button
          variant={currentDifficulty === "easy" ? "default" : "outline"}
          className="py-6 text-lg"
          onClick={() => onSelect("easy")}
        >
          {difficultyLabel["easy"]}
        </Button>

        <Button
          variant={currentDifficulty === "medium" ? "default" : "outline"}
          className="py-6 text-lg"
          onClick={() => onSelect("medium")}
        >
          {difficultyLabel["medium"]}
        </Button>

        <Button
          variant={currentDifficulty === "hard" ? "default" : "outline"}
          className="py-6 text-lg"
          onClick={() => onSelect("hard")}
        >
          {difficultyLabel["hard"]}
        </Button>
      </div>
    </div>
  )
}
