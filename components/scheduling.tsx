"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Clock, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockScheduledMessages, mockContacts } from "@/lib/mock-data"

export function Scheduling() {
  const [scheduledMessages, setScheduledMessages] = useState(mockScheduledMessages)
  const [contacts, setContacts] = useState(mockContacts)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("12:00")
  const [recipient, setRecipient] = useState("")
  const [message, setMessage] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState("daily")
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateScheduledMessage = () => {
    if (!date || !time || !recipient || !message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Create scheduled time by combining date and time
    const scheduledTime = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    scheduledTime.setHours(hours, minutes)

    // Create new scheduled message
    const newMessage = {
      id: Date.now().toString(),
      recipient: {
        name: contacts.find((c) => c.phone_number === recipient)?.name || "Unknown",
        phone_number: recipient,
      },
      message,
      scheduled_time: scheduledTime.toISOString(),
      status: "pending",
      created_at: new Date().toISOString(),
      recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : undefined,
    }

    setScheduledMessages([...scheduledMessages, newMessage])
    setCreateDialogOpen(false)

    // Reset form
    setDate(new Date())
    setTime("12:00")
    setRecipient("")
    setMessage("")
    setIsRecurring(false)
    setRecurrencePattern("daily")

    toast({
      title: "Message Scheduled",
      description: "Your message has been scheduled successfully.",
    })
  }

  const handleDeleteScheduledMessage = (id: string) => {
    setScheduledMessages(scheduledMessages.filter((msg) => msg.id !== id))

    toast({
      title: "Message Deleted",
      description: "The scheduled message has been deleted.",
    })
  }

  const formatScheduledTime = (isoString: string) => {
    return format(new Date(isoString), "PPp") // e.g., "Apr 29, 2023, 12:00 PM"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Scheduling</h1>
          <p className="text-muted-foreground">Schedule messages to be sent automatically at specific times.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule a Message</DialogTitle>
              <DialogDescription>Create a new scheduled message to be sent automatically.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger id="recipient">
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.phone_number}>
                        {contact.name} ({contact.phone_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="flex items-center">
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                  <Label htmlFor="recurring">Recurring message</Label>
                </div>

                {isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-pattern">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger id="recurrence-pattern">
                        <SelectValue placeholder="Select pattern" />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateScheduledMessage}>Schedule Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Messages</CardTitle>
                <CardDescription>Messages scheduled to be sent in the future.</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledMessages.filter((msg) => msg.status === "pending").length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Scheduled Time</TableHead>
                        <TableHead>Recurring</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledMessages
                        .filter((msg) => msg.status === "pending")
                        .map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.recipient.name}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{message.message}</TableCell>
                            <TableCell>{formatScheduledTime(message.scheduled_time)}</TableCell>
                            <TableCell>{message.recurring ? `Yes (${message.recurrence_pattern})` : "No"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteScheduledMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2" />
                    <p>No upcoming scheduled messages</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule a Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages that have already been sent.</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledMessages.filter((msg) => msg.status === "sent").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledMessages
                      .filter((msg) => msg.status === "sent")
                      .map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.recipient.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{message.message}</TableCell>
                          <TableCell>{formatScheduledTime(message.scheduled_time)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Clone and reschedule
                                setDate(new Date())
                                setTime("12:00")
                                setRecipient(message.recipient.phone_number)
                                setMessage(message.message)
                                setCreateDialogOpen(true)
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reschedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sent messages to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Messages</CardTitle>
              <CardDescription>Messages that are sent on a recurring schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledMessages.filter((msg) => msg.recurring).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Next Send</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledMessages
                      .filter((msg) => msg.recurring)
                      .map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.recipient.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{message.message}</TableCell>
                          <TableCell className="capitalize">{message.recurrence_pattern}</TableCell>
                          <TableCell>{formatScheduledTime(message.scheduled_time)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteScheduledMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recurring messages set up</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setIsRecurring(true)
                      setCreateDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recurring Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
