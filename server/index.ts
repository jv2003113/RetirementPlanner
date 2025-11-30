import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { storage as dbStorage } from "./db";
import { applyCacheHeaders } from "./cache-middleware";

const app = express();

// Disable trust proxy to prevent express-session from auto-setting secure: true
app.set('trust proxy', false);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware
const sessionConfig: any = {
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'retirement-planner-secret',
  name: 'retirement.sid', // Explicit cookie name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: app.get('env') === 'production', // true in production, false in dev
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
};

// However, since we are running on localhost even in "production" mode (npm start),
// we must ensure secure is false if we are not behind a proxy that handles https.
// The user is accessing via http://localhost:5000, so secure MUST be false.
if (process.env.NODE_ENV === 'production') {
  // Check if we are actually on HTTPS. If not, force secure to false.
  // For this local setup, we assume HTTP.
  sessionConfig.cookie.secure = false;
}

// Force cookie.secure to false in development
if (app.get('env') !== 'production') {
  sessionConfig.cookie.secure = false;
}

app.use(session(sessionConfig));

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log cookies
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`[Cookie Debug] ${req.method} ${req.path}`);
    console.log('  Incoming cookies:', req.headers.cookie || 'none');
    console.log('  Session ID:', req.sessionID);
    console.log('  Is authenticated:', req.isAuthenticated?.());

    // Intercept res.setHeader to log Set-Cookie
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = function (name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie') {
        console.log('  Outgoing Set-Cookie:', value);
      }
      return originalSetHeader(name, value);
    };
  }
  next();
});

// Configure Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    // Don't include password in the user object
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    return done(error);
  }
}));

// Serialize and deserialize user for session management
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) {
      return done(null, false);
    }
    // Don't include password in the user object
    const { password: _, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

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
  // Populate standard milestones on startup
  try {
    await dbStorage.populateStandardMilestones();
  } catch (error) {
    console.error("Failed to populate standard milestones:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 SERVER STARTED ON PORT ${port} - BUILD TIME: ${new Date().toISOString()}`);
  });
})();
