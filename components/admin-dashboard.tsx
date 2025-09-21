"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, LogOut, RefreshCw } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  created_at: string
}

const calculateRanks = (entries: LeaderboardEntry[]) => {
  const rankedEntries = []
  let currentRank = 1

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    // If this is not the first entry and the score is different from previous
    if (i > 0 && entries[i - 1].score !== entry.score) {
      // For sequential ranking, increment by 1 regardless of how many tied at previous rank
      currentRank++
    }
    // If scores are the same, keep the same rank (currentRank stays unchanged)

    rankedEntries.push({
      ...entry,
      rank: currentRank,
    })
  }

  return rankedEntries
}

export function AdminDashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editScore, setEditScore] = useState("")
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerScore, setNewPlayerScore] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    setError("")
    const { data, error } = await supabase.from("leaderboard").select("*").order("score", { ascending: false })

    if (error) {
      console.error("Error fetching leaderboard:", error)
      setError("Failed to load leaderboard data")
    } else {
      setLeaderboard(data || [])
    }
    setIsLoading(false)
  }

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message)
      setSuccess("")
    } else {
      setSuccess(message)
      setError("")
    }
    setTimeout(() => {
      setError("")
      setSuccess("")
    }, 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in")
    router.push("/admin")
  }

  const handleEdit = (entry: LeaderboardEntry) => {
    setEditingId(entry.id)
    setEditName(entry.player_name)
    setEditScore(entry.score.toString())
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    if (!editName.trim()) {
      showMessage("Player name cannot be empty", true)
      return
    }

    const scoreValue = Number.parseInt(editScore)
    if (isNaN(scoreValue) || scoreValue < 0) {
      showMessage("Score must be a valid positive number", true)
      return
    }

    const { error } = await supabase
      .from("leaderboard")
      .update({
        player_name: editName.trim(),
        score: scoreValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId)

    if (error) {
      console.error("Error updating entry:", error)
      showMessage("Failed to update entry", true)
    } else {
      setEditingId(null)
      showMessage("Entry updated successfully")
      fetchLeaderboard()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditScore("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    const { error } = await supabase.from("leaderboard").delete().eq("id", id)

    if (error) {
      console.error("Error deleting entry:", error)
      showMessage("Failed to delete entry", true)
    } else {
      showMessage("Entry deleted successfully")
      fetchLeaderboard()
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      showMessage("Player name cannot be empty", true)
      return
    }

    const scoreValue = Number.parseInt(newPlayerScore)
    if (isNaN(scoreValue) || scoreValue < 0) {
      showMessage("Score must be a valid positive number", true)
      return
    }

    const { error } = await supabase.from("leaderboard").insert({
      player_name: newPlayerName.trim(),
      score: scoreValue,
    })

    if (error) {
      console.error("Error adding player:", error)
      showMessage("Failed to add player", true)
    } else {
      setNewPlayerName("")
      setNewPlayerScore("")
      setShowAddForm(false)
      showMessage("Player added successfully")
      fetchLeaderboard()
    }
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL entries? This action cannot be undone.")) return

    const { error } = await supabase.from("leaderboard").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      console.error("Error clearing leaderboard:", error)
      showMessage("Failed to clear leaderboard", true)
    } else {
      showMessage("Leaderboard cleared successfully")
      fetchLeaderboard()
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-black">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-black">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>
    return <Badge variant="outline">#{rank}</Badge>
  }

  const rankedLeaderboard = calculateRanks(leaderboard)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage leaderboard entries</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View Leaderboard
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Add New Player */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Player</CardTitle>
                <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {showAddForm ? "Cancel" : "Add Player"}
                </Button>
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="new-name">Player Name</Label>
                    <Input
                      id="new-name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-score">Score</Label>
                    <Input
                      id="new-score"
                      type="number"
                      min="0"
                      value={newPlayerScore}
                      onChange={(e) => setNewPlayerScore(e.target.value)}
                      placeholder="Enter score"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddPlayer} className="w-full">
                      Add Player
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Leaderboard Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leaderboard Entries ({leaderboard.length})</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={fetchLeaderboard} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  {leaderboard.length > 0 && (
                    <Button
                      onClick={handleClearAll}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : rankedLeaderboard.length > 0 ? (
                <div className="space-y-0">
                  {rankedLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 border-b border-border last:border-b-0 ${
                        entry.rank <= 3 ? "bg-muted/20" : ""
                      }`}
                    >
                      {editingId === entry.id ? (
                        // Edit mode
                        <div className="flex items-center gap-4 flex-1">
                          {getRankBadge(entry.rank)}
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Player name"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={editScore}
                              onChange={(e) => setEditScore(e.target.value)}
                              placeholder="Score"
                              className="w-32"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} size="sm">
                              Save
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex items-center gap-4">
                            {getRankBadge(entry.rank)}
                            <div>
                              <p className="font-medium text-foreground">{entry.player_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">{entry.score.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">points</p>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleEdit(entry)} variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(entry.id)}
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No entries found</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
