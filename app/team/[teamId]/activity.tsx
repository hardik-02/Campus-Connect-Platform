"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityIcon, MessageCircle, CheckCircle, Plus } from "lucide-react"

interface Activity {
  _id: string
  action: string
  user: { name: string; email: string }
  description: string
  createdAt: string
}

interface ActivityFeedProps {
  teamId: string
}

export function ActivityFeed({ teamId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetchActivity(token)
  }, [teamId])

  const fetchActivity = async (token: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/activity/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setActivities(response.data)
    } catch (error) {
      console.error("Failed to fetch activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "comment_added":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "task_created":
        return <Plus className="w-4 h-4 text-primary" />
      default:
        return <ActivityIcon className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading activity...</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity._id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                <div className="flex-shrink-0">{getActivityIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.user.name}
                    <span className="text-muted-foreground font-normal"> {activity.description}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
