"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, ClipboardList, BarChart3, ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      {/* Navigation Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">CC</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Campus Connect
            </h1>
          </div>
          <nav className="flex gap-3 items-center">
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-foreground hover:bg-secondary"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")
                    router.push("/")
                  }}
                  className="border-border/40"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-foreground">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-shadow">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/40 text-sm text-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>The #1 Platform for Student Teams</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Collaborate Better.
            </span>
            <br />
            Achieve More.
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Campus Connect helps student teams collaborate on projects, manage tasks, and track progress—just like
            professional teams at tech companies like Microsoft, Google, and Meta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {!isLoggedIn && (
              <>
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all"
                >
                  <Link href="/signup" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-border/40 hover:bg-secondary bg-transparent"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </>
            )}
          </div>

          {/* Social Proof */}
          <div className="pt-12 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">Trusted by students from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Stanford University
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                MIT
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                UC Berkeley
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">Everything You Need</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for student collaboration and team productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Team Management",
                description: "Create teams, invite members, and assign roles with ease",
              },
              {
                icon: ClipboardList,
                title: "Project Tracking",
                description: "Organize work into projects and manage deadlines efficiently",
              },
              {
                icon: CheckCircle,
                title: "Task Management",
                description: "Create, assign, and track tasks with status updates",
              },
              {
                icon: BarChart3,
                title: "Progress Analytics",
                description: "Visualize team progress with real-time insights and metrics",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="group hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur"
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                    <feature.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/40 rounded-2xl p-8 sm:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                5000+
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">Active Student Users</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                150+
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">Universities & Schools</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                99.9%
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">Platform Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-primary via-primary/80 to-accent rounded-2xl p-8 sm:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-primary-foreground">Ready to Transform Your Team?</h3>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of student teams already collaborating with Campus Connect.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold gap-2"
              asChild
            >
              <Link href="/signup">
                Start Free Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">CC</span>
              </div>
              <span>Campus Connect © 2025</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
