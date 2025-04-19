import puppeteer, { type Browser, type Page } from "puppeteer"
import { EventEmitter } from "events"
import { createClient } from "@supabase/supabase-js"
import { decrypt } from "../utils/encryption"
import { OpenAI } from "openai"
import localLLMService from "./local-llm-service"
import analyticsService from "./analytics-service"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

class WhatsAppService {
  private browser: Browser | null = null
  private page: Page | null = null
  private isAuthenticated = false
  private isMonitoring = false
  private events: EventEmitter = new EventEmitter()
  private messageObserver: any = null

  constructor() {
    // Set up event listeners
    this.events.on("authenticated", () => {
      console.log("WhatsApp authenticated")
      this.isAuthenticated = true
    })
  }

  /**
   * Start a WhatsApp session and return the QR code
   */
  async startSession(): Promise<string> {
    try {
      // Close any existing browser instance
      if (this.browser) {
        await this.browser.close()
        this.browser = null
        this.page = null
        this.isAuthenticated = false
      }

      // Launch a new browser instance
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })

      // Create a new page
      this.page = await this.browser.newPage()

      // Navigate to WhatsApp Web
      await this.page.goto("https://web.whatsapp.com/")

      // Wait for QR code to appear
      await this.page.waitForSelector("canvas", { timeout: 60000 })

      // Get QR code data
      const qrCodeData = await this.page.evaluate(() => {
        const canvas = document.querySelector("canvas")
        return canvas ? canvas.toDataURL() : null
      })

      if (!qrCodeData) {
        throw new Error("Could not get QR code")
      }

      // Set up authentication check
      this.setupAuthenticationCheck()

