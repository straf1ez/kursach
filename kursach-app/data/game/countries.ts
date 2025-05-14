import { supabase } from "@/utils/auth/client"

export type Country = {
  country: string
  continent: string | null
  latitude: number | null
  longitude: number | null
  gdp: number | null
  population: number | null
  median_age: number | null
  difficulty?: "easy" | "medium" | "hard" | null
}

export async function getCountriesData(difficulty?: "easy" | "medium" | "hard"): Promise<Country[]> {
  let query = supabase
    .schema("public")
    .from("countries")
    .select("country, continent, latitude, longitude, gdp, population, median_age, difficulty")

  if (difficulty) {
    query = query.eq("difficulty", difficulty)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Country[]
}
