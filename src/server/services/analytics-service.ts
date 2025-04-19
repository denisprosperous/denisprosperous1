import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

class AnalyticsService {
  /**
   * Track a new message
   */
  async trackMessage(isIncoming: boolean, isAiGenerated: boolean, templateId: string | null) {
    const today = new Date().toISOString().split("T")[0]

    try {
      // Get today's record or create if it doesn't exist
      const { data: existingRecord } = await supabase.from("analytics_messages").select("*").eq("date", today).single()

      if (existingRecord) {
        // Update existing record
        await supabase
          .from("analytics_messages")
          .update({
            total_received: isIncoming ? existingRecord.total_received + 1 : existingRecord.total_received,
            total_sent: !isIncoming ? existingRecord.total_sent + 1 : existingRecord.total_sent,
            ai_generated: isAiGenerated ? existingRecord.ai_generated + 1 : existingRecord.ai_generated,
            template_used: templateId ? existingRecord.template_used + 1 : existingRecord.template_used,
          })
          .eq("id", existingRecord.id)
      } else {
        // Create new record
        await supabase.from("analytics_messages").insert({
          date: today,
          total_received: isIncoming ? 1 : 0,
          total_sent: !isIncoming ? 1 : 0,
          ai_generated: isAiGenerated ? 1 : 0,
          template_used: templateId ? 1 : 0,
        })
      }

      // If a template was used, track it
      if (templateId) {
        await this.trackTemplateUsage(templateId)
      }
    } catch (error) {
      console.error("Error tracking message analytics:", error)
    }
  }

  /**
   * Track response time
   */
  async trackResponseTime(responseTimeSeconds: number) {
    const today = new Date().toISOString().split("T")[0]

    try {
      // Get today's record or create if it doesn't exist
      const { data: existingRecord } = await supabase
        .from("analytics_response_times")
        .select("*")
        .eq("date", today)
        .single()

      if (existingRecord) {
        // Calculate new average
        const totalResponses = existingRecord.total_responses || 0
        const newTotalResponses = totalResponses + 1
        const newAvgTime =
          (existingRecord.avg_response_time_seconds * totalResponses + responseTimeSeconds) / newTotalResponses

        // Update existing record
        await supabase
          .from("analytics_response_times")
          .update({
            avg_response_time_seconds: newAvgTime,
            min_response_time_seconds: Math.min(existingRecord.min_response_time_seconds, responseTimeSeconds),
            max_response_time_seconds: Math.max(existingRecord.max_response_time_seconds, responseTimeSeconds),
            total_responses: newTotalResponses,
          })
          .eq("id", existingRecord.id)
      } else {
        // Create new record
        await supabase.from("analytics_response_times").insert({
          date: today,
          avg_response_time_seconds: responseTimeSeconds,
          min_response_time_seconds: responseTimeSeconds,
          max_response_time_seconds: responseTimeSeconds,
          total_responses: 1,
        })
      }
    } catch (error) {
      console.error("Error tracking response time analytics:", error)
    }
  }

  /**
   * Track conversation engagement
   */
  async trackConversationEngagement(isNewConversation: boolean, messageCount: number, durationSeconds: number) {
    const today = new Date().toISOString().split("T")[0]

    try {
      // Get today's record or create if it doesn't exist
      const { data: existingRecord } = await supabase
        .from("analytics_engagement")
        .select("*")
        .eq("date", today)
        .single()

      if (existingRecord) {
        // Calculate new averages
        const totalConversations = existingRecord.total_conversations || 0
        const newTotalConversations = totalConversations + 1
        const newDurationAvg =
          (existingRecord.conversation_duration_avg_seconds * totalConversations + durationSeconds) /
          newTotalConversations
        const newMessagesAvg =
          (existingRecord.messages_per_conversation_avg * totalConversations + messageCount) / newTotalConversations

        // Update existing record
        await supabase
          .from("analytics_engagement")
          .update({
            active_conversations: existingRecord.active_conversations + 1,
            new_conversations: isNewConversation
              ? existingRecord.new_conversations + 1
              : existingRecord.new_conversations,
            conversation_duration_avg_seconds: newDurationAvg,
            messages_per_conversation_avg: newMessagesAvg,
            total_conversations: newTotalConversations,
          })
          .eq("id", existingRecord.id)
      } else {
        // Create new record
        await supabase.from("analytics_engagement").insert({
          date: today,
          active_conversations: 1,
          new_conversations: isNewConversation ? 1 : 0,
          conversation_duration_avg_seconds: durationSeconds,
          messages_per_conversation_avg: messageCount,
          total_conversations: 1,
        })
      }
    } catch (error) {
      console.error("Error tracking engagement analytics:", error)
    }
  }

