import { AppShell } from "@/components/layout/app-shell"
import { CountryGame } from "@/components/game/country-game"
import { createClient } from "@/utils/auth/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")
  return (
    <AppShell user={user}>
      <CountryGame />
    </AppShell>
  )
}
