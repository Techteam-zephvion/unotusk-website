import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

// AI / LLM crawlers we explicitly grant access to, in addition to the
// catch-all rule. Several of these (Google-Extended, anthropic-ai,
// Applebot-Extended, CCBot…) only allow AI use when named directly, so we
// opt in by listing them. Everyone else is already covered by '*'.
const AI_AGENTS = [
  // Anthropic / Claude
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'Claude-SearchBot',
  'Claude-User',
  // OpenAI / ChatGPT
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Google / Gemini
  'Googlebot',
  'Google-Extended',
  'GoogleOther',
  // Microsoft / Bing / Copilot
  'bingbot',
  // Apple
  'Applebot',
  'Applebot-Extended',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Meta / Llama
  'meta-externalagent',
  'FacebookBot',
  // Amazon
  'Amazonbot',
  // Mistral
  'MistralAI-User',
  // Cohere
  'cohere-ai',
  // You.com
  'YouBot',
  // DuckDuckGo assist
  'DuckAssistBot',
  // Common Crawl (feeds many open models)
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://unotusk.com/sitemap.xml',
    host: 'https://unotusk.com',
  }
}
