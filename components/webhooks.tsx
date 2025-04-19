"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2, RefreshCw, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockWebhooks } from "@/lib/mock-data"
import { format } from "date-fns"

export function Webhooks() {
  const [webhooks, setWebhooks] = useState(mockWebhooks)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewLogsDialogOpen, setViewLogsDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<any | null>(null)
  const [webhookLogs, setWebhookLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    secret: "",
    events: [] as string[],
  })
  const { toast } = useToast()

  const eventOptions = [
    { id: "message.received", label: "Message Received" },
    { id: "message.sent", label: "Message Sent" },
    { id: "contact.created", label: "Contact Created" },
    { id: "contact.updated", label: "Contact Updated" },
    { id: "template.used", label: "Template Used" },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name, URL, and at least one event.",
      })
      return
    }

    // Create new webhook
    const newWebhookObj = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      secret: newWebhook.secret,
      active: true,
      created_at: new Date().toISOString(),
    }

    setWebhooks([...webhooks, newWebhookObj])
    setCreateDialogOpen(false)

    // Reset form
    setNewWebhook({
      name: "",
      url: "",
      secret: "",
      events: [],
    })

    toast({
      title: "Webhook Created",
      description: "Your webhook has been created successfully.",
    })
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id))

    toast({
      title: "Webhook Deleted",
      description: "The webhook has been deleted.",
    })
  }

  const handleToggleWebhook = (webhook: any) => {
    setWebhooks(webhooks.map((w) => (w.id === webhook.id ? { ...w, active: !w.active } : w)))

    toast({
      title: webhook.active ? "Webhook Disabled" : "Webhook Enabled",
      description: `Your webhook has been ${webhook.active ? "disabled" : "enabled"} successfully.`,
    })
  }

  const handleTestWebhook = (webhookId: string) => {
    toast({
      title: "Test Sent",
      description: "A test webhook has been sent. Check the logs for details.",
    })

    // Simulate adding a log entry
    if (selectedWebhook?.id === webhookId) {
      const newLog = {
        id: Date.now().toString(),
        event_type: "test",
        created_at: new Date().toISOString(),
        success: Math.random() > 0.3, // 70% chance of success
        response_status: Math.random() > 0.3 ? 200 : 500,
        payload: { test: true, message: "This is a test webhook event" },
      }

      setWebhookLogs([newLog, ...webhookLogs])
    }
  }

  const handleViewLogs = (webhook: any) => {
    setSelectedWebhook(webhook)
    setViewLogsDialogOpen(true)

    // Simulate loading logs
    setLogsLoading(true)
    setTimeout(() => {
      // Generate mock logs
      const mockLogs = Array.from({ length: 5 }, (_, i) => ({
        id: `log-${i}-${Date.now()}`,
        event_type: webhook.events[Math.floor(Math.random() * webhook.events.length)],
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        success: Math.random() > 0.2,
        response_status: Math.random() > 0.2 ? 200 : 500,
        response_body: Math.random() > 0.2 ? '{"status":"success"}' : '{"error":"Internal server error"}',
        payload: {
          id: `msg-${i}`,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          data: { message: "Sample message content" },
        },
      }))

      setWebhookLogs(mockLogs)
      setLogsLoading(false)
    }, 1000)
  }

  const formatEventName = (eventType: string) => {
    const event = eventOptions.find((e) => e.id === eventType)
    return event ? event.label : eventType
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">Manage webhooks to integrate with external systems</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>Add a new webhook to receive events from your WhatsApp automation.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="My Webhook"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://example.com/webhook"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                <Input
                  id="webhook-secret"
                  placeholder="webhook_secret"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Used to sign webhook payloads for verification.</p>
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="space-y-2">
                  {eventOptions.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={newWebhook.events.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event.id],
                            })
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter((e) => e !== event.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`event-${event.id}`}>{event.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Webhooks</CardTitle>
            <CardDescription>Manage your webhook integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {webhooks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{webhook.url}</TableCell>
                      <TableCell>{webhook.events.length} events</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch checked={webhook.active} onCheckedChange={() => handleToggleWebhook(webhook)} />
                          <span>{webhook.active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={!webhook.active}
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Test</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewLogs(webhook)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Logs</span>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No webhooks found.</p>
                <p className="text-sm mt-1">Create a webhook to integrate with external systems.</p>
                <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={viewLogsDialogOpen} onOpenChange={setViewLogsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Webhook Logs: {selectedWebhook?.name}</DialogTitle>
            <DialogDescription>View recent webhook delivery logs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {logsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : webhookLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No logs found.</p>
                <p className="text-sm mt-1">Try testing the webhook to generate logs.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {webhookLogs.map((log) => (
                  <AccordionItem key={log.id} value={log.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`}></div>
                          <span>{formatEventName(log.event_type)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-muted rounded-md">
                        <div>
                          <h4 className="text-sm font-medium">Status</h4>
                          <p className={`text-sm ${log.success ? "text-green-500" : "text-red-500"}`}>
                            {log.success
                              ? `Success (${log.response_status})`
                              : `Failed: ${log.error || `HTTP ${log.response_status}`}`}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Payload</h4>
                          <pre className="text-xs bg-background p-2 rounded-md overflow-x-auto mt-1">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                        {log.response_body && (
                          <div>
                            <h4 className="text-sm font-medium">Response</h4>
                            <pre className="text-xs bg-background p-2 rounded-md overflow-x-auto mt-1">
                              {log.response_body}
                            </pre>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLogsDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => selectedWebhook && handleTestWebhook(selectedWebhook.id)}
              disabled={!selectedWebhook?.active}
            >
              Test Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
