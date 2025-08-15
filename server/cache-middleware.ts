import type { Request, Response, NextFunction } from "express";

export interface CacheConfig {
  maxAge?: number;
  sMaxAge?: number;
  private?: boolean;
  public?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
}

export function createCacheMiddleware(config: CacheConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheHeaders: string[] = [];

    // Handle no-cache and no-store first (they override other settings)
    if (config.noStore) {
      cacheHeaders.push('no-store');
    } else if (config.noCache) {
      cacheHeaders.push('no-cache');
    } else {
      // Handle public/private
      if (config.public) {
        cacheHeaders.push('public');
      } else if (config.private) {
        cacheHeaders.push('private');
      }

      // Handle max-age
      if (config.maxAge !== undefined) {
        cacheHeaders.push(`max-age=${config.maxAge}`);
      }

      // Handle s-maxage (shared cache max age)
      if (config.sMaxAge !== undefined) {
        cacheHeaders.push(`s-maxage=${config.sMaxAge}`);
      }

      // Handle must-revalidate
      if (config.mustRevalidate) {
        cacheHeaders.push('must-revalidate');
      }

      // Handle immutable
      if (config.immutable) {
        cacheHeaders.push('immutable');
      }
    }

    if (cacheHeaders.length > 0) {
      res.setHeader('Cache-Control', cacheHeaders.join(', '));
    }

    next();
  };
}

// Predefined cache configurations for common use cases
export const cacheConfigs = {
  // No caching at all
  noCache: createCacheMiddleware({ noCache: true }),
  
  // No storage (for sensitive data)
  noStore: createCacheMiddleware({ noStore: true }),
  
  // Short private cache (1 minute) - for user-specific data that can be briefly cached
  shortPrivate: createCacheMiddleware({ private: true, maxAge: 60 }),
  
  // Medium private cache (5 minutes) - for plan data
  mediumPrivate: createCacheMiddleware({ private: true, maxAge: 300 }),
  
  // Short public cache (10 minutes) - for semi-static data
  shortPublic: createCacheMiddleware({ public: true, maxAge: 600 }),
  
  // Long public cache (1 hour) - for configuration data
  longPublic: createCacheMiddleware({ public: true, maxAge: 3600 }),
  
  // Very long public cache (1 day) - for rarely changing data
  dayPublic: createCacheMiddleware({ public: true, maxAge: 86400 }),
  
  // Immutable cache (1 year) - for versioned static assets
  immutable: createCacheMiddleware({ 
    public: true, 
    maxAge: 31536000, // 1 year
    immutable: true 
  }),
  
  // Static assets (1 week) - for images, fonts, etc.
  staticAssets: createCacheMiddleware({ public: true, maxAge: 604800 }),
};

// Route-specific cache mapping
export const routeCacheMap: Record<string, ReturnType<typeof createCacheMiddleware>> = {
  // Authentication routes - no storage
  '/api/auth/login': cacheConfigs.noStore,
  '/api/auth/logout': cacheConfigs.noStore,
  '/api/auth/register': cacheConfigs.noStore,
  '/api/auth/me': cacheConfigs.noCache,
  
  // User data - no cache (sensitive)
  '/api/users': cacheConfigs.noCache,
  
  // Plan data - medium private cache
  '/api/retirement-plans': cacheConfigs.mediumPrivate,
  '/api/retirement-plans/:id': cacheConfigs.mediumPrivate,
  '/api/retirement-plans/:id/details': cacheConfigs.mediumPrivate,
  '/api/retirement-plans/:id/year/:year': cacheConfigs.shortPrivate,
  
  // Plan generation - no cache (expensive computation)
  '/api/retirement-plans/:id/generate': cacheConfigs.noCache,
  '/api/retirement-plans/:id/regenerate': cacheConfigs.noCache,
  
  // Investment accounts - short private cache
  '/api/investment-accounts': cacheConfigs.shortPrivate,
  
  // Asset allocations - short private cache
  '/api/asset-allocations': cacheConfigs.shortPrivate,
  
  // Activities - short private cache
  '/api/activities': cacheConfigs.shortPrivate,
  
  // Milestones - medium private cache
  '/api/milestones': cacheConfigs.mediumPrivate,
};

// Helper to match route patterns
function matchRoute(path: string, pattern: string): boolean {
  // Convert pattern like '/api/retirement-plans/:id' to regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+')  // Replace :id with [^/]+ 
    .replace(/\//g, '\\/');       // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

// Middleware to apply route-specific caching
export function applyCacheHeaders(req: Request, res: Response, next: NextFunction) {
  // Skip caching in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Cache-Control', 'no-cache');
    return next();
  }

  const path = req.path;
  
  // Find matching route pattern
  for (const [pattern, cacheMiddleware] of Object.entries(routeCacheMap)) {
    if (matchRoute(path, pattern)) {
      return cacheMiddleware(req, res, next);
    }
  }
  
  // Default caching for API routes not specifically configured
  if (path.startsWith('/api/')) {
    return cacheConfigs.noCache(req, res, next);
  }
  
  next();
}