import type { Request, Response, NextFunction } from "express"
import authService from "../services/auth-service"

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
      teamId?: string
    }
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token
    const { valid, user } = await authService.verifySession(token)
    if (!valid || !user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Add user to request
    req.user = user

    // Get team ID from query or header
    const teamId = req.query.teamId || req.headers["x-team-id"]
    if (teamId) {
      req.teamId = teamId as string
    }

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Admin authorization middleware
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }

  next()
}

/**
 * Team authorization middleware
 */
export const authorizeTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.teamId) {
      return res.status(403).json({ error: "Forbidden" })
    }

    // Get user's teams
    const teams = await authService.getUserTeams(req.user.id)
    const team = teams.find((t) => t.id === req.teamId)

    if (!team) {
      return res.status(403).json({ error: "Forbidden" })
    }

    next()
  } catch (error) {
    console.error("Team authorization error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
