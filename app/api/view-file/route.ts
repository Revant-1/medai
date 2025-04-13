import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { get } from "@vercel/blob"

export async function GET(req: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get URL parameters
    const url = new URL(req.url)
    const pathname = url.searchParams.get("pathname")

    if (!pathname) {
      return NextResponse.json({ error: "No pathname provided" }, { status: 400 })
    }

    // Get file from Vercel Blob
    const blob = await get(pathname)

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Redirect to the file URL
    return NextResponse.redirect(blob.url)
  } catch (error) {
    console.error("View file API error:", error)
    return NextResponse.json({ error: "Failed to view file" }, { status: 500 })
  }
}
