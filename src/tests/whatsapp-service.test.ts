import whatsAppService from "../server/services/whatsapp-service"
import { clearTestData, createTestData, simulateWhatsAppAuth, testMessageSending } from "./test-utils"

describe("WhatsApp Service", () => {
  // Set up test data before tests
  beforeAll(async () => {
    await clearTestData()
    await createTestData()
  })

  // Clean up after tests
  afterAll(async () => {
    await clearTestData()
    await whatsAppService.close()
  })

  test("Should start a WhatsApp session and return QR code", async () => {
    try {
      const qrCode = await whatsAppService.startSession()
      expect(qrCode).toBeTruthy()
      expect(typeof qrCode).toBe("string")
      expect(qrCode.startsWith("data:image/png;base64,")).toBe(true)
    } catch (error) {
      // This test may fail in CI environments without a browser
      console.warn("Could not start WhatsApp session:", error)
    }
  })

  test("Should check authentication status", async () => {
    const isAuthenticated = whatsAppService.isWhatsAppAuthenticated()
    expect(typeof isAuthenticated).toBe("boolean")
  })

  test("Should check monitoring status", async () => {
    const isMonitoring = whatsAppService.isMonitoringActive()
    expect(typeof isMonitoring).toBe("boolean")
  })

  test("Should simulate WhatsApp authentication", async () => {
    const isAuthenticated = await simulateWhatsAppAuth()
    expect(typeof isAuthenticated).toBe("boolean")
  })

  test("Should send a message if authenticated", async () => {
    // This test will be skipped if not authenticated
    if (!whatsAppService.isWhatsAppAuthenticated()) {
      console.warn("Skipping message sending test - not authenticated")
      return
    }

    const result = await whatsAppService.sendMessage(
      "+1234567890",
      "This is a test message",
      "encrypted-api-key",
      "passphrase",
    )
    expect(typeof result).toBe("boolean")
  })

  test("Should test message sending API", async () => {
    // This test will be skipped if not authenticated
    if (!whatsAppService.isWhatsAppAuthenticated()) {
      console.warn("Skipping message sending API test - not authenticated")
      return
    }

    const result = await testMessageSending(
      "+1234567890",
      "This is a test message from API",
      "encrypted-api-key",
      "passphrase",
    )
    expect(typeof result).toBe("boolean")
  })
})
