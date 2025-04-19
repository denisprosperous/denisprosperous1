"use client"

import { useState } from "react"
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
import { Plus, Trash2, RefreshCw, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface WebhookLog {
  id: string
  webhook_id: string
  event_type: string
  payload: any
  response_status: number
  response_body: string
  success: boolean
  error: string | null
  created_at: string
}

export function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      name: "Order Notification",
      url: "https://example.com/webhook",
      events: ["message.received", "message.sent"],
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "CRM Integration",
      url: "https://crm.example.com/api/whatsapp",
      events: ["contact.created", "contact.updated"],
      secret: "********",
      active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewLogsDialogOpen, setViewLogsDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
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

  const handleCreateWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name, URL, and at least one event.",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newId = (webhooks.length + 1).toString()
      const webhook: Webhook = {
        id: newId,
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        secret: newWebhook.secret || undefined,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setWebhooks([...webhooks, webhook])
      setNewWebhook({
        name: "",
        url: "",
        secret: "",
        events: [],
      })
      setCreateDialogOpen(false)
      setLoading(false)

      toast({
        title: "Webhook Created",
        description: "Your webhook has been created successfully.",
      })
    }, 1000)
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setWebhooks(webhooks.filter((webhook) => webhook.id !== webhookId))
      setLoading(false)

      toast({
        title: "Webhook Deleted",
        description: "Your webhook has been deleted successfully.",
      })
    }, 1000)
  }

  const handleToggleWebhook = async (webhook: Webhook) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setWebhooks(webhooks.map((w) => (w.id === webhook.id ? { ...w, active: !w.active } : w)))
      setLoading(false)

      toast({
        title: webhook.active ? "Webhook Disabled" : "Webhook Enabled",
        description: `Your webhook has been ${webhook.active ? "disabled" : "enabled"} successfully.`,
      })
    }, 1000)
  }

  const handleTestWebhook = async (webhookId: string) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)

      toast({
        title: "Test Sent",
        description: "A test webhook has been sent. Check the logs for details.",
      })

      // If viewing logs, add a test log
      if (selectedWebhook?.id === webhookId) {
        const testLog: WebhookLog = {
          id: Math.random().toString(),
          webhook_id: webhookId,
          event_type: "test",
          payload: { test: true, message: "This is a test webhook event" },
          response_status: 200,
          response_body: '{"success":true}',
          success: true,
          error: null,
          created_at: new Date().toISOString(),
        }

        setWebhookLogs([testLog, ...webhookLogs])
      }
    }, 1000)
  }

  const handleViewLogs = async (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setViewLogsDialogOpen(true)
    setLogsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Generate some mock logs
      const mockLogs: WebhookLog[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `log-${i}`,
        webhook_id: webhook.id,
        event_type: webhook.events[Math.floor(Math.random() * webhook.events.length)],
        payload: {
          id: `msg-${i}`,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          data: { message: "Sample message content" },
        },
        response_status: i % 3 === 0 ? 400 : 200,
        response_body: i % 3 === 0 ? '{"error":"Bad request"}' : '{"success":true}',
        success: i % 3 !== 0,
        error: i % 3 === 0 ? "Bad request" : null,
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
      }))

      setWebhookLogs(mockLogs)
      setLogsLoading(false)
    }, 1500)
  }

  const formatEventName = (eventType: string) => {
    const event = eventOptions.find((e) => e.id === eventType)
    return event ? event.label : eventType
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Manage webhooks to integrate with external systems</CardDescription>
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
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook} disabled={loading}>
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  "Create Webhook"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && webhooks.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No webhooks found.</p>
            <p className="text-sm mt-1">Create a webhook to integrate with external systems.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                        <Switch
                          checked={webhook.active}
                          onCheckedChange={() => handleToggleWebhook(webhook)}
                          disabled={loading}
                        />
                        <span>{webhook.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook.id)}
                          disabled={loading || !webhook.active}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Test</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewLogs(webhook)} disabled={loading}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Logs</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
                            <div
                              className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <span>{formatEventName(log.event_type)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(log.created_at)}</div>
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
                disabled={loading || !selectedWebhook?.active}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Testing...
                  </>
                ) : (
                  "Test Webhook"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
