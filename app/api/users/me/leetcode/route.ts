import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Basic check mapping to LeetCode API
async function checkLeetcodeExists(username: string): Promise<boolean> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
  "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
            }
          }
        `,
        variables: { username },
      }),
    });
    
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.data?.matchedUser?.username;
  } catch (e) {
    return false;
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leetcodeUsername } = body;

    if (!leetcodeUsername) {
      return NextResponse.json({ error: "leetcodeUsername is required" }, { status: 400 });
    }

    const isValid = await checkLeetcodeExists(leetcodeUsername);
    if (!isValid) {
      return NextResponse.json({ error: "LeetCode username not found" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { leetcodeUsername },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/users/me/leetcode Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
