import { Router } from "express"
import webhookService from "../services/webhook-service"
import { authenticate, authorizeTeam } from "../middleware/auth-middleware"

const router = Router()

// Create a webhook
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, url, events, secret } = req.body
    const teamId = req.teamId

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" })
    }

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Name, URL, and at least one event are required" })
    }

    const result = await webhookService.createWebhook(teamId, name, url, events, secret)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.status(201).json({
      message: result.message,
      webhookId: result.webhookId,
    })
  } catch (error) {
    console.error("Error creating webhook:", error)
    res.status(500).json({ error: "Failed to create webhook" })
  }
})

// Update a webhook
router.put("/:webhookId", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { webhookId } = req.params
    const { name, url, events, secret, active } = req.body

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (url !== undefined) updates.url = url
    if (events !== undefined) updates.events = events
    if (secret !== undefined) updates.secret = secret
    if (active !== undefined) updates.active = active

    const result = await webhookService.updateWebhook(webhookId, updates)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Error updating webhook:", error)
    res.status(500).json({ error: "Failed to update webhook" })
  }
})

// Delete a webhook
router.delete("/:webhookId", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { webhookId } = req.params

    const result = await webhookService.deleteWebhook(webhookId)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    res.status(500).json({ error: "Failed to delete webhook" })
  }
})

// Get team webhooks
router.get("/", authenticate, async (req, res) => {
  try {
    const teamId = req.teamId

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" })
    }

    const webhooks = await webhookService.getTeamWebhooks(teamId)
    res.json(webhooks)
  } catch (error) {
    console.error("Error getting webhooks:", error)
    res.status(500).json({ error: "Failed to get webhooks" })
  }
})

// Get webhook logs
router.get("/:webhookId/logs", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { webhookId } = req.params
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 50

    const logs = await webhookService.getWebhookLogs(webhookId, limit)
    res.json(logs)
  } catch (error) {
    console.error("Error getting webhook logs:", error)
    res.status(500).json({ error: "Failed to get webhook logs" })
  }
})

// Test a webhook
router.post("/:webhookId/test", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { webhookId } = req.params

    const result = await webhookService.testWebhook(webhookId)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Error testing webhook:", error)
    res.status(500).json({ error: "Failed to test webhook" })
  }
})

export default router
