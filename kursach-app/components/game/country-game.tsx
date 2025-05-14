"use client"

import { useState, useEffect, useRef } from "react"
import { CountrySearch } from "@/components/game/country-search"
import { GameHeader } from "@/components/game/game-header"
import { GameBoard } from "@/components/game/game-board"
import { DifficultySelector } from "@/components/game/difficulty-selector"
import { GameOver } from "@/components/game/game-over"
import { WelcomeScreen } from "@/components/game/welcome-screen"
import { getCountriesData, Country } from "@/data/game/countries"
import { supabase } from "@/utils/auth/client"

type Difficulty = "easy" | "medium" | "hard"
type GameState = "welcome" | "playing" | "won" | "lost"

export function CountryGame() {
  const [gameState, setGameState] = useState<GameState>("welcome")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [targetCountry, setTargetCountry] = useState<any>(null)
  const [guesses, setGuesses] = useState<any[]>([])
  const [maxAttempts, setMaxAttempts] = useState(7)
  const [showDifficultySelector, setShowDifficultySelector] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLoading(true)
    getCountriesData(difficulty).then((data) => {
      setCountries(data)
      setLoading(false)
    })
  }, [difficulty])

  useEffect(() => {
    switch (difficulty) {
      case "easy":
        setMaxAttempts(10)
        break
      case "medium":
        setMaxAttempts(7)
        break
      case "hard":
        setMaxAttempts(5)
        break
    }
  }, [difficulty])

  // const startGame = () => {
  //   if (!countries.length) return
  //   const randomIndex = Math.floor(Math.random() * countries.length)
  //   setTargetCountry(countries[randomIndex])
  //   setStartTime(Date.now())
  //   setGuesses([])
  //   setGameState("playing")
  // }

  const handleGuess = (country: any) => {
    if (guesses.some((guess) => guess.country === country.country)) {
      return
    }

    const enrichedGuess = {
      ...country,
      isCorrect: country.country === targetCountry.country,
      hemisphereMatch: getHemisphereMatch(country, targetCountry),
      continentMatch: country.continent === targetCountry.continent,
      populationHint: getComparisonHint(country.population, targetCountry.population),
      gdpHint: getComparisonHint(country.gdp, targetCountry.gdp),
      ageHint: getComparisonHint(country.median_age, targetCountry.median_age),
      distanceKm: calculateDistance(
        country.latitude,
        country.longitude,
        targetCountry.latitude,
        targetCountry.longitude,
      ),
      directionHint: getDirectionHint(
        country.latitude,
        country.longitude,
        targetCountry.latitude,
        targetCountry.longitude,
      ),
    }

    const newGuesses = [enrichedGuess, ...guesses]
    setGuesses(newGuesses)

    if (country.country === targetCountry.country) {
      setGameState("won")
    } else if (newGuesses.length >= maxAttempts) {
      setGameState("lost")
    }
  }

  const resetGame = () => {
    setShowDifficultySelector(true)
  }

  const startNewGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty)
    setShowDifficultySelector(false)
    setLoading(true)
    getCountriesData(selectedDifficulty).then((data) => {
      setCountries(data)
      setLoading(false)
      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        setTargetCountry(data[randomIndex])
        setStartTime(Date.now())
        setGuesses([])
        setGameState("playing")
      } else {
        setTargetCountry(null)
      }
    })
  }

  const startInitialGame = () => {
    setShowDifficultySelector(true)
    setGuesses([])
    setTargetCountry(null)
  }

  useEffect(() => {
    const saveGame = async () => {
      if ((gameState === "won" || gameState === "lost") && targetCountry) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from("games").insert({
          user_id: user.id,
          difficulty,
          result: gameState,
          target_country: targetCountry.country,
          attempts: guesses.length,
          guesses,
          started_at: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
          finished_at: new Date().toISOString(),
        })

        const { data: userAchievementsRaw } = await supabase
          .from("user_achievements")
          .select("achievement_code")
          .eq("user_id", user.id)
        const userAchievements = userAchievementsRaw?.map(a => a.achievement_code) ?? []
        const newUnlocked: string[] = []

        if (gameState === "won" && !userAchievements.includes("first_win")) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_code: "first_win",
          })
          newUnlocked.push("first_win")
        }
        const { data: lastGames } = await supabase
          .from("games")
          .select("result")
          .eq("user_id", user.id)
          .order("finished_at", { ascending: false })
          .limit(5)
        if (
          lastGames &&
          lastGames.length === 5 &&
          lastGames.every(g => g.result === "won") &&
          !userAchievements.includes("streak_master")
        ) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_code: "streak_master",
          })
          newUnlocked.push("streak_master")
        }
        if (
          gameState === "won" &&
          startTime &&
          !userAchievements.includes("speed_demon")
        ) {
          const finishedAt = Date.now()
          const durationSeconds = Math.round((finishedAt - startTime) / 1000)
          if (durationSeconds < 120) {
            await supabase.from("user_achievements").insert({
              user_id: user.id,
              achievement_code: "speed_demon",
            })
            newUnlocked.push("speed_demon")
          }
        }
        if (
          gameState === "won" &&
          guesses.length <= 3 &&
          !userAchievements.includes("sharpshooter")
        ) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_code: "sharpshooter",
          })
          newUnlocked.push("sharpshooter")
        }
        const { count: gamesCount } = await supabase
          .from("games")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
        if (
          gamesCount &&
          gamesCount >= 20 &&
          !userAchievements.includes("globe_trotter")
        ) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_code: "globe_trotter",
          })
          newUnlocked.push("globe_trotter")
        }

        if (newUnlocked.length > 0) {
          setUnlockedAchievements(newUnlocked)
          const audio = new Audio("/Voicy_Que Miras Bobo.mp3")
          audio.play().catch(() => {})
          if (toastTimeout.current) clearTimeout(toastTimeout.current)
          toastTimeout.current = setTimeout(() => setUnlockedAchievements([]), 5000)
        }
      }
    }
    saveGame()
    // eslint-disable-next-line
  }, [gameState])

  if (loading) return <div>Загрузка стран...</div>

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Toast для новых ачивок */}
      {unlockedAchievements.length > 0 && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg flex flex-col items-center space-y-2 animate-fade-in">
          <div className="flex items-center space-x-4 mb-2">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-lg">Достижение разблокировано!</span>
          </div>
          <ul className="space-y-1">
            {unlockedAchievements.map(a => (
              <li key={a} className="text-base">{achievementName(a)}</li>
            ))}
          </ul>
        </div>
      )}
      {showDifficultySelector ? (
        <DifficultySelector currentDifficulty={difficulty} onSelect={startNewGame} />
      ) : gameState === "welcome" ? (
        <WelcomeScreen onStart={startInitialGame} />
      ) : (
        <>
          <GameHeader
            difficulty={difficulty}
            attemptsRemaining={maxAttempts - guesses.length}
            totalAttempts={maxAttempts}
            onReset={resetGame}
          />

          {gameState === "playing" ? (
            <>
              <CountrySearch onSelectCountry={handleGuess} disabledCountries={guesses.map((g) => g.country)} countries={countries} />
              <GameBoard guesses={guesses} targetCountry={targetCountry} maxAttempts={maxAttempts} difficulty={difficulty} />
            </>
          ) : (
            <GameOver
              gameState={gameState}
              targetCountry={targetCountry}
              attempts={guesses.length}
              onPlayAgain={resetGame}
            />
          )}
        </>
      )}
    </div>
  )
}

