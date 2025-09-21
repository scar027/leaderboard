"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export default function AdminSetupPage() {
  const [setupKey, setSetupKey] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [keyVerified, setKeyVerified] = useState(false)
  const [setupDisabled, setSetupDisabled] = useState(false)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("admin_users").select("id").limit(1)

      if (error) {
        console.error("[v0] Error checking admin users:", error)
        return
      }

      if (data && data.length > 0) {
        setSetupDisabled(true)
        setError("Admin setup is disabled. Admin users already exist.")
      }
    } catch (err) {
      console.error("[v0] Error checking setup status:", err)
    }
  }

  const verifySetupKey = async () => {
    if (!setupKey.trim()) {
      setError("Please enter a setup key.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setupKey }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setKeyVerified(true)
        setError("")
      } else {
        setError(result.error || "Setup key verification failed.")
      }
    } catch (err) {
      console.error("[v0] Error verifying setup key:", err)
      setError("Failed to verify setup key. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data: existingAdmins } = await supabase.from("admin_users").select("id").limit(1)

      if (existingAdmins && existingAdmins.length > 0) {
        throw new Error("Admin setup is disabled. Admin users already exist.")
      }

      console.log("[v0] Attempting to create admin user:", username)

      const { data, error: rpcError } = await supabase.rpc("create_admin_user", {
        admin_username: username,
        admin_password: password,
      })

      console.log("[v0] RPC response:", { data, error: rpcError })

      if (rpcError) {
        console.error("[v0] RPC Error details:", rpcError)
        throw rpcError
      }

      if (data && typeof data === "string" && data.startsWith("Error:")) {
        throw new Error(data)
      }

      setMessage(`Admin user "${username}" created successfully! Setup is now disabled. You can log in at /admin`)
      setUsername("")
      setPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        setSetupDisabled(true)
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error creating admin:", err)
      if (err.message.includes("already exists") || err.message.includes("Username already exists")) {
        setError("Username already exists. Please choose a different username.")
      } else if (err.message.includes("function") && err.message.includes("does not exist")) {
        setError("Database function not found. Please run the setup script: scripts/005_fix_admin_function.sql")
      } else {
        setError(`Failed to create admin user: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (setupDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Setup Disabled</CardTitle>
            <CardDescription>Admin setup is no longer available</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Admin users already exist or setup has been disabled for security reasons. If you need to create
                additional admin users, please contact your system administrator.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <a href="/admin">Go to Admin Login</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!keyVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Secure Admin Setup</CardTitle>
            <CardDescription>Enter the setup key to create your first admin user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setupKey">Setup Key</Label>
                <Input
                  id="setupKey"
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="Enter your setup key"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={verifySetupKey} className="w-full" disabled={!setupKey || loading}>
                {loading ? "Verifying..." : "Verify Setup Key"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Security Information:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Setup key is verified server-side for security</li>
                <li>• Only one admin can be created through this interface</li>
                <li>• Setup automatically disables after first admin creation</li>
                <li>• Contact your system administrator if you don't have the key</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Admin User</CardTitle>
          <CardDescription>Setup key verified. Create your admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password (min 8 chars)"
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription className="text-green-600">{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !username || !password || !confirmPassword}>
              {loading ? "Creating Admin..." : "Create Admin User"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Final Step:</h3>
            <p className="text-xs text-gray-600">
              After creating your admin user, this setup page will be automatically disabled for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
