import { Router } from "express"
import analyticsService from "../services/analytics-service"

const router = Router()

// Get dashboard summary
router.get("/summary", async (req, res) => {
  try {
    const summary = await analyticsService.getDashboardSummary()
    res.json(summary)
  } catch (error) {
    console.error("Error getting dashboard summary:", error)
    res.status(500).json({ error: "Failed to get dashboard summary" })
  }
})

// Get message analytics
router.get("/messages", async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" })
    }

    const data = await analyticsService.getMessageAnalytics(startDate as string, endDate as string)
    res.json(data)
  } catch (error) {
    console.error("Error getting message analytics:", error)
    res.status(500).json({ error: "Failed to get message analytics" })
  }
})

// Get response time analytics
router.get("/response-times", async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" })
    }

    const data = await analyticsService.getResponseTimeAnalytics(startDate as string, endDate as string)
    res.json(data)
  } catch (error) {
    console.error("Error getting response time analytics:", error)
    res.status(500).json({ error: "Failed to get response time analytics" })
  }
})

// Get engagement analytics
router.get("/engagement", async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" })
    }

    const data = await analyticsService.getEngagementAnalytics(startDate as string, endDate as string)
    res.json(data)
  } catch (error) {
    console.error("Error getting engagement analytics:", error)
    res.status(500).json({ error: "Failed to get engagement analytics" })
  }
})

// Get template analytics
router.get("/templates", async (req, res) => {
  try {
    const { startDate, endDate, templateId } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" })
    }

    const data = await analyticsService.getTemplateAnalytics(
      startDate as string,
      endDate as string,
      templateId as string,
    )
    res.json(data)
  } catch (error) {
    console.error("Error getting template analytics:", error)
    res.status(500).json({ error: "Failed to get template analytics" })
  }
})

export default router
