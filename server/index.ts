import 'express-async-errors';
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { applyCacheHeaders } from "./cache-middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply cache headers before other middleware
app.use(applyCacheHeaders);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error so we can see it in the console
    console.error("Global error handler caught:", err);

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 4000
  // this serves both the UI proxy and the client.
  const PORT = Number(process.env.PORT || 4000);
  const HOST = process.env.HOST || '0.0.0.0';
  /*server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(`🚀 UI SERVER STARTED ON PORT ${port} - BUILD TIME: ${new Date().toISOString()}`);
    log(`📡 Proxying API requests to: ${process.env.API_URL || 'http://localhost:4001'}`);
  });*/

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

})();
