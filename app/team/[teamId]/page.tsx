"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowLeft, CheckCircle, Circle, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { ActivityFeed } from "./activity"

interface Project {
  _id: string
  name: string
  description: string
  team: string
  createdAt: string
}

interface Task {
  _id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  dueDate: string
  project: string
}

export default function TeamPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.teamId as string

  const [projects, setProjects] = useState<Project[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectData, setNewProjectData] = useState({ name: "", description: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchProjects(token)
  }, [router])

  const fetchProjects = async (token: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProjects(response.data)

      const allTasksData: Task[] = []
      for (const project of response.data) {
        const tasksResponse = await axios.get(`http://localhost:5000/api/tasks/${project._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        allTasksData.push(...tasksResponse.data)
      }
      setAllTasks(allTasksData)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    const token = localStorage.getItem("token")
    if (!token || !newProjectData.name.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:5000/api/projects",
        { ...newProjectData, team: teamId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setProjects([...projects, response.data])
      setNewProjectData({ name: "", description: "" })
      setShowNewProjectModal(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return allTasks.filter((task) => task.status === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading team projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Team Projects</h1>
            <p className="text-muted-foreground text-sm">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-gradient-to-r from-primary to-accent gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Create Project Modal */}
            <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                    <Input
                      placeholder="e.g., Mobile App"
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      className="bg-secondary border-border/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <Input
                      placeholder="Project description..."
                      value={newProjectData.description}
                      onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      className="bg-secondary border-border/40"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} className="bg-gradient-to-r from-primary to-accent">
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="projects" className="space-y-6">
              <TabsList className="bg-secondary/50 border border-border/40">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="tasks">Kanban Board</TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects">
                {projects.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <Link key={project._id} href={`/project/${project._id}`}>
                        <Card className="group hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full cursor-pointer bg-card/50 backdrop-blur border-border/40">
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                              {project.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground text-sm">{project.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-border/40 border-dashed">
                    <CardContent className="pt-12 pb-12 text-center space-y-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">No projects yet</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Create your first project to start organizing tasks
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Kanban Board Tab */}
              <TabsContent value="tasks">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do */}
                  <div className="bg-card/50 backdrop-blur border border-border/40 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      To Do{" "}
                      <span className="ml-auto text-xs bg-secondary px-2 py-1 rounded">
                        {getTasksByStatus("todo").length}
                      </span>
                    </h3>
                    <div className="space-y-3 min-h-96">
                      {getTasksByStatus("todo").map((task) => (
                        <Card
                          key={task._id}
                          className="p-3 bg-background border-border/40 hover:border-primary/40 transition-colors"
                        >
                          <p className="font-medium text-sm text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-2">{task.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="bg-card/50 backdrop-blur border border-border/40 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      In Progress{" "}
                      <span className="ml-auto text-xs bg-blue-500/20 px-2 py-1 rounded text-blue-600">
                        {getTasksByStatus("in-progress").length}
                      </span>
                    </h3>
                    <div className="space-y-3 min-h-96">
                      {getTasksByStatus("in-progress").map((task) => (
                        <Card
                          key={task._id}
                          className="p-3 bg-background border border-blue-200/50 hover:border-blue-500/50 transition-colors"
                        >
                          <p className="font-medium text-sm text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-2">{task.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Done */}
                  <div className="bg-card/50 backdrop-blur border border-border/40 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Done{" "}
                      <span className="ml-auto text-xs bg-green-500/20 px-2 py-1 rounded text-green-600">
                        {getTasksByStatus("done").length}
                      </span>
                    </h3>
                    <div className="space-y-3 min-h-96">
                      {getTasksByStatus("done").map((task) => (
                        <Card
                          key={task._id}
                          className="p-3 bg-background border border-green-200/50 hover:border-green-500/50 transition-colors"
                        >
                          <p className="font-medium text-sm text-foreground line-through text-muted-foreground">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{task.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed teamId={teamId} />
          </div>
        </div>
      </main>
    </div>
  )
}
