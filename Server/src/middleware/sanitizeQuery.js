/**
 * Query Sanitization Middleware
 *
 * 1. Hard-caps pagination 'limit' to prevent DoS attacks via limit=-1 or extremely large numbers.
 * 2. Can be expanded to sanitize other query parameters.
 */

const sanitizeQuery = (maxLimit = 1000) => {
  return (req, res, next) => {
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);

      // If limit is -1 (legacy "fetch all") or larger than maxLimit, cap it.
      if (limit === -1 || limit > maxLimit) {
        req.query.limit = maxLimit.toString();
      }
    }
    next();
  };
};

module.exports = sanitizeQuery;
