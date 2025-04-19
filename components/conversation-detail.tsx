"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, Send, Paperclip, MoreVertical, FileText, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockConversationMessages, mockContacts, mockTemplates } from "@/lib/mock-data"

interface ConversationDetailProps {
  phoneNumber: string
}

export function ConversationDetail({ phoneNumber }: ConversationDetailProps) {
  const [contact, setContact] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPassphraseInput, setShowPassphraseInput] = useState<boolean>(false)
  const [passphrase, setPassphrase] = useState<string>("")
  const [templates, setTemplates] = useState<any[]>([])
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Simulate loading contact and messages
    const timer = setTimeout(() => {
      // Find contact
      const foundContact = mockContacts.find((c) => c.phone_number === phoneNumber)
      if (foundContact) {
        setContact(foundContact)
      } else {
        setContact({
          id: "unknown",
          name: phoneNumber,
          phone_number: phoneNumber,
        })
      }

      // Get messages
      const conversationMessages = mockConversationMessages[phoneNumber] || []
      setMessages(conversationMessages)

      // Get templates
      setTemplates(mockTemplates)

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [phoneNumber])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    if (!passphrase && showPassphraseInput) {
      toast({
        variant: "destructive",
        title: "Passphrase Required",
        description: "Please enter your passphrase to send messages.",
      })
      return
    }

    if (!passphrase && !showPassphraseInput) {
      setShowPassphraseInput(true)
      return
    }

    setSending(true)

    // Simulate sending message
    setTimeout(() => {
      const newMsg = {
        id: `new-${Date.now()}`,
        sender_name: "You",
        phone_number: phoneNumber,
        message: newMessage,
        timestamp: new Date().toISOString(),
        is_from_me: true,
        read: true,
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")
      setShowPassphraseInput(false)
      setSending(false)

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse = {
          id: `ai-${Date.now()}`,
          sender_name: "AI Assistant",
          phone_number: phoneNumber,
          message: `Thank you for your message. This is an automated response for demonstration purposes.`,
          timestamp: new Date().toISOString(),
          is_from_me: true,
          read: true,
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 2000)
    }, 1000)
  }

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a")
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, any[]>, message) => {
    const date = format(new Date(message.timestamp), "MMMM d, yyyy")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Apply template to message
  const applyTemplate = (template: any) => {
    let content = template.content

    // Replace placeholders with actual values
    if (contact) {
      content = content.replace(/{{name}}/g, contact.name)
      content = content.replace(/{{phone}}/g, contact.phone_number)
    }

    setNewMessage(content)
    setShowTemplates(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/conversations")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {contact ? (
          <div className="flex items-center flex-1">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{contact.name}</h2>
              <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-1">
            <div className="h-10 w-10 rounded-full bg-muted mr-3"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{date}</span>
              </div>
              {dateMessages.map((message) => (
                <div key={message.id} className={`flex ${message.is_from_me ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.is_from_me ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                    <div
                      className={`text-xs mt-1 flex justify-end ${
                        message.is_from_me ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {showPassphraseInput ? (
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!passphrase || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
            <Button variant="outline" onClick={() => setShowPassphraseInput(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {showTemplates && (
              <div className="bg-background border rounded-md p-2 max-h-40 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Templates</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => applyTemplate(template)}
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{template.content}</div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No templates available</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setShowTemplates(!showTemplates)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim() || sending} className="shrink-0">
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
