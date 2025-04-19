"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockDashboardStats, mockRecentMessages } from "@/lib/mock-data"

export function Dashboard() {
  const [stats, setStats] = useState(mockDashboardStats)
  const [status, setStatus] = useState<"active" | "inactive" | "loading">("inactive")
  const [showPassphraseInput, setShowPassphraseInput] = useState<boolean>(false)
  const [passphrase, setPassphrase] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    // Simulate fetching dashboard stats
    const timer = setTimeout(() => {
      setStats(mockDashboardStats)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const toggleService = async () => {
    if (status === "inactive" && !passphrase) {
      setShowPassphraseInput(true)
      return
    }

    setStatus("loading")

    // Simulate API call
    setTimeout(() => {
      setStatus(status === "active" ? "inactive" : "active")
      setShowPassphraseInput(false)
      setPassphrase("")
      toast({
        title: status === "active" ? "Service Stopped" : "Service Started",
        description:
          status === "active" ? "WhatsApp automation has been paused." : "WhatsApp automation is now active.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your WhatsApp automation.</p>
        </div>
        {showPassphraseInput ? (
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter your passphrase"
              className="px-3 py-2 border rounded-md"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <Button onClick={toggleService} disabled={!passphrase}>
              Start
            </Button>
            <Button variant="outline" onClick={() => setShowPassphraseInput(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={toggleService}
            variant={status === "active" ? "destructive" : "default"}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : status === "active" ? (
              "Stop Automation"
            ) : (
              "Start Automation"
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingResponses}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="stats">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest messages processed by your automation.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockRecentMessages.length > 0 ? (
                <div className="space-y-4">
                  {mockRecentMessages.map((message, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {message.sender.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{message.sender}</p>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">No recent messages to display.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Analytics for your WhatsApp automation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                Performance data will appear here once you have more activity.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