      return qrCodeData
    } catch (error) {
      console.error("Error starting WhatsApp session:", error)
      throw new Error("Failed to start WhatsApp session")
    }
  }

  /**
   * Check if WhatsApp is authenticated
   */
  isWhatsAppAuthenticated(): boolean {
    return this.isAuthenticated
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring
  }

  /**
   * Start monitoring for new messages
   */
  async startMonitoring(encryptedApiKey: string, passphrase: string): Promise<void> {
    if (!this.isAuthenticated || !this.page) {
      throw new Error("WhatsApp is not authenticated")
    }

    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    await this.setupMessageMonitoring(encryptedApiKey, passphrase)
  }

  /**
   * Stop monitoring for new messages
   */
  stopMonitoring(): void {
    this.isMonitoring = false
  }

  /**
   * Close the browser and clean up
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
      this.isAuthenticated = false
      this.isMonitoring = false
    }
  }

  /**
   * Send a message to a specific phone number
   */
  async sendMessage(
    phoneNumber: string,
    message: string,
    encryptedApiKey: string,
    passphrase: string,
  ): Promise<boolean> {
    if (!this.isAuthenticated || !this.page) {
      return false
    }

    try {
      // First, open the chat with the phone number
      await this.page.evaluate((phone) => {
        // This is a simplified approach - in a real app, you'd need to handle this more robustly
        const searchBox = document.querySelector('[data-testid="chat-list-search"]')
        if (searchBox) {
          // Click the search box
          ;(searchBox as HTMLElement).click()

          // Type the phone number
          const input = document.querySelector('[contenteditable="true"]')
          if (input) {
            input.textContent = phone
            input.dispatchEvent(new Event("input", { bubbles: true }))

            // Wait a bit and click the first result
            setTimeout(() => {
              const firstResult = document.querySelector('[data-testid="cell-frame-container"]')
              if (firstResult) {
                ;(firstResult as HTMLElement).click()
              }
            }, 1000)
          }
        }
      }, phoneNumber)

      // Wait for the chat to open
      await this.page.waitForSelector('[data-testid="conversation-panel-wrapper"]', { timeout: 5000 })

      // Send the message
      await this.page.evaluate((text) => {
        const inputField = document.querySelector('[contenteditable="true"]')
        if (inputField) {
          // Set input field value
          inputField.textContent = text

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
      }, message)

      return true
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  }

  /**
   * Set up authentication check
   */
  private setupAuthenticationCheck(): void {
    if (!this.page) return

    // Check for authentication
    this.page.on("load", async () => {
      const authenticated = await this.page?.evaluate(() => {
        return document.querySelector('[data-testid="chat-list"]') !== null
      })

      if (authenticated && !this.isAuthenticated) {
        this.isAuthenticated = true
        this.events.emit("authenticated")
      }
    })

    // Also check periodically
    const checkInterval = setInterval(async () => {
      if (!this.page) {
        clearInterval(checkInterval)
        return
      }

      try {
        const authenticated = await this.page.evaluate(() => {
          return document.querySelector('[data-testid="chat-list"]') !== null
        })

        if (authenticated && !this.isAuthenticated) {
          this.isAuthenticated = true
          this.events.emit("authenticated")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }, 5000)
  }

  /**
   * Set up message monitoring
   */
  private async setupMessageMonitoring(encryptedApiKey: string, passphrase: string): Promise<void> {
    if (!this.page) return

    // Get AI settings
    const { data: aiSettingsData } = await supabase.from("settings").select("value").eq("key", "ai_settings").single()

    const aiSettings = aiSettingsData?.value || {
      systemPrompt: "You are a helpful assistant responding to WhatsApp messages.",
      autoRespond: true,
      rememberContext: true,
      maxTokens: 500,
      temperature: 0.7,
      model: "gpt-3.5-turbo",
      useLocalLLM: false,
    }

    // Set up a mutation observer to detect new messages
    await this.page.evaluate(() => {
      // Remove any existing observer
      if (window.messageObserver) {
        window.messageObserver.disconnect()
      }

      // Create a new observer
      window.messageObserver = new MutationObserver((mutations) => {
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
                  const phoneElement = document.querySelector("[title]")
                  const phoneNumber = phoneElement ? phoneElement.getAttribute("title") : "Unknown"

                  if (messageText) {
                    // Send message data to backend
                    window.postMessage(
                      {
                        type: "NEW_WHATSAPP_MESSAGE",
                        data: {
                          sender: senderName,
                          phone: phoneNumber,
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
        window.messageObserver.observe(chatContainer, { childList: true, subtree: true })
      }
    })

    // Listen for messages from the page
    this.page.on("console", async (msg) => {
      const text = msg.text()
      if (text.includes("NEW_WHATSAPP_MESSAGE:")) {
        try {
          const messageDataStr = text.replace("NEW_WHATSAPP_MESSAGE:", "").trim()
          const messageData = JSON.parse(messageDataStr)

          console.log("Received message:", messageData)

          // Store message in database
          await supabase.from("messages").insert({
            sender_name: messageData.sender,
            phone_number: messageData.phone || "unknown",
            message: messageData.message,
            timestamp: messageData.timestamp,
            is_from_me: false,
          })

          // Only auto-respond if the setting is enabled
          if (this.isMonitoring && aiSettings.autoRespond) {
            // Process with AI and respond
            if (aiSettings.useLocalLLM) {
              await this.processWithLocalLLM(messageData, aiSettings)
            } else {
              await this.processWithOpenAI(messageData, encryptedApiKey, passphrase, aiSettings)
            }
          }
        } catch (error) {
          console.error("Error processing message:", error)
        }
      }
    })

    // Set up listener for page messages
    await this.page.exposeFunction("receiveMessage", async (data: any) => {
      console.log("NEW_WHATSAPP_MESSAGE:", JSON.stringify(data))
    })

    await this.page.evaluate(() => {
      window.addEventListener("message", (event) => {
        if (event.data.type === "NEW_WHATSAPP_MESSAGE") {
          // @ts-ignore
          window.receiveMessage(event.data.data)
        }
      })
    })
  }

  /**
   * Process message with OpenAI and respond
   */
  private async processWithOpenAI(
    messageData: { sender: string; message: string; timestamp: string; phone?: string },
    encryptedApiKey: string,
    passphrase: string,
    aiSettings: any,
  ): Promise<void> {
    if (!this.page) return

    try {
      // Track incoming message for analytics
      await analyticsService.trackMessage(true, false, null)

      const startTime = Date.now()

      // Decrypt API key
      const apiKey = await decrypt(encryptedApiKey, passphrase)

      if (!apiKey) {
        console.error("Could not decrypt API key")
        return
      }

      // Initialize OpenAI
      const openai = new OpenAI({ apiKey })

      // Get conversation history
      let conversationHistory = []
      if (aiSettings.rememberContext) {
        const { data: history } = await supabase
          .from("messages")
          .select("*")
          .eq("phone_number", messageData.phone || "unknown")
          .order("timestamp", { ascending: true })
          .limit(10)

        conversationHistory = history || []
      }

      // Get contact information
      const { data: contactInfo } = await supabase
        .from("contacts")
        .select("*")
        .eq("phone_number", messageData.phone || "unknown")
        .limit(1)

      // If contact doesn't exist, create one
      if (!contactInfo || contactInfo.length === 0) {
        await supabase.from("contacts").insert({
          name: messageData.sender,
          phone_number: messageData.phone || "unknown",
        })
      }

      // Format conversation for AI
      const messages = [
        {
          role: "system",
          content: aiSettings.systemPrompt || "You are a helpful assistant responding to WhatsApp messages.",
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
        model: aiSettings.model || "gpt-3.5-turbo",
        messages: messages as any,
        max_tokens: aiSettings.maxTokens || 500,
        temperature: aiSettings.temperature || 0.7,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (aiResponse) {
        // Send response in WhatsApp
        await this.page.evaluate((response) => {
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

        // Calculate response time and track analytics
        const responseTime = (Date.now() - startTime) / 1000
        await analyticsService.trackResponseTime(responseTime)
        await analyticsService.trackMessage(false, true, null)

        // Track conversation engagement
        const isNewConversation = conversationHistory.length === 0
        await analyticsService.trackConversationEngagement(
          isNewConversation,
          conversationHistory.length + 2, // +2 for the new message and response
          responseTime,
        )
      }
    } catch (error) {
      console.error("Error processing with OpenAI:", error)
    }
  }

  /**
   * Process message with local LLM and respond
   */
  private async processWithLocalLLM(
    messageData: { sender: string; message: string; timestamp: string; phone?: string },
    aiSettings: any,
  ): Promise<void> {
    if (!this.page) return

    try {
      // Check if local LLM is available
      if (!localLLMService.isModelLoaded()) {
        console.error("Local LLM model not loaded")
        return
      }

      // Get response from local LLM
      const aiResponse = await localLLMService.processMessage(messageData, aiSettings)

      if (aiResponse) {
        // Send response in WhatsApp
        await this.page.evaluate((response) => {
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
          sender_name: "AI Assistant (Local)",
          phone_number: messageData.phone || "unknown",
          message: aiResponse,
          timestamp: new Date().toISOString(),
          is_from_me: true,
        })
      }
    } catch (error) {
      console.error("Error processing with local LLM:", error)
    }
  }
}

// Add type definition for window
declare global {
  interface Window {
    messageObserver: MutationObserver
  }
}

// Create a singleton instance
const whatsAppService = new WhatsAppService()

export default whatsAppService
