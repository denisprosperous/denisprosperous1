import { Router } from "express"
import authService from "../services/auth-service"
import { authenticate, authorizeTeam } from "../middleware/auth-middleware"

const router = Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Email, name, and password are required" })
    }

    const result = await authService.registerUser(email, name, password)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.status(201).json({ message: result.message })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ error: "Failed to register user" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const result = await authService.loginUser(email, password)

    if (!result.success) {
      return res.status(401).json({ error: result.message })
    }

    res.json({
      message: result.message,
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({ error: "Failed to login" })
  }
})

// Logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return res.status(400).json({ error: "Token is required" })
    }

    const success = await authService.logoutUser(token)

    if (!success) {
      return res.status(500).json({ error: "Failed to logout" })
    }

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error logging out:", error)
    res.status(500).json({ error: "Failed to logout" })
  }
})

// Get current user
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user })
})

// Create a team
router.post("/teams", authenticate, async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: "Team name is required" })
    }

    const result = await authService.createTeam(name, req.user.id)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.status(201).json({
      message: result.message,
      teamId: result.teamId,
    })
  } catch (error) {
    console.error("Error creating team:", error)
    res.status(500).json({ error: "Failed to create team" })
  }
})

// Get user's teams
router.get("/teams", authenticate, async (req, res) => {
  try {
    const teams = await authService.getUserTeams(req.user.id)
    res.json(teams)
  } catch (error) {
    console.error("Error getting teams:", error)
    res.status(500).json({ error: "Failed to get teams" })
  }
})

// Add team member
router.post("/teams/:teamId/members", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { teamId } = req.params
    const { email, role } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const result = await authService.addTeamMember(teamId, email, role)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.status(201).json({ message: result.message })
  } catch (error) {
    console.error("Error adding team member:", error)
    res.status(500).json({ error: "Failed to add team member" })
  }
})

// Remove team member
router.delete("/teams/:teamId/members/:userId", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { teamId, userId } = req.params

    const result = await authService.removeTeamMember(teamId, userId)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Error removing team member:", error)
    res.status(500).json({ error: "Failed to remove team member" })
  }
})

// Update team member role
router.put("/teams/:teamId/members/:userId", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { teamId, userId } = req.params
    const { role } = req.body

    if (!role) {
      return res.status(400).json({ error: "Role is required" })
    }

    const result = await authService.updateTeamMemberRole(teamId, userId, role)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Error updating team member role:", error)
    res.status(500).json({ error: "Failed to update team member role" })
  }
})

// Get team members
router.get("/teams/:teamId/members", authenticate, authorizeTeam, async (req, res) => {
  try {
    const { teamId } = req.params

    const members = await authService.getTeamMembers(teamId)
    res.json(members)
  } catch (error) {
    console.error("Error getting team members:", error)
    res.status(500).json({ error: "Failed to get team members" })
  }
})

export default router
