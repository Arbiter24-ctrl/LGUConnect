import { NextResponse } from "next/server"
import { classifyComplaint } from "@/lib/ai-classifier"
import { translateToEnglish } from "@/lib/utils"

export async function POST(request) {
  try {
    const { title, description, location } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    // Auto-translate Cebuano/Filipino to English for better AI understanding
    const [titleEn, descriptionEn] = await Promise.all([
      translateToEnglish(title),
      translateToEnglish(description)
    ])

    const classification = await classifyComplaint(titleEn, descriptionEn, location)

    return NextResponse.json({
      success: true,
      data: classification
    })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Failed to classify complaint" }, { status: 500 })
  }
}
