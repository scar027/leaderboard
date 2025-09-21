import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  created_at: string
  rank?: number
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

export default async function HomePage() {
  const supabase = await createClient()

  const { data: leaderboard, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })

  if (error) {
    console.error("Error fetching leaderboard:", error)
  }

  const rankedLeaderboard = leaderboard ? calculateRanks(leaderboard) : []

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-black">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-black">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>
    return <Badge variant="outline">#{rank}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/images/ieee-logo.png"
                alt="IEEE VIT Vellore Student Chapter"
                width={300}
                height={120}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
          </div>

          {/* Admin Link */}
          <div className="flex justify-end mb-6">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Admin Panel
            </Link>
          </div>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Ranks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rankedLeaderboard && rankedLeaderboard.length > 0 ? (
                <div className="space-y-0">
                  {rankedLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 border-b border-border last:border-b-0 ${
                        entry.rank <= 3 ? "bg-muted/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getRankBadge(entry.rank)}
                        <div>
                          <p className="font-medium text-foreground">{entry.player_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{entry.score.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No leaderboard data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
