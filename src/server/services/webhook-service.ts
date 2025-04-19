import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import fetch from "node-fetch"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

class WebhookService {
  /**
   * Create a new webhook
   */
  async createWebhook(
    teamId: string,
    name: string,
    url: string,
    events: string[],
    secret?: string,
  ): Promise<{ success: boolean; webhookId?: string; message: string }> {
    try {
      // Validate URL
      try {
        new URL(url)
      } catch (error) {
        return { success: false, message: "Invalid URL" }
      }

      // Validate events
      const validEvents = ["message.received", "message.sent", "contact.created", "contact.updated", "template.used"]
      const invalidEvents = events.filter((event) => !validEvents.includes(event))
      if (invalidEvents.length > 0) {
        return {
          success: false,
          message: `Invalid events: ${invalidEvents.join(", ")}`,
        }
      }

      // Create webhook
      const { data, error } = await supabase
        .from("webhooks")
        .insert({
          team_id: teamId,
          name,
          url,
          secret,
          events,
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        webhookId: data.id,
        message: "Webhook created successfully",
      }
    } catch (error) {
      console.error("Error creating webhook:", error)
      return { success: false, message: "Failed to create webhook" }
    }
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: {
      name?: string
      url?: string
      events?: string[]
      secret?: string
      active?: boolean
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate URL if provided
      if (updates.url) {
        try {
          new URL(updates.url)
        } catch (error) {
          return { success: false, message: "Invalid URL" }
        }
      }

      // Validate events if provided
      if (updates.events) {
        const validEvents = ["message.received", "message.sent", "contact.created", "contact.updated", "template.used"]
        const invalidEvents = updates.events.filter((event) => !validEvents.includes(event))
        if (invalidEvents.length > 0) {
          return {
            success: false,
            message: `Invalid events: ${invalidEvents.join(", ")}`,
          }
        }
      }

      // Update webhook
      const { error } = await supabase
        .from("webhooks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhookId)

      if (error) throw error

      return { success: true, message: "Webhook updated successfully" }
    } catch (error) {
      console.error("Error updating webhook:", error)
      return { success: false, message: "Failed to update webhook" }
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from("webhooks").delete().eq("id", webhookId)

      if (error) throw error

      return { success: true, message: "Webhook deleted successfully" }
    } catch (error) {
      console.error("Error deleting webhook:", error)
      return { success: false, message: "Failed to delete webhook" }
    }
  }

  /**
   * Get webhooks for a team
   */
  async getTeamWebhooks(teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("webhooks").select("*").eq("team_id", teamId)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error getting team webhooks:", error)
      return []
    }
  }

  /**
   * Get webhook logs
   */
  async getWebhookLogs(webhookId: string, limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error getting webhook logs:", error)
      return []
    }
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerWebhooks(teamId: string, eventType: string, payload: any): Promise<void> {
    try {
      // Get active webhooks for this team and event
      const { data: webhooks, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("team_id", teamId)
        .eq("active", true)
        .contains("events", [eventType])

      if (error) throw error

      if (!webhooks || webhooks.length === 0) return

      // Send webhook requests
      for (const webhook of webhooks) {
        this.sendWebhookRequest(webhook, eventType, payload)
      }
    } catch (error) {
      console.error("Error triggering webhooks:", error)
    }
  }

  /**
   * Send a webhook request
   */
  private async sendWebhookRequest(webhook: any, eventType: string, payload: any): Promise<void> {
    try {
      const timestamp = Date.now().toString()
      const webhookPayload = {
        id: crypto.randomUUID(),
        timestamp,
        event: eventType,
        data: payload,
      }

      // Create signature if secret is provided
      let signature
      if (webhook.secret) {
        const hmac = crypto.createHmac("sha256", webhook.secret)
        hmac.update(JSON.stringify(webhookPayload))
        signature = hmac.digest("hex")
      }

      // Send request
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature || "",
          "X-Webhook-Event": eventType,
          "X-Webhook-Id": webhookPayload.id,
          "X-Webhook-Timestamp": timestamp,
        },
        body: JSON.stringify(webhookPayload),
      })

      const responseText = await response.text()
      const success = response.ok

      // Log webhook request
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload: webhookPayload,
        response_status: response.status,
        response_body: responseText,
        success,
        error: success ? null : `HTTP ${response.status}: ${responseText}`,
      })
    } catch (error) {
      console.error("Error sending webhook request:", error)

      // Log webhook error
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Test a webhook
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get webhook
      const { data: webhook, error } = await supabase.from("webhooks").select("*").eq("id", webhookId).single()

      if (error || !webhook) {
        return { success: false, message: "Webhook not found" }
      }

      // Send test event
      const testPayload = {
        test: true,
        message: "This is a test webhook event",
        timestamp: new Date().toISOString(),
      }

      await this.sendWebhookRequest(webhook, "test", testPayload)

      return { success: true, message: "Test webhook sent successfully" }
    } catch (error) {
      console.error("Error testing webhook:", error)
      return { success: false, message: "Failed to test webhook" }
    }
  }
}

// Create a singleton instance
const webhookService = new WebhookService()

export default webhookService
