"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare } from "lucide-react"

interface Conversation {
  id: string
  contact: {
    name: string
    phoneNumber: string
    avatarUrl?: string
  }
  lastMessage: {
    text: string
    timestamp: string
    isFromMe: boolean
  }
  unreadCount: number
}

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch conversations from API
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/conversations")
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Set up polling for updates
    const intervalId = setInterval(fetchConversations, 30000) // Check every 30 seconds
    return () => clearInterval(intervalId)
  }, [])

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact.phoneNumber.includes(searchQuery),
  )

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">View and manage your WhatsApp conversations.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search conversations..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <p className="text-muted-foreground">Loading conversations...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Link to={`/conversations/${conversation.contact.phoneNumber}`} key={conversation.id}>
              <Card className="hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={conversation.contact.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback>{conversation.contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.contact.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.isFromMe ? "You: " : ""}
                          {conversation.lastMessage.text}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">No conversations found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Start chatting to see conversations here"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Conversations
