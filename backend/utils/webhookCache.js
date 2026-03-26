/**
 * Webhook Deduplication Utility
 *
 * Prevents duplicate webhook processing using in-memory cache.
 * For production, this should use Redis for multi-instance support.
 *
 * Usage:
 *   const { isWebhookProcessed, markWebhookProcessed } = require('./utils/webhookCache');
 *
 *   if (await isWebhookProcessed(webhookId)) {
 *     return res.status(200).json({ received: true, status: 'duplicate' });
 *   }
 *
 *   // Process webhook...
 *
 *   await markWebhookProcessed(webhookId, metadata);
 */

// In-memory cache for webhook IDs
// For production with multiple instances, use Redis
const processedWebhooks = new Map();

const WEBHOOK_TTL = 86400 * 1000; // 24 hours in milliseconds

/**
 * Check if a webhook has already been processed
 * @param {string} webhookId - Unique webhook identifier
 * @returns {Promise<boolean>} - True if already processed
 */
async function isWebhookProcessed(webhookId) {
  if (!webhookId) return false;

  const entry = processedWebhooks.get(webhookId);
  if (!entry) return false;

  // Check if entry has expired
  if (Date.now() > entry.expiresAt) {
    processedWebhooks.delete(webhookId);
    return false;
  }

  return true;
}

/**
 * Mark a webhook as processed
 * @param {string} webhookId - Unique webhook identifier
 * @param {object} metadata - Optional metadata to store
 * @returns {Promise<void>}
 */
async function markWebhookProcessed(webhookId, metadata = {}) {
  if (!webhookId) return;

  processedWebhooks.set(webhookId, {
    processedAt: new Date().toISOString(),
    expiresAt: Date.now() + WEBHOOK_TTL,
    ...metadata,
  });

  // Cleanup old entries periodically
  if (processedWebhooks.size > 1000) {
    cleanupExpiredEntries();
  }
}

/**
 * Remove expired entries from cache
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [webhookId, entry] of processedWebhooks.entries()) {
    if (now > entry.expiresAt) {
      processedWebhooks.delete(webhookId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[WebhookCache] Cleaned ${cleaned} expired entries`);
  }
}

/**
 * Get cache statistics (for monitoring)
 */
function getCacheStats() {
  return {
    size: processedWebhooks.size,
    entries: Array.from(processedWebhooks.keys()),
  };
}

/**
 * Clear all cache (for testing)
 */
function clearCache() {
  processedWebhooks.clear();
}

// Cleanup expired entries every hour
setInterval(cleanupExpiredEntries, 60 * 60 * 1000);

module.exports = {
  isWebhookProcessed,
  markWebhookProcessed,
  getCacheStats,
  clearCache,
};
