import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Admin setup verification started")

    const { setupKey } = await request.json()
    console.log("[v0] Setup key received:", setupKey ? "***PROVIDED***" : "MISSING")

    const expectedKey = process.env.ADMIN_SETUP_KEY
    console.log("[v0] Expected key from env:", expectedKey ? "***SET***" : "NOT_SET")

    if (!expectedKey) {
      console.log("[v0] Admin setup key not configured in environment")
      return NextResponse.json(
        { error: "Admin setup is not configured on the server. Please set ADMIN_SETUP_KEY environment variable." },
        { status: 500 },
      )
    }

    if (setupKey !== expectedKey) {
      console.log("[v0] Setup key mismatch")
      return NextResponse.json({ error: "Invalid setup key. Access denied." }, { status: 401 })
    }

    console.log("[v0] Setup key verified, checking existing admins")
    const supabase = await createClient()
    const { data: existingAdmins, error } = await supabase.from("admin_users").select("id").limit(1)

    if (error) {
      console.error("[v0] Database error checking admin users:", error)
      return NextResponse.json({ error: "Database error occurred." }, { status: 500 })
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log("[v0] Admin users already exist, setup disabled")
      return NextResponse.json({ error: "Admin setup is disabled. Admin users already exist." }, { status: 403 })
    }

    console.log("[v0] Setup verification successful")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Setup verification error:", error)
    return NextResponse.json(
      { error: `Server error occurred: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
