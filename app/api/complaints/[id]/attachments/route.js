import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function POST(request, { params }) {
  try {
    const complaintId = Number.parseInt(params.id)
    if (!complaintId) {
      return NextResponse.json({ success: false, error: "Invalid complaint id" }, { status: 400 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 })
    }

    // Ensure uploads directory exists under public
    const uploadsDir = path.join(process.cwd(), "public", "uploads", String(complaintId))
    fs.mkdirSync(uploadsDir, { recursive: true })

    const saved = []
    for (const file of files) {
      if (typeof file === "string") continue
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = path.extname(file.name) || ""
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const destPath = path.join(uploadsDir, safeName)
      fs.writeFileSync(destPath, buffer)

      const relativePath = `/uploads/${complaintId}/${safeName}`
      const mime = file.type || "application/octet-stream"
      const fileType = mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : "image"
      const fileSize = buffer.length

      await db.insert(
        `INSERT INTO complaint_attachments (complaint_id, file_path, file_type, file_size) VALUES (?, ?, ?, ?)`,
        [complaintId, relativePath, fileType, fileSize]
      )

      saved.push({ path: relativePath, type: fileType, size: fileSize })
    }

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (error) {
    console.error("Error uploading attachments:", error)
    return NextResponse.json({ success: false, error: "Failed to upload attachments" }, { status: 500 })
  }
}



