"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeChats: 0,
    responseTime: "0s",
    pendingResponses: 0,
  })
  const [status, setStatus] = useState<"active" | "inactive" | "loading">("loading")
  const [apiKey] = useLocalStorage<string | null>("encrypted-api-key", null)
  const [passphrase, setPassphrase] = useState<string>("")
  const [showPassphraseInput, setShowPassphraseInput] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    // Check WhatsApp connection status
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/whatsapp/status")
        if (response.ok) {
          const data = await response.json()
          setStatus(data.monitoring ? "active" : "inactive")
        }
      } catch (error) {
        console.error("Error checking WhatsApp status:", error)
        setStatus("inactive")
      }
    }

    fetchStats()
    checkStatus()

    // Set up polling for status updates
    const intervalId = setInterval(() => {
      fetchStats()
      checkStatus()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  const toggleService = async () => {
    if (!apiKey && status === "inactive") {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your OpenAI API key in the Settings page before starting the service.",
      })
      return
    }

    if (status === "inactive" && apiKey && !passphrase) {
      setShowPassphraseInput(true)
      return
    }

    setStatus("loading")

    try {
      const endpoint = status === "active" ? "/api/whatsapp/stop" : "/api/whatsapp/start"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          passphrase,
        }),
      })

      if (response.ok) {
        setStatus(status === "active" ? "inactive" : "active")
        setShowPassphraseInput(false)
        setPassphrase("")
        toast({
          title: status === "active" ? "Service Stopped" : "Service Started",
          description:
            status === "active" ? "WhatsApp automation has been paused." : "WhatsApp automation is now active.",
        })
      } else {
        throw new Error("Failed to toggle service")
      }
    } catch (error) {
      console.error("Error toggling service:", error)
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Could not change service status. Please try again.",
      })
      setStatus(status === "active" ? "active" : "inactive")
    }
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
              <div className="text-center py-10 text-muted-foreground">No recent messages to display.</div>
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

export default Dashboard