  /**
   * Track template usage
   */
  async trackTemplateUsage(templateId: string, didRespond = false) {
    const today = new Date().toISOString().split("T")[0]

    try {
      // Get today's record for this template or create if it doesn't exist
      const { data: existingRecord } = await supabase
        .from("analytics_templates")
        .select("*")
        .eq("date", today)
        .eq("template_id", templateId)
        .single()

      if (existingRecord) {
        // Calculate new response rate
        const newTimesUsed = existingRecord.times_used + 1
        const totalResponses = existingRecord.total_responses || 0
        const newTotalResponses = didRespond ? totalResponses + 1 : totalResponses
        const newResponseRate = newTotalResponses / newTimesUsed

        // Update existing record
        await supabase
          .from("analytics_templates")
          .update({
            times_used: newTimesUsed,
            response_rate: newResponseRate,
            total_responses: newTotalResponses,
          })
          .eq("id", existingRecord.id)
      } else {
        // Create new record
        await supabase.from("analytics_templates").insert({
          template_id: templateId,
          date: today,
          times_used: 1,
          response_rate: didRespond ? 1 : 0,
          total_responses: didRespond ? 1 : 0,
        })
      }
    } catch (error) {
      console.error("Error tracking template analytics:", error)
    }
  }

  /**
   * Get message analytics for a date range
   */
  async getMessageAnalytics(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from("analytics_messages")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting message analytics:", error)
      return []
    }
  }

  /**
   * Get response time analytics for a date range
   */
  async getResponseTimeAnalytics(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from("analytics_response_times")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting response time analytics:", error)
      return []
    }
  }

  /**
   * Get engagement analytics for a date range
   */
  async getEngagementAnalytics(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from("analytics_engagement")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting engagement analytics:", error)
      return []
    }
  }

  /**
   * Get template analytics for a date range
   */
  async getTemplateAnalytics(startDate: string, endDate: string, templateId?: string) {
    try {
      let query = supabase
        .from("analytics_templates")
        .select("*, templates(name)")
        .gte("date", startDate)
        .lte("date", endDate)

      if (templateId) {
        query = query.eq("template_id", templateId)
      }

      const { data, error } = await query.order("date", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting template analytics:", error)
      return []
    }
  }

  /**
   * Get dashboard summary data
   */
  async getDashboardSummary() {
    const today = new Date().toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    try {
      // Get message counts for today
      const { data: todayMessages } = await supabase.from("analytics_messages").select("*").eq("date", today).single()

      // Get total message counts for last 30 days
      const { data: messageHistory } = await supabase
        .from("analytics_messages")
        .select("*")
        .gte("date", thirtyDaysAgo)
        .lte("date", today)

      // Calculate totals
      let totalReceived = 0
      let totalSent = 0
      let totalAiGenerated = 0
      let totalTemplateUsed = 0

      messageHistory?.forEach((day) => {
        totalReceived += day.total_received || 0
        totalSent += day.total_sent || 0
        totalAiGenerated += day.ai_generated || 0
        totalTemplateUsed += day.template_used || 0
      })

      // Get latest response time data
      const { data: latestResponseTime } = await supabase
        .from("analytics_response_times")
        .select("*")
        .eq("date", today)
        .single()

      // Get latest engagement data
      const { data: latestEngagement } = await supabase
        .from("analytics_engagement")
        .select("*")
        .eq("date", today)
        .single()

      // Get top templates
      const { data: topTemplates } = await supabase
        .from("analytics_templates")
        .select("*, templates(name)")
        .gte("date", thirtyDaysAgo)
        .order("times_used", { ascending: false })
        .limit(5)

      return {
        today: {
          received: todayMessages?.total_received || 0,
          sent: todayMessages?.total_sent || 0,
          aiGenerated: todayMessages?.ai_generated || 0,
          templateUsed: todayMessages?.template_used || 0,
        },
        month: {
          totalReceived,
          totalSent,
          totalAiGenerated,
          totalTemplateUsed,
        },
        responseTime: latestResponseTime
          ? {
              avg: latestResponseTime.avg_response_time_seconds,
              min: latestResponseTime.min_response_time_seconds,
              max: latestResponseTime.max_response_time_seconds,
            }
          : null,
        engagement: latestEngagement
          ? {
              activeConversations: latestEngagement.active_conversations,
              newConversations: latestEngagement.new_conversations,
              avgDuration: latestEngagement.conversation_duration_avg_seconds,
              avgMessages: latestEngagement.messages_per_conversation_avg,
            }
          : null,
        topTemplates: topTemplates || [],
      }
    } catch (error) {
      console.error("Error getting dashboard summary:", error)
      return {
        today: { received: 0, sent: 0, aiGenerated: 0, templateUsed: 0 },
        month: { totalReceived: 0, totalSent: 0, totalAiGenerated: 0, totalTemplateUsed: 0 },
        responseTime: null,
        engagement: null,
        topTemplates: [],
      }
    }
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService()

export default analyticsService
