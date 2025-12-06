import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
    // No routes needed - the UI will call the API directly
    // The frontend uses VITE_API_URL environment variable to know where the API is

    const httpServer = createServer(app);
    return httpServer;
}
