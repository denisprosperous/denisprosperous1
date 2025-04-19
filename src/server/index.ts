import express from "express"
import cors from "cors"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import whatsappRoutes from "./api/whatsapp"
import contactsRoutes from "./api/contacts"
import conversationsRoutes from "./api/conversations"
import settingsRoutes from "./api/settings"
import analyticsRoutes from "./api/analytics"
import authRoutes from "./api/auth"
import webhookRoutes from "./api/webhooks"

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "../../build")))

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// API routes
app.use("/api/whatsapp", whatsappRoutes)
app.use("/api/contacts", contactsRoutes)
app.use("/api/conversations", conversationsRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/webhooks", webhookRoutes)

// Dashboard stats endpoint
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    // Get total messages
    const { count: totalMessages } = await supabase.from("messages").select("*", { count: "exact", head: true })

    // Get active chats (unique phone numbers with messages in the last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentChats } = await supabase
      .from("messages")
      .select("phone_number")
      .gt("timestamp", oneDayAgo.toISOString())
      .order("timestamp", { ascending: false })

    const activeChats = new Set(recentChats?.map((chat) => chat.phone_number)).size

    // Get pending responses (messages without a response within 5 minutes)
    const { data: pendingMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("is_from_me", false)
      .order("timestamp", { ascending: false })

    // Calculate average response time
    const { data: conversations } = await supabase.from("messages").select("*").order("timestamp", { ascending: true })

    let totalResponseTime = 0
    let responseCount = 0

    if (conversations) {
      for (let i = 1; i < conversations.length; i++) {
        const current = conversations[i]
        const previous = conversations[i - 1]

        if (current.is_from_me && !previous.is_from_me && current.phone_number === previous.phone_number) {
          const responseTime = new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()
          totalResponseTime += responseTime
          responseCount++
        }
      }
    }

    const avgResponseTime = responseCount > 0 ? Math.floor(totalResponseTime / responseCount / 1000) : 0

    // Format response time
    let responseTime = "0s"
    if (avgResponseTime > 60) {
      responseTime = `${Math.floor(avgResponseTime / 60)}m ${avgResponseTime % 60}s`
    } else if (avgResponseTime > 0) {
      responseTime = `${avgResponseTime}s`
    }

    // Count pending responses (messages without a reply within 5 minutes)
    let pendingResponses = 0
    if (pendingMessages) {
      const fiveMinutesInMs = 5 * 60 * 1000
      const messagesByPhone: Record<string, any[]> = {}

      // Group messages by phone number
      pendingMessages.forEach((msg) => {
        if (!messagesByPhone[msg.phone_number]) {
          messagesByPhone[msg.phone_number] = []
        }
        messagesByPhone[msg.phone_number].push(msg)
      })

      // Check each conversation for pending responses
      Object.values(messagesByPhone).forEach((messages) => {
        // Sort by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // If the most recent message is from user and was sent more than 5 minutes ago
        if (messages[0] && !messages[0].is_from_me) {
          const messageTime = new Date(messages[0].timestamp).getTime()
          const now = Date.now()

          if (
            now - messageTime > fiveMinutesInMs &&
            !messages.find((m) => m.is_from_me && new Date(m.timestamp).getTime() > messageTime)
          ) {
            pendingResponses++
          }
        }
      })
    }

    res.json({
      totalMessages: totalMessages || 0,
      activeChats,
      responseTime,
      pendingResponses,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// Add endpoint to get contact by phone number
app.get("/api/contacts/phone/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const { data, error } = await supabase.from("contacts").select("*").eq("phone_number", phoneNumber).single()

    if (error) {
      // If no contact found, return a default structure
      if (error.code === "PGRST116") {
        return res.json({
          id: "unknown",
          name: phoneNumber,
          phone_number: phoneNumber,
        })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error("Error fetching contact by phone number:", error)
    res.status(500).json({ error: "Failed to fetch contact" })
  }
})

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../build", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
