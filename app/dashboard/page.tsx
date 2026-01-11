"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, LogOut, Users, FolderOpen, Sparkles } from "lucide-react"
import Link from "next/link"

interface Team {
  _id: string
  name: string
  description: string
  members: string[]
}

interface User {
  id: string
  name: string
  email: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTeamModal, setShowNewTeamModal] = useState(false)
  const [newTeamData, setNewTeamData] = useState({ name: "", description: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (!token || !userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    fetchTeams(token)
  }, [router])

  const fetchTeams = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:5000/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTeams(response.data)
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    const token = localStorage.getItem("token")
    if (!token || !newTeamData.name.trim()) return

    try {
      const response = await axios.post("http://localhost:5000/api/teams", newTeamData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTeams([...teams, response.data])
      setNewTeamData({ name: "", description: "" })
      setShowNewTeamModal(false)
    } catch (error) {
      console.error("Failed to create team:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-border/40 hover:bg-secondary bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border/40">
            <TabsTrigger value="teams" className="gap-2">
              <Users className="w-4 h-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">My Teams</h2>
                <p className="text-muted-foreground text-sm">
                  {teams.length} team{teams.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                onClick={() => setShowNewTeamModal(true)}
                className="bg-gradient-to-r from-primary to-accent gap-2"
              >
                <Plus className="w-4 h-4" />
                New Team
              </Button>
            </div>

            {/* Create Team Modal */}
            <Dialog open={showNewTeamModal} onOpenChange={setShowNewTeamModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Team Name</label>
                    <Input
                      placeholder="e.g., Project Alpha"
                      value={newTeamData.name}
                      onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                      className="bg-secondary border-border/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <Input
                      placeholder="Brief description of the team..."
                      value={newTeamData.description}
                      onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                      className="bg-secondary border-border/40"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowNewTeamModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam} className="bg-gradient-to-r from-primary to-accent">
                      Create Team
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Link key={team._id} href={`/team/${team._id}`}>
                    <Card className="group hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full cursor-pointer bg-card/50 backdrop-blur border-border/40">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                          {team.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">{team.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-secondary/30 to-secondary/10 border-border/40 border-dashed">
                  <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">No teams yet</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Create your first team to get started collaborating
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-card/50 backdrop-blur border-border/40">
              <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
                <p>Select a team to view and manage its projects</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
