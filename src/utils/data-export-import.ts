import { saveAs } from "file-saver"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ""
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

interface ExportData {
  messages: any[]
  contacts: any[]
  templates: any[]
  settings: any[]
  exportDate: string
  version: string
}

export const exportData = async (): Promise<void> => {
  try {
    // Fetch all data from Supabase
    const [messagesResponse, contactsResponse, templatesResponse, settingsResponse] = await Promise.all([
      supabase.from("messages").select("*"),
      supabase.from("contacts").select("*"),
      supabase.from("templates").select("*"),
      supabase.from("settings").select("*"),
    ])

    // Prepare export data
    const exportData: ExportData = {
      messages: messagesResponse.data || [],
      contacts: contactsResponse.data || [],
      templates: templatesResponse.data || [],
      settings: settingsResponse.data || [],
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }

    // Convert to JSON and create blob
    const jsonData = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })

    // Generate filename with current date
    const filename = `whatsapp-automation-export-${new Date().toISOString().split("T")[0]}.json`

    // Save file
    saveAs(blob, filename)

    return Promise.resolve()
  } catch (error) {
    console.error("Error exporting data:", error)
    return Promise.reject(error)
  }
}

export const importData = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file")
        }

        // Parse the imported data
        const importedData: ExportData = JSON.parse(e.target.result as string)

        // Validate the data structure
        if (!importedData.version || !importedData.exportDate) {
          throw new Error("Invalid import file format")
        }

        // Clear existing data (optional, could be configurable)
        await Promise.all([
          supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("contacts").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("templates").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("settings").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        ])

        // Import data
        if (importedData.contacts.length > 0) {
          await supabase.from("contacts").insert(importedData.contacts)
        }

        if (importedData.templates.length > 0) {
          await supabase.from("templates").insert(importedData.templates)
        }

        if (importedData.settings.length > 0) {
          await supabase.from("settings").insert(importedData.settings)
        }

        // Import messages last (they reference contacts)
        if (importedData.messages.length > 0) {
          await supabase.from("messages").insert(importedData.messages)
        }

        resolve()
      } catch (error) {
        console.error("Error importing data:", error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

export const downloadBackup = async (): Promise<void> => {
  try {
    await exportData()
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const restoreBackup = async (file: File): Promise<void> => {
  try {
    await importData(file)
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}
