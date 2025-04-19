import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Default model paths - these should be configurable in the settings
const DEFAULT_MODEL_PATH = path.join(process.cwd(), "models", "ggml-model-q4_0.bin")
const DEFAULT_PROMPT_TEMPLATE = `
You are a helpful assistant responding to WhatsApp messages. Be concise, friendly, and helpful.
If you don't know something, say so. Remember information about the people you're talking to.

CONTEXT:
{context}

USER: {prompt}
ASSISTANT:
`

class LocalLLMService {
  private modelPath: string
  private promptTemplate: string
  private modelLoaded = false

  constructor(modelPath: string = DEFAULT_MODEL_PATH, promptTemplate: string = DEFAULT_PROMPT_TEMPLATE) {
    this.modelPath = modelPath
    this.promptTemplate = promptTemplate
    this.checkModelExists()
  }

  private checkModelExists(): void {
    if (!fs.existsSync(this.modelPath)) {
      console.warn(`Local LLM model not found at ${this.modelPath}. Please download a compatible model.`)
      this.modelLoaded = false
    } else {
      this.modelLoaded = true
    }
  }

  public setModelPath(modelPath: string): void {
    this.modelPath = modelPath
    this.checkModelExists()
  }

  public setPromptTemplate(promptTemplate: string): void {
    this.promptTemplate = promptTemplate
  }

  public isModelLoaded(): boolean {
    return this.modelLoaded
  }

  public async generateResponse(prompt: string, context = "", maxTokens = 500, temperature = 0.7): Promise<string> {
    if (!this.modelLoaded) {
      throw new Error("Local LLM model not loaded. Please check the model path.")
    }

    // Format the prompt with the template
    const formattedPrompt = this.promptTemplate.replace("{context}", context).replace("{prompt}", prompt)

    return new Promise((resolve, reject) => {
      // This is a simplified example using llama.cpp as the backend
      // In a real implementation, you would use a proper Node.js binding or API
      const llmProcess = spawn("llama", [
        "-m",
        this.modelPath,
        "-p",
        formattedPrompt,
        "--temp",
        temperature.toString(),
        "--n-predict",
        maxTokens.toString(),
        "--no-mmap",
      ])

      let output = ""
      let error = ""

      llmProcess.stdout.on("data", (data) => {
        output += data.toString()
      })

      llmProcess.stderr.on("data", (data) => {
        error += data.toString()
      })

      llmProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Local LLM process exited with code ${code}`)
          console.error(error)
          reject(new Error(`Local LLM process failed: ${error}`))
        } else {
          // Extract only the assistant's response from the output
          const assistantResponse = output.split("ASSISTANT:")[1]?.trim() || output
          resolve(assistantResponse)
        }
      })
    })
  }

  public async processMessage(
    messageData: { sender: string; message: string; phone?: string },
    settings: any,
  ): Promise<string | null> {
    try {
      // Get conversation history
      const { data: conversationHistory } = await supabase
        .from("messages")
        .select("*")
        .eq("phone_number", messageData.phone || "unknown")
        .order("timestamp", { ascending: true })
        .limit(10)

      // Format conversation history as context
      let context = ""
      if (settings.rememberContext && conversationHistory) {
        context = conversationHistory
          .map((msg) => `${msg.is_from_me ? "ASSISTANT" : "USER"}: ${msg.message}`)
          .join("\n")
      }

      // Generate response
      const response = await this.generateResponse(
        messageData.message,
        context,
        settings.maxTokens || 500,
        settings.temperature || 0.7,
      )

      return response
    } catch (error) {
      console.error("Error processing message with local LLM:", error)
      return null
    }
  }
}

// Create a singleton instance
const localLLMService = new LocalLLMService()

export default localLLMService
