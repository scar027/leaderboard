import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { setupKey } = await request.json()

    const expectedKey = process.env.ADMIN_SETUP_KEY // Note: No NEXT_PUBLIC_ prefix

    if (!expectedKey) {
      return NextResponse.json({ error: "Admin setup is not configured on the server." }, { status: 500 })
    }

    if (setupKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid setup key. Access denied." }, { status: 401 })
    }

    const supabase = createClient()
    const { data: existingAdmins, error } = await supabase.from("admin_users").select("id").limit(1)

    if (error) {
      console.error("Error checking admin users:", error)
      return NextResponse.json({ error: "Database error occurred." }, { status: 500 })
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ error: "Admin setup is disabled. Admin users already exist." }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Setup verification error:", error)
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 })
  }
}