function getHemisphereMatch(country1: any, country2: any) {
  const northSouth = country1.latitude > 0 === country2.latitude > 0 ? "match" : "different"
  const eastWest = country1.longitude > 0 === country2.longitude > 0 ? "match" : "different"
  return { northSouth, eastWest }
}

function getComparisonHint(value1: number, value2: number) {
  const percentDiff = Math.abs((value1 - value2) / value2) * 100

  if (percentDiff < 10) return "match"

  return value1 > value2 ? "higher" : "lower"
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const toRad = (deg: number) => deg * Math.PI / 180

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lon2 - lon1)

  const x = Math.cos(φ2) * Math.sin(Δλ)
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const numerator = Math.sqrt(x * x + y * y)
  const denominator = Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const σ = Math.atan2(numerator, denominator)
  return Math.round(R * σ)
}

function getDirectionHint(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => deg * Math.PI / 180
  const toDeg = (rad: number) => rad * 180 / Math.PI

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lon2 - lon1)

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  let θ = Math.atan2(y, x)
  θ = (toDeg(θ) + 360) % 360

  if (θ >= 337.5 || θ < 22.5) return "N"
  if (θ >= 22.5 && θ < 67.5) return "NE"
  if (θ >= 67.5 && θ < 112.5) return "E"
  if (θ >= 112.5 && θ < 157.5) return "SE"
  if (θ >= 157.5 && θ < 202.5) return "S"
  if (θ >= 202.5 && θ < 247.5) return "SW"
  if (θ >= 247.5 && θ < 292.5) return "W"
  if (θ >= 292.5 && θ < 337.5) return "NW"
}

function achievementName(code: string): string {
  switch (code) {
    case "first_win": return "Первая победа"
    case "streak_master": return "Серия побед"
    case "speed_demon": return "Скоростной игрок"
    case "sharpshooter": return "Меткий стрелок"
    case "globe_trotter": return "Путешественник"
    default: return code
  }
}
