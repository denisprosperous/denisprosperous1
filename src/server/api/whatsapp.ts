import { Router } from "express"
import type puppeteer from "puppeteer"
import { EventEmitter } from "events"
import { createClient } from "@supabase/supabase-js"
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

export default router
