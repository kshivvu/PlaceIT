import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkLeetcodeProblem } from "@/lib/leetcode"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }

  // Only faculty can trigger manual checks
  if (session.user.role !== "FACULTY" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")
  const problemUrl = searchParams.get("problemUrl")

  if (!username || !problemUrl) {
    return NextResponse.json(
      { error: "username and problemUrl are required" },
      { status: 400 }
    )
  }

  try {
    const solved = await checkLeetcodeProblem(username, problemUrl)
    return NextResponse.json({ solved, username, problemUrl })
  } catch {
    return NextResponse.json(
      {
        error: "LEETCODE_API_UNAVAILABLE",
        message: "Could not reach LeetCode. Please verify manually.",
        problemUrl, // return the URL so faculty can click it
      },
      { status: 503 } // 503 = Service Unavailable (external dependency down)
    )
  }
}