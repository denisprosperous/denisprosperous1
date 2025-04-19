import { createClient } from "@supabase/supabase-js"
import { CronJob } from "cron"
import whatsAppService from "./whatsapp-service"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

class SchedulingService {
  private schedulerJob: CronJob | null = null

  constructor() {
    // Initialize the scheduler
    this.initScheduler()
  }

  /**
   * Initialize the scheduler
   */
  private initScheduler() {
    // Check for scheduled messages every minute
    this.schedulerJob = new CronJob("* * * * *", async () => {
      await this.processScheduledMessages()
    })

    // Start the job
    this.schedulerJob.start()
    console.log("Message scheduler initialized")
  }

  /**
   * Process scheduled messages
   */
  private async processScheduledMessages() {
    try {
      const now = new Date()

      // Get scheduled messages that are due
      const { data: scheduledMessages, error } = await supabase
        .from("scheduled_messages")
        .select("*, teams(id, name)")
        .eq("status", "pending")
        .lte("next_run", now.toISOString())
        .order("next_run", { ascending: true })

      if (error) throw error

      if (!scheduledMessages || scheduledMessages.length === 0) {
        return
      }

      console.log(`Processing ${scheduledMessages.length} scheduled messages`)

      // Process each scheduled message
      for (const message of scheduledMessages) {
        await this.sendScheduledMessage(message)
      }
    } catch (error) {
      console.error("Error processing scheduled messages:", error)
    }
  }

  /**
   * Send a scheduled message
   */
  private async sendScheduledMessage(scheduledMessage: any) {
    try {
      // Get team settings
      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "api_key")
        .eq("team_id", scheduledMessage.team_id)
        .single()

      if (!settings || !settings.value.encryptedApiKey || !settings.value.passphrase) {
        throw new Error("API key not found for team")
      }

      // Check if WhatsApp is authenticated
      if (!whatsAppService.isWhatsAppAuthenticated()) {
        throw new Error("WhatsApp is not authenticated")
      }

      // Send the message
      const success = await whatsAppService.sendMessage(
        scheduledMessage.phone_number,
        scheduledMessage.message,
        settings.value.encryptedApiKey,
        settings.value.passphrase,
      )

      // Log the result
      await supabase.from("scheduled_message_logs").insert({
        scheduled_message_id: scheduledMessage.id,
        status: success ? "success" : "failed",
        error: success ? null : "Failed to send message",
      })

      // Update the scheduled message
      if (scheduledMessage.recurring) {
        // Calculate next run time based on recurrence pattern
        const nextRun = this.calculateNextRunTime(scheduledMessage)

        await supabase
          .from("scheduled_messages")
          .update({
            next_run: nextRun,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduledMessage.id)
      } else {
        // Mark as sent for non-recurring messages
        await supabase
          .from("scheduled_messages")
          .update({
            status: "sent",
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduledMessage.id)
      }
    } catch (error) {
      console.error(`Error sending scheduled message ${scheduledMessage.id}:`, error)

      // Log the error
      await supabase.from("scheduled_message_logs").insert({
        scheduled_message_id: scheduledMessage.id,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })

      // Update the scheduled message status
      await supabase
        .from("scheduled_messages")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduledMessage.id)
    }
  }

