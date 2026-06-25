// 500-item pool of realistic project memory fragments.
// Each visit, a random subset is displayed and a random chain is selected for reconstruction.

export const FRAGMENT_POOL: string[] = [
  // Git artifacts
  'commit a9f83d', 'commit 3b1f72', 'commit d44c90', 'commit 88ae12', 'commit 1f5d33',
  'PR-482', 'PR-103', 'PR-891', 'PR-227', 'PR-560', 'PR-318', 'PR-744', 'PR-612',
  'merge conflict', 'revert 3a1b2c', 'branch: hotfix', 'branch: release/2.4',
  'cherry-pick', 'force push', 'squash merge', 'tag: v2.3.1', 'tag: v1.9.0',
  // File names
  'checkout.ts', 'auth-flow.ts', 'webhook.ts', 'retry.ts', 'payments.ts',
  'session.ts', 'cache.ts', 'queue.ts', 'router.ts', 'middleware.ts',
  'db/migrations/004', 'api/stripe.ts', 'api/auth.ts', 'utils/rateLimit.ts',
  'services/email.ts', 'hooks/useSession.ts', 'lib/logger.ts', 'config/prod.ts',
  'types/payment.ts', 'tests/checkout.spec.ts', 'schema.prisma', 'seed.ts',
  // Decisions
  'Rejected', 'WONTFIX', 'deprecated', 'blocked', 'postponed', 'abandoned',
  'Approved', 'Reverted', 'Escalated', 'Archived', 'Closed', 'Resolved',
  // Incidents
  'March Incident', 'P0 Alert', 'Outage — 14min', 'Rollback v2.2', 'Memory Leak',
  'DB Spike', 'Timeout cascade', 'Queue overflow', 'Silent failure', 'Data loss event',
  'Webhook loop', 'Auth outage', 'CDN purge', 'DNS failover', 'Cert renewal',
  // Tools & sources
  'Slack', 'Jira', 'Notion', 'Linear', 'GitHub', 'Confluence', 'PagerDuty',
  'Sentry', 'Datadog', 'Grafana', 'Figma', 'Loom', 'Retool', 'Postman',
  // Technical terms
  'Latency', 'Timeout', 'Rate Limit', 'Memory Leak', 'Deadlock', 'Race Condition',
  'N+1 Query', 'Cache Miss', 'Connection Pool', 'Circuit Breaker', 'Backpressure',
  'Idempotency', 'Retry Storm', 'Cold Start', 'Soft Delete', 'Dual Write',
  'Schema Lock', 'Index Bloat', 'Orphaned Records', 'Cursor Pagination',
  // Roles & ownership
  'Owner: @sara', 'Owner: @dex', 'Owner: @priya', 'Reviewer: @tom',
  'Risk', 'Decision', 'Tech Debt', 'Security Review', 'Compliance Flag',
  // Stripe / payments context
  'Stripe', 'Webhook', 'Idempotency Key', 'Charge Failed', 'Dispute',
  'Refund Logic', 'SCA', '3DS', 'Subscription Pause', 'Invoice Retry',
  'Payment Intent', 'Customer Portal', 'Proration', 'Metered Billing',
  // Auth context
  'JWT Expiry', 'Refresh Token', 'Session Hijack', 'CSRF', 'OAuth Flow',
  'PKCE', 'MFA', 'Role Guard', 'Permission Scope', 'Token Rotation',
  // Infrastructure
  'EC2 Spot', 'Lambda Timeout', 'RDS Failover', 'Redis Eviction',
  'S3 Versioning', 'CloudFront', 'VPC Peering', 'NAT Gateway', 'ALB Rules',
  'ECS Task', 'Auto Scaling', 'Spot Interruption', 'Reserved Instance',
  // Product decisions
  'Scope Creep', 'Feature Flag', 'Kill Switch', 'Gradual Rollout',
  'A/B: variant B', 'Canary: 5%', 'Dark Launch', 'Shadow Mode',
  'Dogfooding', 'Beta Gate', 'Sunset Plan', 'Deprecation Notice',
  // Meetings / process
  'Retro: Q1', 'Postmortem', 'RFC-009', 'ADR-014', 'ADR-022',
  'Architecture Review', 'Design Doc', 'Tech Spec', 'Sprint 44',
  'Incident Review', 'On-call Runbook', 'Runbook: payments',
  // Performance
  'LCP 4.2s', 'CLS 0.18', 'TTI 6.1s', 'Bundle 2.4MB', 'Tree Shaking',
  'Code Split', 'Lazy Load', 'Prefetch', 'Service Worker', 'HTTP/2 Push',
  // Database
  'migration 012', 'migration 019', 'index: user_email', 'VACUUM ANALYZE',
  'Slow Query Log', 'Explain Plan', 'Partial Index', 'Read Replica',
  'Connection Leak', 'Transaction Isolation', 'Savepoint', 'Batch Insert',
  // More commit hashes
  'commit 7c2e18', 'commit b91034', 'commit 5a7f21', 'commit 0d3b88',
  'commit e66109', 'commit 2f4d55', 'commit 9b1c07', 'commit 4a8e3f',
  // Version refs
  'v1.2.0-beta', 'v2.0.0-rc1', 'v2.3.4', 'v3.0.0-alpha', 'v2.2.1-hotfix',
  // Slack channels
  '#incidents', '#deploys', '#payments-eng', '#on-call', '#security',
  '#eng-decisions', '#backend', '#infra-alerts', '#product-feedback',
  // Jira tickets
  'PLAT-1204', 'PLAT-887', 'PAY-340', 'AUTH-112', 'INFRA-559',
  'ENG-2201', 'ENG-1980', 'SEC-044', 'DATA-113', 'OPS-782',
  // Time references
  'March 2024', 'Q4 2023', 'Week 12', '2 months ago', 'Before the migration',
  'Post-launch', 'During freeze', 'Pre-IPO sprint', 'After incident',
  // Free-floating status words
  'critical', 'urgent', 'legacy', 'unstable', 'flaky', 'needs-review',
  'breaking change', 'known issue', 'workaround', 'temporary fix',
]

