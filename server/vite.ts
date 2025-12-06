import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as any,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);

      // Set no-cache headers for HTML in development
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets with appropriate cache headers
  app.use(express.static(distPath, {
    maxAge: 0, // Default to no cache, we'll set specific headers below
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      // Check if file has version hash (Vite typically adds hashes to built files)
      const hasVersionHash = /\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot)$/i.test(filePath);

      if (hasVersionHash) {
        // Versioned files can be cached for a long time
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (['.js', '.css', '.mjs'].includes(ext)) {
        // Non-versioned JS/CSS files (like main chunks) - cache briefly
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
        // Images - cache for 1 week
        res.setHeader('Cache-Control', 'public, max-age=604800');
      } else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
        // Fonts - cache for 1 month
        res.setHeader('Cache-Control', 'public, max-age=2592000');
      } else if (['.html', '.htm'].includes(ext)) {
        // HTML files - no cache for SPA routing
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        // Other files - short cache
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    // Don't cache the main HTML file for SPA routing
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
