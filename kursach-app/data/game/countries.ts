import { supabase } from "@/utils/auth/client"

export type Country = {
  country: string
  continent: string | null
  latitude: number | null
  longitude: number | null
  gdp: number | null
  population: number | null
  median_age: number | null
}

export async function getCountriesData(): Promise<Country[]> {
  const { data, error } = await supabase
    .schema("public")
    .from("countries")
    .select("country, continent, latitude, longitude, gdp, population, median_age")

  if (error) throw error
  return data as Country[]
}
