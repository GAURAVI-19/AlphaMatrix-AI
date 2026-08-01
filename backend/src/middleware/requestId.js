import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage to hold context per request (for automatic trace logs)
export const requestContextStore = new AsyncLocalStorage();

/**
 * Middleware that generates and sets a unique X-Request-Id tracking context per request
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || req.headers['X-Request-Id'] || randomUUID();
  
  req.requestId = requestId;
  req.id = requestId; // Backward compatibility
  res.setHeader('X-Request-Id', requestId);

  const context = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url
  };

  // Run downstream middlewares and handlers in request context store
  requestContextStore.run(context, next);
};

export default requestIdMiddleware;
