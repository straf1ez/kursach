import { createClient } from "@/utils/auth/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { AccountProfileForm } from "@/components/account/account-profile-form"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url")
    .eq("user_id", user.id)
    .single()
  const displayName = profile?.display_name || ""
  const email = profile?.email || ""
  const avatarUrl = profile?.avatar_url || ""

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Настройки аккаунта</h1>
          <p className="text-gray-600">Управляйте настройками своего аккаунта</p>
        </div>
        <AccountProfileForm initialDisplayName={displayName} email={email} userId={user.id} initialAvatarUrl={avatarUrl} />
      </div>
    </AppShell>
  )
}
