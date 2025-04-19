"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Team {
  id: string
  name: string
  role: string
}

interface TeamSelectorProps {
  onTeamChange: (teamId: string) => void
}

const TeamSelector = ({ onTeamChange }: TeamSelectorProps) => {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useLocalStorage<string | null>("selected-team", null)
  const [newTeamName, setNewTeamName] = useState("")
  const [loading, setLoading] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [authToken] = useLocalStorage<string | null>("auth-token", null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeams()
  }, [authToken])

  useEffect(() => {
    if (selectedTeam) {
      onTeamChange(selectedTeam)
    } else if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id)
      onTeamChange(teams[0].id)
    }
  }, [selectedTeam, teams, onTeamChange])

  const fetchTeams = async () => {
    if (!authToken) return

    setLoading(true)
    try {
      const response = await fetch("/api/auth/teams", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const data = await response.json()
      setTeams(data)

      // If no team is selected yet, select the first one
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0].id)
        onTeamChange(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !authToken) return

    setLoading(true)
    try {
      const response = await fetch("/api/auth/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newTeamName }),
      })

      if (!response.ok) {
        throw new Error("Failed to create team")
      }

      const data = await response.json()

      toast({
        title: "Team Created",
        description: "Your team has been created successfully.",
      })

      // Refresh teams
      await fetchTeams()

      // Select the new team
      setSelectedTeam(data.teamId)
      onTeamChange(data.teamId)

      // Reset form
      setNewTeamName("")
      setCreateTeamOpen(false)
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId)
    onTeamChange(teamId)
  }

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        <>
          <Select value={selectedTeam || ""} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
                <DialogDescription>Create a new team to collaborate with others.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="My Team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateTeamOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={loading || !newTeamName.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Team"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

export default TeamSelector
