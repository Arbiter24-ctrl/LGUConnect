import { NextResponse } from "next/server"
import { classifyComplaint } from "@/lib/ai-classifier"

export async function POST(request) {
  try {
    const { title, description, location } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const classification = await classifyComplaint(title, description, location)

    return NextResponse.json({
      success: true,
      data: classification
    })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Failed to classify complaint" }, { status: 500 })
  }
}
