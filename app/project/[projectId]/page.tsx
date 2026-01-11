"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, ArrowLeft, Trash2, MessageCircle, Calendar, Sparkles } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  dueDate: string
}

interface Comment {
  _id: string
  text: string
  author: { name: string; email: string }
  createdAt: string
}

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTaskData, setNewTaskData] = useState({ title: "", description: "", dueDate: "" })
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchTasks(token)
  }, [router])

  const fetchTasks = async (token: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(response.data)

      const commentsData: Record<string, Comment[]> = {}
      for (const task of response.data) {
        const commentsResponse = await axios.get(`http://localhost:5000/api/comments/${task._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        commentsData[task._id] = commentsResponse.data
      }
      setComments(commentsData)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    const token = localStorage.getItem("token")
    if (!token || !newTaskData.title.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        { ...newTaskData, project: projectId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setTasks([...tasks, response.data])
      setNewTaskData({ title: "", description: "", dueDate: "" })
      setShowNewTaskModal(false)
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)))
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(tasks.filter((t) => t._id !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleCreateComment = async (taskId: string) => {
    const token = localStorage.getItem("token")
    if (!token || !newComment[taskId]?.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:5000/api/comments",
        { text: newComment[taskId], task: taskId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setComments({
        ...comments,
        [taskId]: [...(comments[taskId] || []), response.data],
      })
      setNewComment({ ...newComment, [taskId]: "" })
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const handleDeleteComment = async (taskId: string, commentId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setComments({
        ...comments,
        [taskId]: comments[taskId].filter((c) => c._id !== commentId),
      })
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/20 text-green-700 border-green-200/50"
      case "in-progress":
        return "bg-blue-500/20 text-blue-700 border-blue-200/50"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-200/50"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading project tasks...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Project Tasks</h1>
            <p className="text-muted-foreground text-sm">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowNewTaskModal(true)} className="bg-gradient-to-r from-primary to-accent gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Task Dialog */}
        <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Task Title</label>
                <Input
                  placeholder="e.g., Design login screen"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="bg-secondary border-border/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Input
                  placeholder="Task description..."
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="bg-secondary border-border/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                <Input
                  type="date"
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                  className="bg-secondary border-border/40"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewTaskModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} className="bg-gradient-to-r from-primary to-accent">
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task._id}>
                <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur border-border/40">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{task.description}</p>

                            {task.dueDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTaskStatus(task._id, e.target.value as "todo" | "in-progress" | "done")
                          }
                          className={`text-sm font-medium border rounded-full px-3 py-1 transition-all cursor-pointer ${getStatusColor(
                            task.status,
                          )}`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                          className="gap-1 text-primary"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {comments[task._id]?.length > 0 && (
                            <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                              {comments[task._id].length}
                            </span>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                {expandedTask === task._id && (
                  <Card className="mt-3 bg-card/50 backdrop-blur border-border/40 border-b-2 border-b-primary/40">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Comments</h4>

                        {/* Comment List */}
                        <div className="space-y-3 max-h-56 overflow-y-auto">
                          {comments[task._id]?.length > 0 ? (
                            comments[task._id].map((comment) => (
                              <div
                                key={comment._id}
                                className="bg-background border border-border/40 p-3 rounded-lg text-sm"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-foreground">{comment.author.name}</p>
                                    <p className="text-muted-foreground text-xs">{comment.author.email}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(task._id, comment._id)}
                                    className="text-destructive hover:bg-destructive/10 h-7 px-2"
                                  >
                                    Delete
                                  </Button>
                                </div>
                                <p className="text-foreground mt-2">{comment.text}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">No comments yet</p>
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2 pt-2 border-t border-border/40">
                          <Input
                            placeholder="Add a comment..."
                            value={newComment[task._id] || ""}
                            onChange={(e) => setNewComment({ ...newComment, [task._id]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleCreateComment(task._id)
                              }
                            }}
                            className="flex-1 bg-secondary border-border/40 h-9"
                          />
                          <Button size="sm" onClick={() => handleCreateComment(task._id)} className="h-9">
                            Post
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          ) : (
            <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-border/40 border-dashed">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No tasks yet</p>
                  <p className="text-muted-foreground text-sm mt-1">Create your first task to organize work</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
