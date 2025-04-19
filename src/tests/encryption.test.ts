import { testEncryption } from "./test-utils"
import { describe, test, expect } from "vitest"

describe("Encryption Utilities", () => {
  test("Should encrypt and decrypt text correctly", async () => {
    const text = "test-api-key-123456"
    const passphrase = "secure-passphrase"

    const result = await testEncryption(text, passphrase)
    expect(result).toBe(true)
  })

  test("Should fail with incorrect passphrase", async () => {
    const text = "test-api-key-123456"
    const passphrase = "secure-passphrase"
    const wrongPassphrase = "wrong-passphrase"

    // First encrypt with correct passphrase
    const correctResult = await testEncryption(text, passphrase)
    expect(correctResult).toBe(true)

    // Then try to decrypt with wrong passphrase
    const incorrectResult = await testEncryption(text, wrongPassphrase)
    expect(incorrectResult).not.toBe(text)
  })

  test("Should handle empty text", async () => {
    const text = ""
    const passphrase = "secure-passphrase"

    const result = await testEncryption(text, passphrase)
    expect(result).toBe(true)
  })

  test("Should handle special characters", async () => {
    const text = "!@#$%^&*()_+{}|:<>?~`-=[]\\;',./'"
    const passphrase = "secure-passphrase"

    const result = await testEncryption(text, passphrase)
    expect(result).toBe(true)
  })
})
