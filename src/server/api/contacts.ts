import { Router } from "express"
import { createClient } from "@supabase/supabase-js"

const router = Router()

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Get all contacts
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("contacts").select("*").order("name", { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    res.status(500).json({ error: "Failed to fetch contacts" })
  }
})

// Get a single contact
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("Error fetching contact:", error)
    res.status(500).json({ error: "Failed to fetch contact" })
  }
})

// Create a new contact
router.post("/", async (req, res) => {
  try {
    const { name, phone_number, avatar_url, notes } = req.body

    if (!name || !phone_number) {
      return res.status(400).json({ error: "Name and phone number are required" })
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({ name, phone_number, avatar_url, notes })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating contact:", error)
    res.status(500).json({ error: "Failed to create contact" })
  }
})

// Update a contact
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone_number, avatar_url, notes } = req.body

    if (!name || !phone_number) {
      return res.status(400).json({ error: "Name and phone number are required" })
    }

    const { data, error } = await supabase
      .from("contacts")
      .update({ name, phone_number, avatar_url, notes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("Error updating contact:", error)
    res.status(500).json({ error: "Failed to update contact" })
  }
})

// Delete a contact
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) throw error

    res.status(204).send()
  } catch (error) {
    console.error("Error deleting contact:", error)
    res.status(500).json({ error: "Failed to delete contact" })
  }
})

export default router
