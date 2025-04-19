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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { format } from "date-fns"

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

interface WebhookManagementProps {
  teamId: string
}

const WebhookManagement = ({ teamId }: WebhookManagementProps) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
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
  const [authToken] = useLocalStorage<string | null>("auth-token", null)
  const { toast } = useToast()

  const eventOptions = [
    { id: "message.received", label: "Message Received" },
    { id: "message.sent", label: "Message Sent" },
    { id: "contact.created", label: "Contact Created" },
    { id: "contact.updated", label: "Contact Updated" },
    { id: "template.used", label: "Template Used" },
  ]

  useEffect(() => {
    if (teamId) {
      fetchWebhooks()
    }
  }, [teamId, authToken])

  const fetchWebhooks = async () => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks?teamId=${teamId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch webhooks")
      }

      const data = await response.json()
      setWebhooks(data)
    } catch (error) {
      console.error("Error fetching webhooks:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch webhooks. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhookLogs = async (webhookId: string) => {
    if (!authToken || !teamId) return

    setLogsLoading(true)
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/logs?teamId=${teamId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch webhook logs")
      }

      const data = await response.json()
      setWebhookLogs(data)
    } catch (error) {
      console.error("Error fetching webhook logs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch webhook logs. Please try again.",
      })
    } finally {
      setLogsLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    if (!authToken || !teamId) return
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name, URL, and at least one event.",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks?teamId=${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
        body: JSON.stringify(newWebhook),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create webhook")
      }

      toast({
        title: "Webhook Created",
        description: "Your webhook has been created successfully.",
      })

      // Reset form
      setNewWebhook({
        name: "",
        url: "",
        secret: "",
        events: [],
      })
      setCreateDialogOpen(false)

      // Refresh webhooks
      await fetchWebhooks()
    } catch (error) {
      console.error("Error creating webhook:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create webhook. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks/${webhookId}?teamId=${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete webhook")
      }

      toast({
        title: "Webhook Deleted",
        description: "Your webhook has been deleted successfully.",
      })

      // Refresh webhooks
      await fetchWebhooks()
    } catch (error) {
      console.error("Error deleting webhook:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete webhook. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWebhook = async (webhook: Webhook) => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}?teamId=${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
        body: JSON.stringify({ active: !webhook.active }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update webhook")
      }

      toast({
        title: webhook.active ? "Webhook Disabled" : "Webhook Enabled",
        description: `Your webhook has been ${webhook.active ? "disabled" : "enabled"} successfully.`,
      })

      // Refresh webhooks
      await fetchWebhooks()
    } catch (error) {
      console.error("Error updating webhook:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update webhook. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test?teamId=${teamId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test webhook")
      }

      toast({
        title: "Test Sent",
        description: "A test webhook has been sent. Check the logs for details.",
      })

      // If viewing logs, refresh them
      if (selectedWebhook?.id === webhookId) {
        await fetchWebhookLogs(webhookId)
      }
    } catch (error) {
      console.error("Error testing webhook:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test webhook. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewLogs = async (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setViewLogsDialogOpen(true)
    await fetchWebhookLogs(webhook.id)
  }

  const formatEventName = (eventType: string) => {
    const event = eventOptions.find((e) => e.id === eventType)
    return event ? event.label : eventType
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                            <div
                              className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
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
                disabled={loading || !selectedWebhook?.active}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default WebhookManagement
