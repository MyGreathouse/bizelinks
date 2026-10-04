import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Default config. Incremental cache (R2/KV) is added in Phase 2, when public
// pages start being cached — not before it is needed.
export default defineCloudflareConfig({})