  /**
   * Calculate the next run time based on recurrence pattern
   */
  private calculateNextRunTime(scheduledMessage: any): string {
    const now = new Date()
    const nextRun = new Date(now)

    switch (scheduledMessage.recurrence_pattern) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1)
        break
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7)
        break
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1)
        break
      case "custom":
        if (scheduledMessage.recurrence_config) {
          const config = scheduledMessage.recurrence_config
          if (config.interval && config.unit) {
            switch (config.unit) {
              case "minutes":
                nextRun.setMinutes(nextRun.getMinutes() + config.interval)
                break
              case "hours":
                nextRun.setHours(nextRun.getHours() + config.interval)
                break
              case "days":
                nextRun.setDate(nextRun.getDate() + config.interval)
                break
              case "weeks":
                nextRun.setDate(nextRun.getDate() + config.interval * 7)
                break
              case "months":
                nextRun.setMonth(nextRun.getMonth() + config.interval)
                break
            }
          }
        }
        break
    }

    return nextRun.toISOString()
  }

  /**
   * Schedule a message
   */
  async scheduleMessage(
    teamId: string,
    phoneNumber: string,
    message: string,
    scheduledTime: string,
    userId: string,
    options?: {
      templateId?: string
      recurring?: boolean
      recurrencePattern?: string
      recurrenceConfig?: any
    },
  ): Promise<{ success: boolean; messageId?: string; message: string }> {
    try {
      // Validate phone number
      if (!phoneNumber) {
        return { success: false, message: "Phone number is required" }
      }

      // Validate message
      if (!message) {
        return { success: false, message: "Message is required" }
      }

      // Validate scheduled time
      if (!scheduledTime) {
        return { success: false, message: "Scheduled time is required" }
      }

      // Insert the scheduled message
      const { data, error } = await supabase
        .from("scheduled_messages")
        .insert({
          team_id: teamId,
          user_id: userId,
          phone_number: phoneNumber,
          message: message,
          template_id: options?.templateId || null,
          next_run: scheduledTime,
          status: "pending",
          recurring: options?.recurring || false,
          recurrence_pattern: options?.recurrencePattern || null,
          recurrence_config: options?.recurrenceConfig || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error scheduling message:", error)
        return { success: false, message: `Error scheduling message: ${error.message}` }
      }

      return {
        success: true,
        messageId: data.id,
        message: "Message scheduled successfully",
      }
    } catch (error) {
      console.error("Error scheduling message:", error)
      return {
        success: false,
        message: `Error scheduling message: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string, teamId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate message ID
      if (!messageId) {
        return { success: false, message: "Message ID is required" }
      }

      // Get the scheduled message
      const { data: message, error: fetchError } = await supabase
        .from("scheduled_messages")
        .select()
        .eq("id", messageId)
        .eq("team_id", teamId)
        .single()

      if (fetchError) {
        return { success: false, message: `Scheduled message not found: ${fetchError.message}` }
      }

      // Check if the message is already sent
      if (message.status === "sent") {
        return { success: false, message: "Cannot cancel a message that has already been sent" }
      }

      // Update the message status
      const { error } = await supabase
        .from("scheduled_messages")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .eq("team_id", teamId)

      if (error) {
        return { success: false, message: `Error cancelling message: ${error.message}` }
      }

      return { success: true, message: "Message cancelled successfully" }
    } catch (error) {
      console.error("Error cancelling scheduled message:", error)
      return {
        success: false,
        message: `Error cancelling message: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Get scheduled messages for a team
   */
  async getScheduledMessages(
    teamId: string,
    options?: {
      status?: string
      limit?: number
      offset?: number
    },
  ): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      let query = supabase
        .from("scheduled_messages")
        .select("*, scheduled_message_logs(*)")
        .eq("team_id", teamId)
        .order("next_run", { ascending: true })

      // Apply filters
      if (options?.status) {
        query = query.eq("status", options.status)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        return { success: false, message: `Error fetching scheduled messages: ${error.message}` }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error fetching scheduled messages:", error)
      return {
        success: false,
        message: `Error fetching scheduled messages: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Get a scheduled message by ID
   */
  async getScheduledMessage(
    messageId: string,
    teamId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const { data, error } = await supabase
        .from("scheduled_messages")
        .select("*, scheduled_message_logs(*)")
        .eq("id", messageId)
        .eq("team_id", teamId)
        .single()

      if (error) {
        return { success: false, message: `Scheduled message not found: ${error.message}` }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error fetching scheduled message:", error)
      return {
        success: false,
        message: `Error fetching scheduled message: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Update a scheduled message
   */
  async updateScheduledMessage(
    messageId: string,
    teamId: string,
    updates: {
      message?: string
      scheduledTime?: string
      recurring?: boolean
      recurrencePattern?: string
      recurrenceConfig?: any
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate message ID
      if (!messageId) {
        return { success: false, message: "Message ID is required" }
      }

      // Get the scheduled message
      const { data: message, error: fetchError } = await supabase
        .from("scheduled_messages")
        .select()
        .eq("id", messageId)
        .eq("team_id", teamId)
        .single()

      if (fetchError) {
        return { success: false, message: `Scheduled message not found: ${fetchError.message}` }
      }

      // Check if the message is already sent
      if (message.status === "sent") {
        return { success: false, message: "Cannot update a message that has already been sent" }
      }

      // Prepare update object
      const updateObj: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.message) {
        updateObj.message = updates.message
      }

      if (updates.scheduledTime) {
        updateObj.next_run = updates.scheduledTime
      }

      if (updates.recurring !== undefined) {
        updateObj.recurring = updates.recurring
      }

      if (updates.recurrencePattern) {
        updateObj.recurrence_pattern = updates.recurrencePattern
      }

      if (updates.recurrenceConfig) {
        updateObj.recurrence_config = updates.recurrenceConfig
      }

      // Update the message
      const { error } = await supabase
        .from("scheduled_messages")
        .update(updateObj)
        .eq("id", messageId)
        .eq("team_id", teamId)

      if (error) {
        return { success: false, message: `Error updating message: ${error.message}` }
      }

      return { success: true, message: "Message updated successfully" }
    } catch (error) {
      console.error("Error updating scheduled message:", error)
      return {
        success: false,
        message: `Error updating message: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Stop the scheduler
   */
  stopScheduler() {
    if (this.schedulerJob) {
      this.schedulerJob.stop()
      console.log("Message scheduler stopped")
    }
  }
}

// Create and export a singleton instance
const schedulingService = new SchedulingService()
export default schedulingService
