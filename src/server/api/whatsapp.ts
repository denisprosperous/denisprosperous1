import { Router } from "express"
import type puppeteer from "puppeteer"
import { EventEmitter } from "events"
import { OpenAI } from "openai"
import { createClient } from "@supabase/supabase-js"
import { decrypt } from "../utils/encryption"
import whatsAppService from "../services/whatsapp-service"

const router = Router()
const browser: puppeteer.Browser | null = null
const page: puppeteer.Page | null = null
const whatsappEvents = new EventEmitter()
const isAuthenticated = false
const isMonitoring = false

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Start WhatsApp session
router.post("/start-session", async (req, res) => {
  try {
    const qrCode = await whatsAppService.startSession()
    res.json({ qrCode })
  } catch (error) {
    console.error("Error starting WhatsApp session:", error)
    res.status(500).json({ error: "Failed to start WhatsApp session" })
  }
})

// Check session status
router.get("/session-status", (req, res) => {
  res.json({ authenticated: whatsAppService.isWhatsAppAuthenticated() })
})

// Start monitoring for messages
router.post("/start", async (req, res) => {
  try {
    if (!whatsAppService.isWhatsAppAuthenticated()) {
      return res.status(400).json({ error: "WhatsApp is not authenticated" })
    }

    if (whatsAppService.isMonitoringActive()) {
      return res.json({ status: "Monitoring already active" })
    }

    await whatsAppService.startMonitoring(req.body.apiKey, req.body.passphrase)
    res.json({ status: "Monitoring started" })
  } catch (error) {
    console.error("Error starting monitoring:", error)
    res.status(500).json({ error: "Failed to start monitoring" })
  }
})

// Stop monitoring
router.post("/stop", (req, res) => {
  whatsAppService.stopMonitoring()
  res.json({ status: "Monitoring stopped" })
})

// Check WhatsApp status
router.get("/status", (req, res) => {
  res.json({
    connected: whatsAppService.isWhatsAppAuthenticated(),
    monitoring: whatsAppService.isMonitoringActive(),
  })
})

// Helper function to set up message monitoring
async function setupMessageMonitoring(page: puppeteer.Page, encryptedApiKey: string, passphrase: string) {
  // Set up a mutation observer to detect new messages
  await page.evaluate(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          // Check if the added node is a new message
          const newMessages = Array.from(mutation.addedNodes).filter(
            (node) =>
              node instanceof HTMLElement &&
              node.classList.contains("message-in") &&
              !node.classList.contains("processed"),
          )

          if (newMessages.length) {
            for (const message of newMessages) {
              if (message instanceof HTMLElement) {
                // Mark as processed to avoid duplicate processing
                message.classList.add("processed")

                // Extract message data
                const messageText = message.querySelector(".selectable-text")?.textContent
                const senderElement = document.querySelector(".chat-title")
                const senderName = senderElement ? senderElement.textContent : "Unknown"

                if (messageText) {
                  // Send message data to backend
                  window.postMessage(
                    {
                      type: "NEW_WHATSAPP_MESSAGE",
                      data: {
                        sender: senderName,
                        message: messageText,
                        timestamp: new Date().toISOString(),
                      },
                    },
                    "*",
                  )
                }
              }
            }
          }
        }
      }
    })

    // Start observing the chat container
    const chatContainer = document.querySelector(".app-wrapper-web")
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true })
    }
  })

  // Listen for messages from the page
  page.on("console", async (msg) => {
    if (msg.text().startsWith("NEW_WHATSAPP_MESSAGE:")) {
      try {
        const messageData = JSON.parse(msg.text().replace("NEW_WHATSAPP_MESSAGE:", ""))

        // Store message in database
        await supabase.from("messages").insert({
          sender_name: messageData.sender,
          phone_number: messageData.phone || "unknown",
          message: messageData.message,
          timestamp: messageData.timestamp,
          is_from_me: false,
        })

        if (isMonitoring && encryptedApiKey) {
          // Process with AI and respond
          await processAndRespond(page, messageData, encryptedApiKey, passphrase)
        }
      } catch (error) {
        console.error("Error processing message:", error)
      }
    }
  })

  // Set up listener for page messages
  await page.exposeFunction("receiveMessage", async (data: any) => {
    console.log("NEW_WHATSAPP_MESSAGE:", JSON.stringify(data))
  })

  await page.evaluate(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "NEW_WHATSAPP_MESSAGE") {
        // @ts-ignore
        window.receiveMessage(event.data.data)
      }
    })
  })
}

// Process message with AI and respond
async function processAndRespond(
  page: puppeteer.Page,
  messageData: { sender: string; message: string; timestamp: string; phone?: string },
  encryptedApiKey: string,
  passphrase: string,
) {
  try {
    // Decrypt API key
    const apiKey = await decrypt(encryptedApiKey, passphrase)

    if (!apiKey) {
      console.error("Could not decrypt API key")
      return
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey })

    // Get conversation history
    const { data: conversationHistory } = await supabase
      .from("messages")
      .select("*")
      .eq("phone_number", messageData.phone || "unknown")
      .order("timestamp", { ascending: true })
      .limit(10)

    // Format conversation for AI
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant responding to WhatsApp messages. Be concise, friendly, and helpful. If you don't know something, say so. Remember information about the people you're talking to.",
      },
      ...(conversationHistory || []).map((msg) => ({
        role: msg.is_from_me ? "assistant" : "user",
        content: msg.message,
      })),
      {
        role: "user",
        content: messageData.message,
      },
    ]

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (aiResponse) {
      // Send response in WhatsApp
      await page.evaluate((response) => {
        const inputField = document.querySelector('[contenteditable="true"]')
        if (inputField) {
          // Set input field value
          inputField.textContent = response

          // Dispatch input event
          inputField.dispatchEvent(new Event("input", { bubbles: true }))

          // Click send button
          setTimeout(() => {
            const sendButton = document.querySelector('[data-testid="send"]')
            if (sendButton) {
              ;(sendButton as HTMLElement).click()
            }
          }, 500)
        }
      }, aiResponse)

      // Store AI response in database
      await supabase.from("messages").insert({
        sender_name: "AI Assistant",
        phone_number: messageData.phone || "unknown",
        message: aiResponse,
        timestamp: new Date().toISOString(),
        is_from_me: true,
      })
    }
  } catch (error) {
    console.error("Error processing with AI:", error)
  }
}

export default router
