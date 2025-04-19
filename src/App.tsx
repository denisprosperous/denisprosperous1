"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/Navbar"
import Login from "@/components/Login"
import Dashboard from "@/components/Dashboard"
import Settings from "@/components/Settings"
import Conversations from "@/components/Conversations"
import ConversationDetail from "@/components/ConversationDetail"
import Templates from "@/components/Templates"
import Contacts from "@/components/Contacts"
import AnalyticsDashboard from "@/components/AnalyticsDashboard"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"
import TeamSelector from "@/components/auth/TeamSelector"
import TeamManagement from "@/components/auth/TeamManagement"
import { useLocalStorage } from "@/hooks/use-local-storage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKey, setApiKey] = useLocalStorage<string | null>("encrypted-api-key", null)
  const [sessionActive, setSessionActive] = useLocalStorage<boolean>("whatsapp-session", false)
  const [authToken] = useLocalStorage<string | null>("auth-token", null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has an active WhatsApp session
    if (sessionActive) {
      setIsAuthenticated(true)
    }

    // Check if user is authenticated
    if (authToken) {
      setIsAuthenticated(true)
    }
  }, [sessionActive, authToken])

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const handleLogout = () => {
    // Clear auth token and user info
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
    localStorage.removeItem("selected-team")
    setIsAuthenticated(false)
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="whatsapp-automation-theme">
      <Router>
        <div className="min-h-screen bg-background">
          {isAuthenticated && (
            <div className="border-b">
              <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                  <Navbar />
                  <div className="flex items-center gap-4">
                    <TeamSelector onTeamChange={handleTeamChange} />
                    <Button variant="outline" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <main className="container mx-auto py-4 px-4 md:px-6">
            <Routes>
              <Route
                path="/"
                element={
                  !isAuthenticated ? (
                    <Navigate to="/login" />
                  ) : !sessionActive ? (
                    <Login onLogin={() => setSessionActive(true)} setSessionActive={setSessionActive} />
                  ) : (
                    <Dashboard />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <div className="flex justify-center items-center min-h-[80vh]">
                      <LoginForm onSuccess={() => setIsAuthenticated(true)} />
                    </div>
                  )
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <div className="flex justify-center items-center min-h-[80vh]">
                      <RegisterForm />
                    </div>
                  )
                }
              />
              <Route
                path="/conversations"
                element={isAuthenticated ? <Conversations teamId={selectedTeam} /> : <Navigate to="/login" />}
              />
              <Route
                path="/conversations/:phoneNumber"
                element={isAuthenticated ? <ConversationDetail teamId={selectedTeam} /> : <Navigate to="/login" />}
              />
              <Route
                path="/contacts"
                element={isAuthenticated ? <Contacts teamId={selectedTeam} /> : <Navigate to="/login" />}
              />
              <Route
                path="/templates"
                element={isAuthenticated ? <Templates teamId={selectedTeam} /> : <Navigate to="/login" />}
              />
              <Route
                path="/analytics"
                element={isAuthenticated ? <AnalyticsDashboard teamId={selectedTeam} /> : <Navigate to="/login" />}
              />
              <Route
                path="/settings"
                element={
                  isAuthenticated ? (
                    <div className="space-y-6">
                      <Settings apiKey={apiKey} setApiKey={setApiKey} teamId={selectedTeam} />
                      {selectedTeam && <TeamManagement teamId={selectedTeam} />}
                    </div>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
