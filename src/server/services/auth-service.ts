import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Session token expiration time (24 hours)
const SESSION_EXPIRATION = 24 * 60 * 60 * 1000

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(email: string, name: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

      if (existingUser) {
        return { success: false, message: "User with this email already exists" }
      }

      // Hash the password
      const salt = crypto.randomBytes(16).toString("hex")
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
      const passwordHash = `${salt}:${hash}`

      // Create the user
      const { data, error } = await supabase
        .from("users")
        .insert({
          email,
          name,
          password_hash: passwordHash,
          role: "user", // Default role
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, message: "User registered successfully" }
    } catch (error) {
      console.error("Error registering user:", error)
      return { success: false, message: "Failed to register user" }
    }
  }

  /**
   * Login a user
   */
  async loginUser(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Get the user
      const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

      if (error || !user) {
        return { success: false, message: "Invalid email or password" }
      }

      // Verify the password
      const [salt, storedHash] = user.password_hash.split(":")
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")

      if (hash !== storedHash) {
        return { success: false, message: "Invalid email or password" }
      }

      // Create a session token
      const token = uuidv4()
      const expiresAt = new Date(Date.now() + SESSION_EXPIRATION)

      // Store the session
      await supabase.from("user_sessions").insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

      // Return user info (excluding password)
      const { password_hash, ...userInfo } = user

      return {
        success: true,
        message: "Login successful",
        token,
        user: userInfo,
      }
    } catch (error) {
      console.error("Error logging in user:", error)
      return { success: false, message: "Failed to login" }
    }
  }

  /**
   * Verify a session token
   */
  async verifySession(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      // Get the session
      const { data: session, error } = await supabase
        .from("user_sessions")
        .select("*, users(*)")
        .eq("token", token)
        .single()

      if (error || !session) {
        return { valid: false }
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Delete expired session
        await supabase.from("user_sessions").delete().eq("id", session.id)
        return { valid: false }
      }

      // Return user info (excluding password)
      const { password_hash, ...userInfo } = session.users

      return { valid: true, user: userInfo }
    } catch (error) {
      console.error("Error verifying session:", error)
      return { valid: false }
    }
  }

  /**
   * Logout a user
   */
  async logoutUser(token: string): Promise<boolean> {
    try {
      // Delete the session
      const { error } = await supabase.from("user_sessions").delete().eq("token", token)

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error logging out user:", error)
      return false
    }
  }

  /**
   * Create a team
   */
  async createTeam(name: string, userId: string): Promise<{ success: boolean; teamId?: string; message: string }> {
    try {
      // Create the team
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          name,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      // Add the creator as team owner
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: userId,
        role: "owner",
      })

      return { success: true, teamId: team.id, message: "Team created successfully" }
    } catch (error) {
      console.error("Error creating team:", error)
      return { success: false, message: "Failed to create team" }
    }
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<any[]> {
    try {
      // Get teams where user is a member
      const { data, error } = await supabase.from("team_members").select("*, teams(*)").eq("user_id", userId)

      if (error) throw error

      return data.map((member) => ({
        ...member.teams,
        role: member.role,
      }))
    } catch (error) {
      console.error("Error getting user teams:", error)
      return []
    }
  }

  /**
   * Add user to team
   */
  async addTeamMember(teamId: string, email: string, role = "member"): Promise<{ success: boolean; message: string }> {
    try {
      // Get the user by email
      const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

      if (userError || !user) {
        return { success: false, message: "User not found" }
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single()

      if (existingMember) {
        return { success: false, message: "User is already a member of this team" }
      }

      // Add user to team
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: user.id,
        role,
      })

      if (error) throw error

      return { success: true, message: "User added to team successfully" }
    } catch (error) {
      console.error("Error adding team member:", error)
      return { success: false, message: "Failed to add user to team" }
    }
  }

  /**
   * Remove user from team
   */
  async removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user is the team owner
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single()

      if (memberError || !member) {
        return { success: false, message: "User is not a member of this team" }
      }

      if (member.role === "owner") {
        return { success: false, message: "Cannot remove the team owner" }
      }

      // Remove user from team
      const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId)

      if (error) throw error

      return { success: true, message: "User removed from team successfully" }
    } catch (error) {
      console.error("Error removing team member:", error)
      return { success: false, message: "Failed to remove user from team" }
    }
  }

  /**
   * Update team member role
   */
  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user is a member
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single()

      if (memberError || !member) {
        return { success: false, message: "User is not a member of this team" }
      }

      if (member.role === "owner" && role !== "owner") {
        return { success: false, message: "Cannot change the role of the team owner" }
      }

      // Update role
      const { error } = await supabase.from("team_members").update({ role }).eq("team_id", teamId).eq("user_id", userId)

      if (error) throw error

      return { success: true, message: "Role updated successfully" }
    } catch (error) {
      console.error("Error updating team member role:", error)
      return { success: false, message: "Failed to update role" }
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*, users(id, name, email, role)")
        .eq("team_id", teamId)

      if (error) throw error

      return data.map((member) => ({
        id: member.id,
        userId: member.user_id,
        teamId: member.team_id,
        role: member.role,
        name: member.users.name,
        email: member.users.email,
        userRole: member.users.role,
      }))
    } catch (error) {
      console.error("Error getting team members:", error)
      return []
    }
  }
}

// Create a singleton instance
const authService = new AuthService()

export default authService
