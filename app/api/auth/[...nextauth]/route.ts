/**
 * NextAuth API route handler
 * 
 * @swagger
 * /auth/providers:
 *   get:
 *     summary: Retrieve configured authentication providers
 *     description: Returns a list of all configured NextAuth providers for the application.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully retrieved providers
 * /auth/session:
 *   get:
 *     summary: Retrieve current active session
 *     description: Returns the user's active session, if any.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Active session object
 *       401:
 *         description: Unauthorized
 */
import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth/config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
