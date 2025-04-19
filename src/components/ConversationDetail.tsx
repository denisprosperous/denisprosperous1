"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, Send, Paperclip, MoreVertical, FileText, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@supabase/supabase-js"

interface Message {
  id: string
  sender_name: string
  phone_number: string
  message: string
  timestamp: string
  is_from_me: boolean
  read: boolean
}

interface Contact {
  id: string
  name: string
  phone_number: string
  avatar_url?: string
}

interface Template {
  id: string
  name: string
  content: string
  category: string
}

const ConversationDetail = () => {
  const { phoneNumber } = useParams<{ phoneNumber: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [apiKey] = useLocalStorage<string | null>("encrypted-api-key", null)
  const [passphrase, setPassphrase] = useState<string>("")
  const [showPassphraseInput, setShowPassphraseInput] = useState<boolean>(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [showTemplates, setShowTemplates] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Initialize Supabase client
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ""
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch contact and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch contact info
        const contactResponse = await fetch(`/api/contacts/phone/${phoneNumber}`)
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          setContact(contactData)
        }

        // Fetch messages
        const messagesResponse = await fetch(`/api/conversations/${phoneNumber}/messages`)
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          setMessages(messagesData)
        }

        // Fetch templates
        const { data: templatesData } = await supabase.from("templates").select("*")
        if (templatesData) {
          setTemplates(templatesData)
        }
      } catch (error) {
        console.error("Error fetching conversation data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load conversation data. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (phoneNumber) {
      fetchData()
    }

    // Set up polling for new messages
    const intervalId = setInterval(() => {
      if (phoneNumber) {
        fetchNewMessages()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(intervalId)
  }, [phoneNumber, toast])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch only new messages
  const fetchNewMessages = async () => {
    if (!phoneNumber || messages.length === 0) return

    try {
      const lastMessageTime = messages[messages.length - 1].timestamp
      const response = await fetch(`/api/conversations/${phoneNumber}/messages?after=${lastMessageTime}`)

      if (response.ok) {
        const newMessages = await response.json()
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages])
        }
      }
    } catch (error) {
      console.error("Error fetching new messages:", error)
    }
  }

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !phoneNumber) return

    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your OpenAI API key in the Settings page before sending messages.",
      })
      return
    }

    if (!passphrase && !showPassphraseInput) {
      setShowPassphraseInput(true)
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${phoneNumber}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          apiKey,
          passphrase,
        }),
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages((prev) => [...prev, sentMessage])
        setNewMessage("")
        setShowPassphraseInput(false)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: "Could not send your message. Please try again.",
      })
    } finally {
      setSending(false)
    }
  }

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a")
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = format(new Date(message.timestamp), "MMMM d, yyyy")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Apply template to message
  const applyTemplate = (template: Template) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/conversations")} className="mr-2">
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

export default ConversationDetail
