"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LoginProps {
  onLogin: () => void
  setSessionActive: (active: boolean) => void
}

const Login = ({ onLogin, setSessionActive }: LoginProps) => {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCheckInterval, setQrCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Clear interval when component unmounts
      if (qrCheckInterval) {
        clearInterval(qrCheckInterval)
      }
    }
  }, [qrCheckInterval])

  const startWhatsAppSession = async () => {
    setLoading(true)
    try {
      // Call backend to start WhatsApp session and get QR code
      const response = await fetch("/api/whatsapp/start-session", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start WhatsApp session")
      }

      const data = await response.json()
      setQrCode(data.qrCode)

      // Start checking for session status
      const intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch("/api/whatsapp/session-status")
          const statusData = await statusResponse.json()

          if (statusData.authenticated) {
            clearInterval(intervalId)
            setQrCheckInterval(null)
            setSessionActive(true)
            onLogin()
            toast({
              title: "Connected to WhatsApp",
              description: "Your WhatsApp account is now connected.",
            })
          }
        } catch (error) {
          console.error("Error checking session status:", error)
        }
      }, 2000)

      setQrCheckInterval(intervalId)
    } catch (error) {
      console.error("Error starting WhatsApp session:", error)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to WhatsApp. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>WhatsApp Business Automation</CardTitle>
          <CardDescription>Connect your WhatsApp account to get started with AI-powered automation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="qr">WhatsApp QR Login</TabsTrigger>
            </TabsList>
            <TabsContent value="qr" className="mt-4">
              {qrCode ? (
                <div className="flex flex-col items-center">
                  <div
                    ref={qrRef}
                    className="qr-container border rounded-md p-4 bg-white"
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                  />
                  <p className="mt-4 text-sm text-center text-muted-foreground">
                    Scan this QR code with WhatsApp on your phone to log in
                  </p>
                </div>
              ) : (
                <Button onClick={startWhatsAppSession} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect WhatsApp"
                  )}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-muted-foreground mt-4">
            This application uses WhatsApp Web to connect to your account. Your messages are processed locally and
            securely.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
