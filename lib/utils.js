import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Attempt to auto-translate Cebuano/Filipino to English for AI processing
export async function translateToEnglish(text) {
  try {
    if (!text || typeof text !== 'string') return text
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
    const hasXaiKey = process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your_xai_api_key_here'

    if (!hasGroqKey && !hasXaiKey) {
      return text
    }

    const prompt = `Translate the following text from Cebuano/Filipino (or mixed) to clear English. Only return the translated text without quotes or extra commentary.\n\nText: ${text}`

    // Prefer Groq
    if (hasGroqKey) {
      const { generateText } = await import('ai')
      const { groq } = await import('@ai-sdk/groq')
      const { text: out } = await generateText({ model: groq('llama-3.1-8b-instant'), prompt, temperature: 0 })
      return (out || '').trim() || text
    }

    // Fallback xAI
    if (hasXaiKey) {
      const { generateText } = await import('ai')
      const { xai } = await import('@ai-sdk/xai')
      const { text: out } = await generateText({ model: xai('grok-beta'), prompt, temperature: 0 })
      return (out || '').trim() || text
    }

    return text
  } catch (err) {
    console.error('translateToEnglish failed:', err.message)
    return text
  }
}
