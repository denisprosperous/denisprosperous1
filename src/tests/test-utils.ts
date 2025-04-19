import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for testing
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ""
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to clear test data
export const clearTestData = async () => {
  try {
    // Delete test data from all tables
    await Promise.all([
      supabase.from("messages").delete().eq("phone_number", "+1234567890"),
      supabase.from("contacts").delete().eq("phone_number", "+1234567890"),
      supabase.from("templates").delete().eq("name", "Test Template"),
    ])
  } catch (error) {
    console.error("Error clearing test data:", error)
  }
}

// Helper function to create test data
export const createTestData = async () => {
  try {
    // Create test contact
    await supabase.from("contacts").insert({
      name: "Test Contact",
      phone_number: "+1234567890",
      notes: "This is a test contact",
    })

    // Create test messages
    await supabase.from("messages").insert([
      {
        sender_name: "Test Contact",
        phone_number: "+1234567890",
        message: "Hello, this is a test message",
        timestamp: new Date().toISOString(),
        is_from_me: false,
        read: true,
      },
      {
        sender_name: "AI Assistant",
        phone_number: "+1234567890",
        message: "Hello! How can I help you today?",
        timestamp: new Date(Date.now() + 1000).toISOString(),
        is_from_me: true,
        read: true,
      },
    ])

    // Create test template
    await supabase.from("templates").insert({
      name: "Test Template",
      content: "Hello {{name}}, this is a test template",
      category: "test",
    })
  } catch (error) {
    console.error("Error creating test data:", error)
  }
}

// Helper function to validate encryption/decryption
export const testEncryption = async (text: string, passphrase: string): Promise<boolean> => {
  try {
    // Generate a random salt
    const salt = window.crypto.getRandomValues(new Uint8Array(16))

    // Derive key from passphrase
    const encoder = new TextEncoder()
    const passphraseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    )

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passphraseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    )

    // Encrypt the text
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      derivedKey,
      encoder.encode(text),
    )

    // Decrypt the text
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      derivedKey,
      encryptedData,
    )

    // Convert decrypted data back to string
    const decryptedText = new TextDecoder().decode(decryptedData)

    // Check if the decrypted text matches the original
    return decryptedText === text
  } catch (error) {
    console.error("Error testing encryption:", error)
    return false
  }
}

// Helper function to simulate WhatsApp authentication
export const simulateWhatsAppAuth = async (): Promise<boolean> => {
  try {
    // Simulate a successful WhatsApp authentication
    const response = await fetch("/api/whatsapp/session-status")
    const data = await response.json()
    return data.authenticated
  } catch (error) {
    console.error("Error simulating WhatsApp auth:", error)
    return false
  }
}

// Helper function to test message sending
export const testMessageSending = async (
  phoneNumber: string,
  message: string,
  apiKey: string,
  passphrase: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/conversations/${phoneNumber}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        apiKey,
        passphrase,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error testing message sending:", error)
    return false
  }
}
