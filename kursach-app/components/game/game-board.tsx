import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpLeft,
  Check,
  X,
} from "lucide-react"
import { WorldMap } from "@/components/game/world-map"

interface GameBoardProps {
  guesses: any[]
  targetCountry: any
  maxAttempts: number
  difficulty: "easy" | "medium" | "hard"
}

export function GameBoard({ guesses, targetCountry, maxAttempts, difficulty }: GameBoardProps) {
  // Create empty slots for remaining attempts
  const emptySlots = Math.max(0, maxAttempts - guesses.length)
  const emptyGuesses = Array(emptySlots).fill(null)
  const allGuesses = [...guesses, ...emptyGuesses]

  return (
    <div className="space-y-4">
      {/* Add the world map component */}
      <WorldMap guesses={guesses} targetCountry={targetCountry} />

      {allGuesses.map((guess, index) => (
        <div key={index} className={`bg-white rounded-lg shadow p-4 ${!guess ? "opacity-50" : ""}`}>
          {guess ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center w-full">
                <div className="font-medium text-3xl text-center w-full">{guess.country}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <HintItem label="Continent" value={guess.continent} match={guess.continentMatch} />

                <HintItem
                  label="Hemisphere"
                  value={`${guess.latitude > 0 ? "North" : "South"}, ${guess.longitude > 0 ? "East" : "West"}`}
                  match={`${guess.hemisphereMatch.northSouth === "match" ? "correct" : "incorrect"}, ${guess.hemisphereMatch.eastWest === "match" ? "correct" : "incorrect"}`}
                />

                <HintItem
                  label="Population"
                  value={formatNumber(guess.population)}
                  match={guess.populationHint}
                  showArrow={true}
                />

                <HintItem label="GDP" value={`${formatNumber(guess.gdp)}`} match={guess.gdpHint} showArrow={true} />

                <HintItem label="Avg. Age" value={`${guess.median_age} years`} match={guess.ageHint} showArrow={true} />

                {difficulty === "easy" && (
                <HintItem
                  label="Distance"
                  value={`${formatNumber(guess.distanceKm)} km`}
                  direction={guess.directionHint}
                />
                )}
              </div>
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-gray-400">Empty slot</div>
          )}
        </div>
      ))}
    </div>
  )
}

interface HintItemProps {
  label: string
  value: string
  match?: string
  showArrow?: boolean
  direction?: string
}

function HintItem({ label, value, match, showArrow, direction }: HintItemProps) {
  let bgColor = "bg-gray-100"
  let icon = null

  // Специальная подсветка для континента
  if (label === "Continent" && typeof match === "boolean" && match === true) {
    bgColor = "bg-green-200 text-green-900 border border-green-400"
    icon = <Check className="h-4 w-4 text-green-600" />
  } else if (label === "Continent" && typeof match === "boolean" && match === false) {
    bgColor = "bg-red-100 text-red-800 border border-red-300"
    icon = <X className="h-4 w-4 text-red-500" />
  } else if (label === "Hemisphere" && typeof match === "string") {
    if (match === "correct, correct") {
      bgColor = "bg-green-200 text-green-900 border border-green-400"
      icon = <Check className="h-4 w-4 text-green-600" />
    } else if (match === "correct, incorrect" || match === "incorrect, correct") {
      bgColor = "bg-yellow-100 text-yellow-900 border border-yellow-400"
      icon = <Check className="h-4 w-4 text-yellow-600" />
    } else if (match === "incorrect, incorrect") {
      bgColor = "bg-red-100 text-red-800 border border-red-300"
      icon = <X className="h-4 w-4 text-red-500" />
    }
  } else if (match === "match" || match === "correct") {
    bgColor = "bg-green-100 text-green-800"
    icon = <Check className="h-4 w-4 text-green-500" />
  } else if (match === "higher") {
    bgColor = "bg-yellow-100 text-yellow-800"
    icon = showArrow ? <ArrowDown className="h-4 w-4 text-yellow-500" /> : null
  } else if (match === "lower") {
    bgColor = "bg-yellow-100 text-yellow-800"
    icon = showArrow ? <ArrowUp className="h-4 w-4 text-yellow-500" /> : null
  } else if (match === "incorrect") {
    bgColor = "bg-red-100 text-red-800"
    icon = <X className="h-4 w-4 text-red-500" />
  }

  // Direction arrow for distance
  if (direction) {
    switch (direction) {
      case "N":
        icon = <ArrowUp className="h-4 w-4" />
        break
      case "S":
        icon = <ArrowDown className="h-4 w-4" />
        break
      case "E":
        icon = <ArrowRight className="h-4 w-4" />
        break
      case "W":
        icon = <ArrowLeft className="h-4 w-4" />
        break
      case "NE":
        icon = <ArrowUpRight className="h-4 w-4" />
        break
      case "NW":
        icon = <ArrowUpLeft className="h-4 w-4" />
        break
      case "SE":
        icon = <ArrowDownRight className="h-4 w-4" />
        break
      case "SW":
        icon = <ArrowDownLeft className="h-4 w-4" />
        break
    }
  }

  return (
    <div className={`p-2 rounded ${bgColor}`}>
      <div className="text-xs font-medium opacity-70">{label}</div>
      <div className="flex justify-between items-center">
        <div className="font-medium">{value}</div>
        {icon}
      </div>
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
