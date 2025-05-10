import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/auth/server"

export async function POST(req: NextRequest) {
  const { displayName, userId, avatarUrl } = await req.json()
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, avatar_url: avatarUrl })
    .eq("user_id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 