// Chain templates — groups of 4 fragments that tell a coherent story when reconstructed.
// One chain is randomly selected each visit.
export const CHAIN_TEMPLATES: string[][] = [
  ['checkout.ts', 'Rejected', 'March Incident', 'PR-482'],
  ['Webhook', 'Latency', 'Timeout', 'PR-227'],
  ['auth-flow.ts', 'JWT Expiry', 'Session Hijack', 'Rollback v2.2'],
  ['Stripe', 'Charge Failed', 'Idempotency Key', 'PR-560'],
  ['migration 019', 'DB Spike', 'Slow Query Log', 'PLAT-887'],
  ['Feature Flag', 'Canary: 5%', 'Gradual Rollout', 'A/B: variant B'],
  ['RFC-009', 'postponed', 'deprecated', 'ADR-014'],
  ['payments.ts', 'Dispute', 'Refund Logic', 'PR-318'],
  ['Lambda Timeout', 'Queue overflow', 'Backpressure', 'EC2 Spot'],
  ['OAuth Flow', 'MFA', 'CSRF', 'AUTH-112'],
]

export const CARD_CONTENT: Record<string, { title: string; body: string; meta: string[] }> = {
  '0': {
    title: 'Payment retry logic was previously rejected.',
    body: 'March incident.',
    meta: ['PR-482', 'checkout.ts', 'Rejected'],
  },
  '1': {
    title: 'Webhook latency caused silent timeout cascade.',
    body: 'Unlogged. Never surfaced.',
    meta: ['PR-227', 'Webhook', 'Timeout'],
  },
  '2': {
    title: 'Auth token rotation broke session continuity.',
    body: 'Rolled back silently.',
    meta: ['Rollback v2.2', 'JWT Expiry', 'auth-flow.ts'],
  },
  '3': {
    title: 'Stripe idempotency key was not persisted.',
    body: 'Duplicate charges. Disputed.',
    meta: ['PR-560', 'Stripe', 'Charge Failed'],
  },
  '4': {
    title: 'Migration 019 introduced connection pool exhaustion.',
    body: 'Slow query. Not indexed.',
    meta: ['PLAT-887', 'DB Spike', 'migration 019'],
  },
  '5': {
    title: 'Feature flag left in canary state after sprint end.',
    body: '5% traffic affected for 6 weeks.',
    meta: ['Feature Flag', 'Canary: 5%', 'PR-318'],
  },
  '6': {
    title: 'RFC-009 was postponed. Dependency never removed.',
    body: 'Still referenced in 4 files.',
    meta: ['ADR-014', 'RFC-009', 'deprecated'],
  },
  '7': {
    title: 'Refund logic assumed synchronous Stripe response.',
    body: 'Async edge case never handled.',
    meta: ['PR-318', 'Dispute', 'payments.ts'],
  },
  '8': {
    title: 'Lambda cold start triggered queue overflow.',
    body: 'Backpressure not implemented.',
    meta: ['EC2 Spot', 'Queue overflow', 'Lambda Timeout'],
  },
  '9': {
    title: 'OAuth CSRF bypass discovered post-launch.',
    body: 'MFA not enforced on legacy flow.',
    meta: ['AUTH-112', 'CSRF', 'OAuth Flow'],
  },
}
