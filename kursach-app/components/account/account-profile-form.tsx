"use client"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function AccountProfileForm({ initialDisplayName, email, userId, initialAvatarUrl }: { initialDisplayName: string, email: string, userId: string, initialAvatarUrl?: string }) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsSaving(true)
    const res = await fetch("/api/account/update", {
      method: "POST",
      body: JSON.stringify({ displayName, userId, avatarUrl }),
      headers: { "Content-Type": "application/json" }
    })
    if (res.ok) setMessage("Profile updated!")
    else setMessage("Error updating profile")
    setIsSaving(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files) return
    const avatarFile = e.currentTarget.files[0]
    if (!avatarFile) return
    // Загрузка в Supabase Storage
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${userId}-${Date.now()}.${fileExt}`
    const { error } = await (await import("@/utils/auth/client")).supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true })
    if (error) {
      setMessage("Error uploading avatar: " + error.message)
      return
    }
    // Получаем публичный URL
    const { data: publicUrlData } = await (await import("@/utils/auth/client")).supabase.storage.from("avatars").getPublicUrl(filePath)
    const newAvatarUrl = publicUrlData?.publicUrl || ""
    setAvatarUrl(newAvatarUrl)
    setMessage("Avatar uploaded and profile updated!")
    // Сохраняем новый avatar_url в профиле сразу
    await fetch("/api/account/update", {
      method: "POST",
      body: JSON.stringify({ displayName, userId, avatarUrl: newAvatarUrl }),
      headers: { "Content-Type": "application/json" }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="display-name">Отображаемое имя</Label>
        <Input id="display-name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Электронная почта</Label>
        <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
        <p className="text-xs text-gray-500">Почту нельзя изменить</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar">Аватар</Label>
        <div className="flex items-center space-x-4">
          <img
            src={avatarUrl || "/placeholder-user.jpg"}
            alt="Аватар"
            className="w-72 h-72 rounded-full object-cover border"
          />
          <input ref={fileInputRef} id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Button type="button" onClick={() => fileInputRef.current?.click()}>Загрузить</Button>
        </div>
      </div>
      <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить изменения"}
      </Button>
      {message && <div className="text-sm mt-2">{message === "Profile updated!" ? "Профиль обновлён!" : message === "Error updating profile" ? "Ошибка при обновлении профиля" : message === "Avatar uploaded and profile updated!" ? "Аватар загружен и профиль обновлён!" : message.startsWith("Error uploading avatar") ? "Ошибка загрузки аватара: " + message.slice("Error uploading avatar: ".length) : message}</div>}
    </form>
  )
} 