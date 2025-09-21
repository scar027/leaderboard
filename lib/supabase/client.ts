import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Client - Supabase URL available:", !!supabaseUrl)
  console.log("[v0] Client - Supabase Anon Key available:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Client - Missing Supabase environment variables")
    console.error("[v0] Client - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING")
    console.error("[v0] Client - NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "SET" : "MISSING")
    throw new Error("Supabase environment variables are not configured properly")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
