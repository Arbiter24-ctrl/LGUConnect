import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

export interface ClassificationResult {
  category: string
  subcategory: string
  priority: "low" | "medium" | "high" | "urgent"
  urgency_score: number
  sentiment: "positive" | "neutral" | "negative"
  keywords: string[]
  suggested_department: string
  estimated_resolution_days: number
}

const COMPLAINT_CATEGORIES = {
  Infrastructure: ["Roads", "Bridges", "Drainage", "Street Lighting", "Public Buildings"],
  "Public Safety": ["Crime", "Traffic", "Emergency Response", "Fire Safety", "Disaster Preparedness"],
  "Health & Sanitation": ["Waste Management", "Water Quality", "Public Health", "Pest Control", "Food Safety"],
  "Social Services": ["Education", "Senior Citizens", "Youth Programs", "Community Events", "Public Assistance"],
  Environmental: ["Pollution", "Noise", "Tree Cutting", "Illegal Dumping", "Air Quality"],
  Administrative: ["Documentation", "Permits", "Certificates", "Public Records", "Government Services"],
}

const DEPARTMENTS = [
  "Engineering Department",
  "Public Safety Office",
  "Health Office",
  "Social Services",
  "Environmental Office",
  "Administrative Office",
  "Barangay Captain Office",
]

export async function classifyComplaint(
  title: string,
  description: string,
  location?: string,
): Promise<ClassificationResult> {
  const prompt = `
You are an AI assistant for a Philippine barangay complaint management system. Analyze the following complaint and provide a structured classification.

Complaint Title: ${title}
Complaint Description: ${description}
Location: ${location || "Not specified"}

Available Categories and Subcategories:
${Object.entries(COMPLAINT_CATEGORIES)
  .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
  .join("\n")}

Available Departments: ${DEPARTMENTS.join(", ")}

Please analyze this complaint and respond with a JSON object containing:
1. category: Main category from the list above
2. subcategory: Specific subcategory from the list above
3. priority: 'low', 'medium', 'high', or 'urgent' based on severity and public impact
4. urgency_score: Number from 1-10 (10 being most urgent)
5. sentiment: 'positive', 'neutral', or 'negative' based on complainant's tone
6. keywords: Array of 3-5 relevant keywords extracted from the complaint
7. suggested_department: Most appropriate department from the list above
8. estimated_resolution_days: Estimated days to resolve (1-30 days)

Consider Filipino context, barangay-level issues, and prioritize public safety and health concerns.

Respond only with valid JSON, no additional text.
`

  try {
    // Try Groq first (faster for classification tasks)
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.1, // Low temperature for consistent classification
    })

    const result = JSON.parse(text.trim()) as ClassificationResult

    // Validate the result
    if (!result.category || !result.priority || !result.suggested_department) {
      throw new Error("Invalid classification result")
    }

    return result
  } catch (error) {
    console.error("Groq classification failed, trying xAI:", error)

    try {
      // Fallback to xAI Grok
      const { text } = await generateText({
        model: xai("grok-beta"),
        prompt,
        temperature: 0.1,
      })

      const result = JSON.parse(text.trim()) as ClassificationResult

      if (!result.category || !result.priority || !result.suggested_department) {
        throw new Error("Invalid classification result")
      }

      return result
    } catch (fallbackError) {
      console.error("Both AI services failed:", fallbackError)

      // Return default classification if AI fails
      return {
        category: "Administrative",
        subcategory: "General",
        priority: "medium",
        urgency_score: 5,
        sentiment: "neutral",
        keywords: [title.split(" ")[0] || "complaint"],
        suggested_department: "Administrative Office",
        estimated_resolution_days: 7,
      }
    }
  }
}

export async function generateResponseSuggestion(
  complaint: any,
  classification: ClassificationResult,
): Promise<string> {
  const prompt = `
You are a barangay official assistant. Generate a professional, empathetic response template for this complaint:

Complaint: ${complaint.title}
Description: ${complaint.description}
Category: ${classification.category}
Priority: ${classification.priority}
Department: ${classification.suggested_department}

Generate a response that:
1. Acknowledges the complaint professionally
2. Shows empathy for the resident's concern
3. Explains the next steps
4. Provides realistic timeline expectations
5. Uses respectful Filipino government communication style

Keep it concise but comprehensive. Write in English but with Filipino government formality.
`

  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.3,
    })

    return text.trim()
  } catch (error) {
    console.error("Failed to generate response suggestion:", error)
    return `Dear Resident,

Thank you for bringing this matter to our attention. We have received your complaint regarding ${complaint.title} and have classified it as ${classification.priority} priority.

This matter has been forwarded to our ${classification.suggested_department} for proper handling. We expect to provide updates within ${classification.estimated_resolution_days} days.

We appreciate your patience as we work to address your concerns.

Respectfully,
Barangay Office`
  }
}
