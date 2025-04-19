import { Router } from "express"
import { createClient } from "@supabase/supabase-js"
import whatsAppService from "../services/whatsapp-service"

const router = Router()

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Get all conversations
router.get("/", async (req, res) => {
  try {
    // Get all unique phone numbers with messages
    const { data: phoneNumbers } = await supabase
      .from("messages")
      .select("phone_number")
      .order("timestamp", { ascending: false })

    const uniquePhoneNumbers = [...new Set(phoneNumbers?.map((item) => item.phone_number))]

    // Get conversation data for each phone number
    const conversations = await Promise.all(
      uniquePhoneNumbers.map(async (phoneNumber) => {
        // Get the most recent message
        const { data: recentMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("phone_number", phoneNumber)
          .order("timestamp", { ascending: false })
          .limit(1)

        // Get contact info
        const { data: contactInfo } = await supabase
          .from("contacts")
          .select("*")
          .eq("phone_number", phoneNumber)
          .limit(1)

        // Get unread count
        const { data: unreadMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("phone_number", phoneNumber)
          .eq("is_from_me", false)
          .eq("read", false)

        const lastMessage = recentMessages?.[0]
        const contact = contactInfo?.[0]

        return {
          id: phoneNumber,
          contact: {
            name: contact?.name || lastMessage?.sender_name || "Unknown",
            phoneNumber,
            avatarUrl: contact?.avatar_url,
          },
          lastMessage: {
            text: lastMessage?.message || "",
            timestamp: lastMessage?.timestamp || new Date().toISOString(),
            isFromMe: lastMessage?.is_from_me || false,
          },
          unreadCount: unreadMessages?.length || 0,
        }
      }),
    )

    res.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ error: "Failed to fetch conversations" })
  }
})

// Get messages for a specific conversation
router.get("/:phoneNumber/messages", async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const { after } = req.query

    let query = supabase
      .from("messages")
      .select("*")
      .eq("phone_number", phoneNumber)
      .order("timestamp", { ascending: true })

    // If after parameter is provided, only get messages after that timestamp
    if (after) {
      query = query.gt("timestamp", after as string)
    }

    const { data, error } = await query

    if (error) throw error

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("phone_number", phoneNumber)
      .eq("is_from_me", false)
      .eq("read", false)

    res.json(data || [])
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

// Send a message
router.post("/:phoneNumber/send", async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const { message, apiKey, passphrase } = req.body

    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    if (!whatsAppService.isWhatsAppAuthenticated()) {
      return res.status(400).json({ error: "WhatsApp is not authenticated" })
    }

    // Send message via WhatsApp
    const success = await whatsAppService.sendMessage(phoneNumber, message, apiKey, passphrase)

    if (!success) {
      throw new Error("Failed to send message")
    }

    // Store message in database
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_name: "You",
        phone_number: phoneNumber,
        message,
        timestamp: new Date().toISOString(),
        is_from_me: true,
        read: true,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
})

export default router
