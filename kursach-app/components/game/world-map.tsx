"use client"
import React from "react"
import { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

// World map topojson
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

interface WorldMapProps {
  guesses: any[]
  targetCountry: any | null
}

export function WorldMap({ guesses, targetCountry }: WorldMapProps) {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const handleZoomIn = () => {
    if (position.zoom >= 4) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
  }

  const handleZoomOut = () => {
    if (position.zoom <= 1) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
  }

  const handleMoveEnd = (position: any) => {
    setPosition(position)
  }

  // Format numbers for display
  const formatNumber = (num: number): string => {
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

  // Get guessed country names for coloring
  const guessedCountryNames = [] // Подсветка по ISO-коду отключена, т.к. getCountryISO убран

  return (
    <div className="relative h-[400px] w-full bg-slate-100 rounded-lg overflow-hidden mb-6">
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          aria-label="Zoom in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          aria-label="Zoom out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 160,
        }}
      >
        <ZoomableGroup zoom={position.zoom} center={position.coordinates as [number, number]} onMoveEnd={handleMoveEnd}>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                // Check if this country has been guessed
                const isGuessed = false
                const isCorrect = false

                // Determine fill color based on guess status
                let fillColor = "#EAEAEC" // Default color
                if (isCorrect) {
                  fillColor = "#4CAF50" // Green for correct guess
                } else if (isGuessed) {
                  fillColor = "#FF9800" // Orange for incorrect guess
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: isGuessed ? fillColor : "#F5F5F5", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Markers for guessed countries */}
          {guesses.map((guess, i) => (
            <TooltipProvider key={`marker-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Marker coordinates={[guess.longitude, guess.latitude]}>
                    <circle r={6} fill={guess.isCorrect ? "#4CAF50" : "#FF9800"} stroke="#fff" strokeWidth={2} />
                    <text
                      textAnchor="middle"
                      y={-10}
                      style={{ fontFamily: "system-ui", fill: "#000", fontSize: "10px" }}
                    >
                      {guess.flag}
                    </text>
                  </Marker>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-bold">{guess.name}</p>
                    <p>Population: {formatNumber(guess.population)}</p>
                    <p>GDP: ${formatNumber(guess.gdp)}</p>
                    <p>Avg. Age: {guess.averageAge} years</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

          {/* Target country indicator (only shown when game is over and player won) */}
          {targetCountry && guesses.some((g) => g.isCorrect) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Marker coordinates={[targetCountry.longitude, targetCountry.latitude]}>
                    <circle r={8} fill="#4CAF50" stroke="#fff" strokeWidth={2} />
                    <text
                      textAnchor="middle"
                      y={-12}
                      style={{ fontFamily: "system-ui", fill: "#000", fontSize: "12px" }}
                    >
                      {targetCountry.flag}
                    </text>
                  </Marker>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-bold">{targetCountry.name}</p>
                    <p>Continent: {targetCountry.continent}</p>
                    <p>Population: {formatNumber(targetCountry.population)}</p>
                    <p>GDP: ${formatNumber(targetCountry.gdp)}</p>
                    <p>Avg. Age: {targetCountry.averageAge} years</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
