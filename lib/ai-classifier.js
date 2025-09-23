import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

const DEPARTMENTS = [
  "Engineering Department",
  "Public Safety Office",
  "Health Office",
  "Social Services",
  "Environmental Office",
  "Administrative Office",
  "Barangay Captain Office",
]

const COMPLAINT_CATEGORIES = {
  "Waste Management": ["Garbage Collection", "Recycling", "Street Cleaning", "Dump Site Issues"],
  "Infrastructure": ["Road Repairs", "Streetlights", "Drainage", "Public Facilities", "Bridge Maintenance"],
  "Noise Disturbance": ["Loud Music", "Construction Noise", "Vehicle Noise", "Commercial Noise"],
  "Safety/Security": ["Crime Reports", "Unsafe Areas", "Security Concerns", "Traffic Safety"],
  "Public Health": ["Health Hazards", "Sanitation", "Medical Emergencies", "Disease Prevention"],
  "Administrative": ["Permits", "Documentation", "General Inquiries", "Service Requests"],
  "Other": ["Miscellaneous", "General Complaints", "Unspecified Issues"]
}

export async function classifyComplaint(
  title,
  description,
  location = null
) {
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

  // Check if API keys are available
  const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
  const hasXaiKey = process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your_xai_api_key_here'

  if (!hasGroqKey && !hasXaiKey) {
    console.log("No API keys configured, using rule-based classification")
    return getRuleBasedClassification(title, description, location)
  }

  try {
    // Try Groq first (faster for classification tasks)
    if (hasGroqKey) {
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt,
        temperature: 0.1, // Low temperature for consistent classification
      })

      const result = JSON.parse(text.trim()) 

      // Validate the result
      if (!result.category || !result.priority || !result.suggested_department) {
        throw new Error("Invalid classification result")
      }

      return result
    }
  } catch (error) {
    console.error("Groq classification failed, trying xAI:", error)

    try {
      // Fallback to xAI Grok
      if (hasXaiKey) {
        const { text } = await generateText({
          model: xai("grok-beta"),
          prompt,
          temperature: 0.1,
        })

        const result = JSON.parse(text.trim()) 

        if (!result.category || !result.priority || !result.suggested_department) {
          throw new Error("Invalid classification result")
        }

        return result
      }
    } catch (fallbackError) {
      console.error("Both AI services failed:", fallbackError)
    }
  }

  // Fallback to rule-based classification
  console.log("AI services unavailable, using rule-based classification")
  return getRuleBasedClassification(title, description, location)
}

function getRuleBasedClassification(title, description, location) {
  const text = `${title} ${description}`.toLowerCase()
  
  // Category classification based on keywords
  let category = 'Other'
  let subcategory = 'General'
  let confidence = 0.7
  
  if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('basura')) {
    category = 'Waste Management'
    subcategory = 'Garbage Collection'
    confidence = 0.9
  } else if (text.includes('road') || text.includes('street') || text.includes('pothole') || text.includes('kalsada')) {
    category = 'Infrastructure'
    subcategory = 'Road Maintenance'
    confidence = 0.85
  } else if (text.includes('noise') || text.includes('loud') || text.includes('music') || text.includes('ingay')) {
    category = 'Noise Disturbance'
    subcategory = 'Loud Music'
    confidence = 0.8
  } else if (text.includes('crime') || text.includes('safety') || text.includes('security') || text.includes('krimen')) {
    category = 'Safety/Security'
    subcategory = 'Crime Report'
    confidence = 0.9
  } else if (text.includes('health') || text.includes('sanitation') || text.includes('disease') || text.includes('kalusugan')) {
    category = 'Public Health'
    subcategory = 'Health Hazard'
    confidence = 0.85
  }
  
  // Priority classification
  let priority = 'medium'
  let urgency_score = 5
  
  if (text.includes('urgent') || text.includes('emergency') || text.includes('immediate') || text.includes('madalian')) {
    priority = 'urgent'
    urgency_score = 9
  } else if (text.includes('high') || text.includes('serious') || text.includes('dangerous') || text.includes('mataas')) {
    priority = 'high'
    urgency_score = 7
  } else if (text.includes('low') || text.includes('minor') || text.includes('small') || text.includes('mababa')) {
    priority = 'low'
    urgency_score = 3
  }
  
  // Sentiment analysis
  let sentiment = 'neutral'
  if (text.includes('thank') || text.includes('appreciate') || text.includes('good') || text.includes('salamat')) {
    sentiment = 'positive'
  } else if (text.includes('angry') || text.includes('frustrated') || text.includes('terrible') || text.includes('galit')) {
    sentiment = 'negative'
  }
  
  // Extract keywords
  const keywords = text.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'they', 'been', 'were', 'said'].includes(word))
    .slice(0, 5)
  
  // Department suggestion
  const departmentMap = {
    'Waste Management': 'Environmental Office',
    'Infrastructure': 'Engineering Department',
    'Noise Disturbance': 'Public Safety Office',
    'Safety/Security': 'Public Safety Office',
    'Public Health': 'Health Office',
    'Administrative': 'Administrative Office',
    'Other': 'Administrative Office'
  }
  
  const suggested_department = departmentMap[category] || 'Administrative Office'
  
  // Resolution time estimation
  const estimated_resolution_days = priority === 'urgent' ? 1 : priority === 'high' ? 3 : priority === 'medium' ? 7 : 14
  
  return {
    category,
    subcategory,
    priority,
    urgency_score,
    sentiment,
    keywords,
    suggested_department,
    estimated_resolution_days,
    confidence,
    source: 'rule-based'
  }
}

export async function generateResponseSuggestion(
  complaint,
  classification
) {
  const template = `
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

This matter h forwarded to our ${classification.suggested_department} for proper handling. We expect to provide updates within ${classification.estimated_resolution_days} days.

We appreciate your patience  work to address your concerns.

Respectfully,
Barangay Office`
  }

  // For now, return a mock response
  // In a real implementation, this would call an AI service
  return template
}
