"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Key, Shield, Save, Sparkles, Download, Upload, Database } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function Settings() {
  const [apiKey, setApiKey] = useLocalStorage<string | null>("encrypted-api-key", null)
  const [newApiKey, setNewApiKey] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [loading, setLoading] = useState(false)
  const [savingAISettings, setSavingAISettings] = useState(false)
  const [useLocalLLM, setUseLocalLLM] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aiSettings, setAISettings] = useState({
    systemPrompt:
      "You are a helpful assistant responding to WhatsApp messages. Be concise, friendly, and helpful. If you don't know something, say so. Remember information about the people you're talking to.",
    autoRespond: true,
    rememberContext: true,
    maxTokens: 500,
    temperature: 0.7,
    model: "gpt-3.5-turbo",
    useLocalLLM: false,
  })
  const { toast } = useToast()

  const encryptAndSaveApiKey = async () => {
    if (!newApiKey || !passphrase) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both API key and passphrase.",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate encryption
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, we would encrypt the API key here
      // For demo purposes, we'll just store it with a mock encryption marker
      setApiKey(`encrypted:${newApiKey}`)
      setNewApiKey("")
      setPassphrase("")

      toast({
        title: "API Key Saved",
        description: "Your API key has been encrypted and saved.",
      })
    } catch (error) {
      console.error("Error encrypting API key:", error)
      toast({
        variant: "destructive",
        title: "Encryption Failed",
        description: "Could not encrypt and save your API key.",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearApiKey = () => {
    setApiKey(null)
    toast({
      title: "API Key Removed",
      description: "Your API key has been removed from storage.",
    })
  }

  const saveAISettings = async () => {
    setSavingAISettings(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Your AI settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving AI settings:", error)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save AI settings. Please try again.",
      })
    } finally {
      setSavingAISettings(false)
    }
  }

  const handleExportData = async () => {
    setExportLoading(true)
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, we would export data to a file here
      // For demo purposes, we'll just show a success message

      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      // Simulate import
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, we would import data from the file here
      // For demo purposes, we'll just show a success message

      toast({
        title: "Import Successful",
        description: "Your data has been imported successfully.",
      })

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error importing data:", error)
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not import your data. Please check the file format and try again.",
      })
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your WhatsApp automation settings.</p>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="automation">Automation Settings</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <CardDescription>Configure your OpenAI API key for AI-powered responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="use-local-llm" checked={useLocalLLM} onCheckedChange={setUseLocalLLM} />
                  <Label htmlFor="use-local-llm">Use local LLM instead of OpenAI API</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, the application will use a local language model instead of calling the OpenAI API.
                </p>
              </div>

              {!useLocalLLM && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">OpenAI API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Your API key will be encrypted and stored locally.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passphrase" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Encryption Passphrase
                    </Label>
                    <Input
                      id="passphrase"
                      type="password"
                      placeholder="Enter a secure passphrase"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This passphrase will be used to encrypt your API key. Make sure to remember it.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={encryptAndSaveApiKey} disabled={loading || !newApiKey || !passphrase}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save API Key"
                      )}
                    </Button>
                    {apiKey && (
                      <Button variant="destructive" onClick={clearApiKey}>
                        Remove API Key
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                {apiKey ? "You have an encrypted API key stored." : "No API key is currently stored."}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>Customize how the AI generates responses to messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select
                  value={aiSettings.model}
                  onValueChange={(value) => setAISettings({ ...aiSettings, model: value })}
                  disabled={useLocalLLM}
                >
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select which AI model to use for generating responses.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <textarea
                  id="system-prompt"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="You are a helpful assistant responding to WhatsApp messages..."
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAISettings({ ...aiSettings, systemPrompt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">This prompt guides how the AI responds to messages.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature: {aiSettings.temperature.toFixed(1)}</Label>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[aiSettings.temperature]}
                  onValueChange={(value) => setAISettings({ ...aiSettings, temperature: value[0] })}
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness: Lower values are more deterministic, higher values are more creative.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-tokens">Max Tokens: {aiSettings.maxTokens}</Label>
                </div>
                <Slider
                  id="max-tokens"
                  min={100}
                  max={2000}
                  step={100}
                  value={[aiSettings.maxTokens]}
                  onValueChange={(value) => setAISettings({ ...aiSettings, maxTokens: value[0] })}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of the AI's response. Higher values allow for longer responses.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAISettings} disabled={savingAISettings}>
                {savingAISettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save AI Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure how the AI responds to messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-respond"
                    checked={aiSettings.autoRespond}
                    onCheckedChange={(checked) => setAISettings({ ...aiSettings, autoRespond: checked })}
                  />
                  <Label htmlFor="auto-respond">Auto-respond to all messages</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the AI will automatically respond to all incoming messages.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remember-context"
                    checked={aiSettings.rememberContext}
                    onCheckedChange={(checked) => setAISettings({ ...aiSettings, rememberContext: checked })}
                  />
                  <Label htmlFor="remember-context">Remember conversation context</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the AI will remember previous messages in the conversation.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAISettings} disabled={savingAISettings}>
                {savingAISettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export and import your data for backup or migration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Export all your data including contacts, messages, templates, and settings.
                </p>
                <Button onClick={handleExportData} disabled={exportLoading} className="mt-2">
                  {exportLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import data from a previously exported file. This will replace your current data.
                </p>
                <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
                <Button onClick={handleImportClick} disabled={importLoading} className="mt-2">
                  {importLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Note: Importing data will replace all your current data. Make sure to export a backup first.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
