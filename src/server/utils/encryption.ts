import crypto from "crypto"

/**
 * Decrypt an encrypted API key
 */
export async function decrypt(encryptedPayload: string, passphrase: string): Promise<string | null> {
  try {
    const payload = JSON.parse(encryptedPayload)
    const { encrypted, salt, iv } = payload

    // Convert from base64
    const encryptedBuffer = Buffer.from(encrypted, "base64")
    const saltBuffer = Buffer.from(salt, "base64")
    const ivBuffer = Buffer.from(iv, "base64")

    // Derive key from passphrase
    const key = crypto.pbkdf2Sync(passphrase, saltBuffer, 100000, 32, "sha256")

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuffer)

    // Decrypt
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()])

    return decrypted.toString("utf8")
  } catch (error) {
    console.error("Decryption error:", error)
    return null
  }
}
