"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Clock, CalendarPlus2Icon as CalendarIcon2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ScheduledMessage {
  id: string
  phoneNumber: string
  message: string
  scheduledTime: Date
  recurring: boolean
  recurrencePattern?: string
  status: "pending" | "sent" | "failed" | "cancelled"
  createdAt: Date
}

export function SchedulingInterface() {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([
    {
      id: "1",
      phoneNumber: "+1234567890",
      message: "Hello! This is a scheduled message.",
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      recurring: false,
      status: "pending",
      createdAt: new Date(),
    },
    {
      id: "2",
      phoneNumber: "+9876543210",
      message: "Weekly reminder: Please submit your report.",
      scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      recurring: true,
      recurrencePattern: "weekly",
      status: "pending",
      createdAt: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    phoneNumber: "",
    message: "",
    scheduledTime: new Date(),
    recurring: false,
    recurrencePattern: "daily",
  })
  const { toast } = useToast()

  const handleCreateMessage = () => {
    if (!newMessage.phoneNumber || !newMessage.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a phone number and message.",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newScheduledMessage: ScheduledMessage = {
        id: (scheduledMessages.length + 1).toString(),
        phoneNumber: newMessage.phoneNumber,
        message: newMessage.message,
        scheduledTime: newMessage.scheduledTime,
        recurring: newMessage.recurring,
        recurrencePattern: newMessage.recurring ? newMessage.recurrencePattern : undefined,
        status: "pending",
        createdAt: new Date(),
      }

      setScheduledMessages([...scheduledMessages, newScheduledMessage])
      setNewMessage({
        phoneNumber: "",
        message: "",
        scheduledTime: new Date(),
        recurring: false,
        recurrencePattern: "daily",
      })
      setCreateDialogOpen(false)
      setLoading(false)

      toast({
        title: "Message Scheduled",
        description: "Your message has been scheduled successfully.",
      })
    }, 1000)
  }

  const handleDeleteMessage = (id: string) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setScheduledMessages(scheduledMessages.filter((message) => message.id !== id))
      setLoading(false)

      toast({
        title: "Message Deleted",
        description: "Your scheduled message has been deleted.",
      })
    }, 1000)
  }

  const formatScheduledTime = (date: Date) => {
    return format(date, "PPpp")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Scheduling</h1>
          <p className="text-muted-foreground">Schedule messages to be sent at specific times.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Message</DialogTitle>
              <DialogDescription>Create a new scheduled message to be sent automatically.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  placeholder="+1234567890"
                  value={newMessage.phoneNumber}
                  onChange={(e) => setNewMessage({ ...newMessage, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your message here..."
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Scheduled Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newMessage.scheduledTime, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newMessage.scheduledTime}
                        onSelect={(date) => date && setNewMessage({ ...newMessage, scheduledTime: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(newMessage.scheduledTime, "HH:mm")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="hours">Hours</Label>
                            <Select
                              value={format(newMessage.scheduledTime, "HH")}
                              onValueChange={(value) => {
                                const newDate = new Date(newMessage.scheduledTime)
                                newDate.setHours(Number.parseInt(value))
                                setNewMessage({ ...newMessage, scheduledTime: newDate })
                              }}
                            >
                              <SelectTrigger id="hours">
                                <SelectValue placeholder="Hours" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="minutes">Minutes</Label>
                            <Select
                              value={format(newMessage.scheduledTime, "mm")}
                              onValueChange={(value) => {
                                const newDate = new Date(newMessage.scheduledTime)
                                newDate.setMinutes(Number.parseInt(value))
                                setNewMessage({ ...newMessage, scheduledTime: newDate })
                              }}
                            >
                              <SelectTrigger id="minutes">
                                <SelectValue placeholder="Minutes" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 60 }).map((_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={newMessage.recurring}
                    onCheckedChange={(checked) => setNewMessage({ ...newMessage, recurring: checked })}
                  />
                  <Label htmlFor="recurring">Recurring Message</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the message will be sent repeatedly according to the selected pattern.
                </p>
              </div>
              {newMessage.recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence-pattern">Recurrence Pattern</Label>
                  <Select
                    value={newMessage.recurrencePattern}
                    onValueChange={(value) => setNewMessage({ ...newMessage, recurrencePattern: value })}
                  >
                    <SelectTrigger id="recurrence-pattern">
                      <SelectValue placeholder="Select a pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateMessage} disabled={loading}>
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Scheduling...
                  </>
                ) : (
                  "Schedule Message"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Messages</CardTitle>
              <CardDescription>Messages scheduled to be sent in the future.</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledMessages.filter((msg) => msg.status === "pending").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2">No upcoming scheduled messages.</p>
                  <p className="text-sm mt-1">Schedule a message to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledMessages
                      .filter((message) => message.status === "pending")
                      .map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>{message.phoneNumber}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{message.message}</TableCell>
                          <TableCell>{formatScheduledTime(message.scheduledTime)}</TableCell>
                          <TableCell>{message.recurring ? `Yes (${message.recurrencePattern})` : "No"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages that have been successfully sent.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2">No sent scheduled messages.</p>
                <p className="text-sm mt-1">Sent messages will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Messages</CardTitle>
              <CardDescription>Messages that failed to send.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2">No failed scheduled messages.</p>
                <p className="text-sm mt-1">Failed messages will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
