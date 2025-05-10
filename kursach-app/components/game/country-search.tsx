"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { getCountriesData, Country } from "@/data/game/countries"

interface CountrySearchProps {
  onSelectCountry: (country: Country) => void
  disabledCountries: string[]
}

export function CountrySearch({ onSelectCountry, disabledCountries }: CountrySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCountriesData().then(setCountries)
  }, [])

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredCountries([])
      return
    }

    const filtered = countries
      .filter(
        (country) =>
          country.country.toLowerCase().includes(searchTerm.toLowerCase()) && !disabledCountries.includes(country.country),
      )
      .slice(0, 10) // Limit to 10 results

    setFilteredCountries(filtered)
  }, [searchTerm, disabledCountries, countries])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleCountrySelect = (country: Country) => {
    onSelectCountry(country)
    setSearchTerm("")
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <div className="flex">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Угадайте страну..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsDropdownOpen(true)
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="flex-1"
        />
        <Button
          type="submit"
          className="ml-2"
          disabled={filteredCountries.length === 0}
          onClick={() => {
            if (filteredCountries.length > 0) {
              handleCountrySelect(filteredCountries[0])
            }
          }}
        >
          <Search className="h-4 w-4 mr-2" />
          Угадать
        </Button>
      </div>

      {isDropdownOpen && filteredCountries.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCountries.map((country) => (
            <button
              key={country.country}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
              onClick={() => handleCountrySelect(country)}
            >
              {/* <span className="mr-2">{country.flag}</span> */}
              {country.country}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
