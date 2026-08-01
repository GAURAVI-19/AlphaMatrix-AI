import logger from '../utils/logger.js';

/**
 * Safely and recursively sanitizes inputs against NoSQL operator injections and XSS patterns
 * @param {any} input - Value to clean
 * @param {string} path - Object hierarchy path for tracing logs
 * @returns {any} Sanitized value
 */
const cleanInput = (input, path = '') => {
  if (input === null || input === undefined) {
    return input;
  }

  // Handle arrays cleanly
  if (Array.isArray(input)) {
    return input.map((item, index) => cleanInput(item, `${path}[${index}]`));
  }

  // Handle nested objects
  if (typeof input === 'object') {
    const cleanedObj = {};
    for (const key of Object.keys(input)) {
      // 1. NoSQL Injection Check: remove keys starting with $ or containing a dot (.)
      if (key.startsWith('$') || key.includes('.')) {
        logger.warn(`⚠️ Security Alert: Blocked NoSQL Injection attempt via key [${key}] in field path [${path}]`);
        continue; // Strip key
      }

      cleanedObj[key] = cleanInput(input[key], path ? `${path}.${key}` : key);
    }
    return cleanedObj;
  }

  // Handle strings for XSS/HTML Injection
  if (typeof input === 'string') {
    let cleanedStr = input;

    // Case-insensitive check and removal of <script>...</script> blocks
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    if (scriptRegex.test(cleanedStr)) {
      logger.warn(`⚠️ Security Alert: Blocked XSS script element injection in field path [${path}]`);
      cleanedStr = cleanedStr.replace(scriptRegex, '');
    }

    // Case-insensitive removal of arbitrary HTML tag patterns
    const tagRegex = /<[^>]*>/g;
    if (tagRegex.test(cleanedStr)) {
      logger.warn(`⚠️ Security Alert: Blocked HTML injection in field path [${path}]`);
      cleanedStr = cleanedStr.replace(tagRegex, '');
    }

    return cleanedStr;
  }

  return input;
};

/**
 * Express middleware performing global sanitization across request payload spaces
 */
export const sanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body) req.body = cleanInput(req.body, 'body');
    if (req.query) req.query = cleanInput(req.query, 'query');
    if (req.params) req.params = cleanInput(req.params, 'params');
  } catch (err) {
    logger.error(`Sanitization failure encountered: ${err.message}`);
  }
  next();
};

export default sanitizeMiddleware;
