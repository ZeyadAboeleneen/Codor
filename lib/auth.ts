import jwt from "jsonwebtoken"
import { headers } from "next/headers"

interface JwtPayload {
  userId: string
  email: string
  role: string
}

/**
 * Extract and verify the user from the Authorization header JWT token.
 * Used by server-side API routes to authenticate requests.
 */
export async function getUserFromSession(): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set")
      return null
    }

    const headersList = headers()
    const authHeader = headersList.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    console.error("Auth verification failed:", error)
    return null
  }
}
