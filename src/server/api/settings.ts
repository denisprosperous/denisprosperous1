import { Router } from "express"
import { createClient } from "@supabase/supabase-js"

const router = Router()

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Get AI settings
router.get("/ai", async (req, res) => {
  try {
    const { data, error } = await supabase.from("settings").select("value").eq("key", "ai_settings").single()

    if (error) {
      // If settings don't exist yet, return default values
      if (error.code === "PGRST116") {
        return res.json({
          systemPrompt:
            "You are a helpful assistant responding to WhatsApp messages. Be concise, friendly, and helpful. If you don't know something, say so. Remember information about the people you're talking to.",
          autoRespond: true,
          rememberContext: true,
          maxTokens: 500,
          temperature: 0.7,
          model: "gpt-3.5-turbo",
          useLocalLLM: false,
        })
      }
      throw error
    }

    res.json(data.value)
  } catch (error) {
    console.error("Error fetching AI settings:", error)
    res.status(500).json({ error: "Failed to fetch AI settings" })
  }
})

// Save AI settings
router.post("/ai", async (req, res) => {
  try {
    const settings = req.body

    // Validate required fields
    if (!settings.systemPrompt) {
      return res.status(400).json({ error: "System prompt is required" })
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase.from("settings").select("*").eq("key", "ai_settings").single()

    let result
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("settings")
        .update({
          value: settings,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "ai_settings")
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("settings")
        .insert({
          key: "ai_settings",
          value: settings,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    res.json(result)
  } catch (error) {
    console.error("Error saving AI settings:", error)
    res.status(500).json({ error: "Failed to save AI settings" })
  }
})

export default router
