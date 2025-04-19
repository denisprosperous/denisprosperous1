"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Trash2, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: string
  name: string
  email: string
  userRole: string
}

interface TeamManagementProps {
  teamId: string
}

const TeamManagement = ({ teamId }: TeamManagementProps) => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("member")
  const [editMemberRole, setEditMemberRole] = useState<{ userId: string; role: string } | null>(null)
  const [authToken] = useLocalStorage<string | null>("auth-token", null)
  const [authUser] = useLocalStorage<any | null>("auth-user", null)
  const { toast } = useToast()

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers()
    }
  }, [teamId, authToken])

  const fetchTeamMembers = async () => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }

      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching team members:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch team members. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add team member")
      }

      toast({
        title: "Member Added",
        description: "Team member has been added successfully.",
      })

      // Refresh members
      await fetchTeamMembers()

      // Reset form
      setNewMemberEmail("")
      setNewMemberRole("member")
      setAddMemberOpen(false)
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add team member. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove team member")
      }

      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      })

      // Refresh members
      await fetchTeamMembers()
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove team member. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editMemberRole || !authToken || !teamId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members/${editMemberRole.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Team-Id": teamId,
        },
        body: JSON.stringify({ role: editMemberRole.role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role")
      }

      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      })

      // Refresh members
      await fetchTeamMembers()

      // Reset form
      setEditMemberRole(null)
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const isCurrentUserOwner = () => {
    if (!authUser) return false
    const currentMember = members.find((member) => member.userId === authUser.id)
    return currentMember?.role === "owner"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </div>
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a new member to your team by email.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role">Role</Label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger id="member-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddMemberOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={loading || !newMemberEmail.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && members.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team members found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex items-center mt-1">
                    <Shield className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentUserOwner() && member.userId !== authUser?.id && (
                    <>
                      <Dialog
                        open={editMemberRole?.userId === member.userId}
                        onOpenChange={(open) =>
                          setEditMemberRole(open ? { userId: member.userId, role: member.role } : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Member Role</DialogTitle>
                            <DialogDescription>Change the role of {member.name}.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-role">Role</Label>
                              <Select
                                value={editMemberRole?.role || member.role}
                                onValueChange={(value) => setEditMemberRole({ userId: member.userId, role: value })}
                              >
                                <SelectTrigger id="edit-role">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditMemberRole(null)} disabled={loading}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateRole} disabled={loading}>
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Role"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TeamManagement
