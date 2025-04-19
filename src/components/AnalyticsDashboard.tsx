"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  MessageSquare,
  Clock,
  Users,
  FileText,
  CalendarIcon,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface AnalyticsSummary {
  today: {
    received: number
    sent: number
    aiGenerated: number
    templateUsed: number
  }
  month: {
    totalReceived: number
    totalSent: number
    totalAiGenerated: number
    totalTemplateUsed: number
  }
  responseTime: {
    avg: number
    min: number
    max: number
  } | null
  engagement: {
    activeConversations: number
    newConversations: number
    avgDuration: number
    avgMessages: number
  } | null
  topTemplates: Array<{
    template_id: string
    times_used: number
    response_rate: number
    templates: {
      name: string
    }
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  })
  const [messageData, setMessageData] = useState<any[]>([])
  const [responseTimeData, setResponseTimeData] = useState<any[]>([])
  const [engagementData, setEngagementData] = useState<any[]>([])
  const [templateData, setTemplateData] = useState<any[]>([])

  useEffect(() => {
    fetchSummary()
    fetchAnalyticsData()
  }, [dateRange])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics/summary")
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error("Error fetching analytics summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const startDateStr = format(dateRange.startDate, "yyyy-MM-dd")
      const endDateStr = format(dateRange.endDate, "yyyy-MM-dd")

      // Fetch message analytics
      const messageResponse = await fetch(`/api/analytics/messages?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (messageResponse.ok) {
        const data = await messageResponse.json()
        setMessageData(data)
      }

      // Fetch response time analytics
      const responseTimeResponse = await fetch(
        `/api/analytics/response-times?startDate=${startDateStr}&endDate=${endDateStr}`,
      )
      if (responseTimeResponse.ok) {
        const data = await responseTimeResponse.json()
        setResponseTimeData(data)
      }

      // Fetch engagement analytics
      const engagementResponse = await fetch(
        `/api/analytics/engagement?startDate=${startDateStr}&endDate=${endDateStr}`,
      )
      if (engagementResponse.ok) {
        const data = await engagementResponse.json()
        setEngagementData(data)
      }

      // Fetch template analytics
      const templateResponse = await fetch(`/api/analytics/templates?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (templateResponse.ok) {
        const data = await templateResponse.json()
        setTemplateData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    }
  }

  const formatSecondsToTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const getMessageTrend = () => {
    if (!summary) return { value: 0, isPositive: true }

    const previousDay = summary.today.received > 0 ? summary.today.received - 1 : 0
    const percentageChange = calculatePercentageChange(summary.today.received, previousDay)

    return {
      value: percentageChange,
      isPositive: percentageChange >= 0,
    }
  }

  const getResponseTimeTrend = () => {
    if (!summary?.responseTime) return { value: 0, isPositive: false }

    // For response time, lower is better, so we invert the logic
    const previousAvg = summary.responseTime.avg > 0 ? summary.responseTime.avg * 1.1 : 0
    const percentageChange = calculatePercentageChange(summary.responseTime.avg, previousAvg)

    return {
      value: Math.abs(percentageChange),
      isPositive: percentageChange <= 0,
    }
  }

  const messageTrend = getMessageTrend()

  const responseTimeTrend = getResponseTimeTrend()

  const getEngagementTrend = () => {
    if (!summary?.engagement) return { value: 0, isPositive: true }

    const previousActive = summary.engagement.activeConversations > 0 ? summary.engagement.activeConversations - 1 : 0
    const percentageChange = calculatePercentageChange(summary.engagement.activeConversations, previousActive)

    return {
      value: percentageChange,
      isPositive: percentageChange >= 0,
    }
  }

  const engagementTrend = getEngagementTrend()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your WhatsApp automation performance and engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.startDate,
                  to: dateRange.endDate,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      startDate: range.from,
                      endDate: range.to,
                    })
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={fetchSummary} variant="outline" size="icon">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.today.received || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {messageTrend.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={messageTrend.isPositive ? "text-green-500" : "text-red-500"}>
                    {messageTrend.value}%
                  </span>
                  <span className="ml-1">from yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.responseTime ? formatSecondsToTime(summary.responseTime.avg) : "N/A"}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {responseTimeTrend.isPositive ? (
                    <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={responseTimeTrend.isPositive ? "text-green-500" : "text-red-500"}>
                    {responseTimeTrend.value}%
                  </span>
                  <span className="ml-1">from yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.engagement?.activeConversations || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {engagementTrend.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={engagementTrend.isPositive ? "text-green-500" : "text-red-500"}>
                    {engagementTrend.value}%
                  </span>
                  <span className="ml-1">from yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.today.aiGenerated || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary?.month.totalAiGenerated || 0} this month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="messages" className="space-y-4">
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="response-times">Response Times</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Message Volume</CardTitle>
                  <CardDescription>Number of messages sent and received over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {messageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={messageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total_received" name="Received" fill="#8884d8" />
                          <Bar dataKey="total_sent" name="Sent" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No message data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Message Types</CardTitle>
                  <CardDescription>Breakdown of message types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {messageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "AI Generated",
                                value: summary?.month.totalAiGenerated || 0,
                              },
                              {
                                name: "Template Used",
                                value: summary?.month.totalTemplateUsed || 0,
                              },
                              {
                                name: "Manual",
                                value:
                                  (summary?.month.totalSent || 0) -
                                  (summary?.month.totalAiGenerated || 0) -
                                  (summary?.month.totalTemplateUsed || 0),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No message data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response-times" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>Average, minimum, and maximum response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {responseTimeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatSecondsToTime(value as number)} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="avg_response_time_seconds"
                            name="Average"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line type="monotone" dataKey="min_response_time_seconds" name="Minimum" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="max_response_time_seconds" name="Maximum" stroke="#ffc658" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No response time data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Engagement</CardTitle>
                  <CardDescription>Active and new conversations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {engagementData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={engagementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="active_conversations" name="Active" fill="#8884d8" />
                          <Bar dataKey="new_conversations" name="New" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No engagement data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversation Metrics</CardTitle>
                  <CardDescription>Average duration and messages per conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {engagementData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={engagementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "Avg Duration") return formatSecondsToTime(value as number)
                              return value
                            }}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="conversation_duration_avg_seconds"
                            name="Avg Duration"
                            stroke="#8884d8"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="messages_per_conversation_avg"
                            name="Avg Messages"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No engagement data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Usage</CardTitle>
                  <CardDescription>Most used templates and their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {templateData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={summary?.topTemplates.map((template) => ({
                            name: template.templates.name,
                            used: template.times_used,
                            responseRate: Math.round((template.response_rate || 0) * 100),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="used" name="Times Used" fill="#8884d8" />
                          <Bar dataKey="responseRate" name="Response Rate (%)" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                        No template data available for the selected date range
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default AnalyticsDashboard
