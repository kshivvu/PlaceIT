// Extracts "two-sum" from "https://leetcode.com/problems/two-sum/"
export function extractSlug(url: string): string {
  const match = url.match(/problems\/([^/]+)/)
  return match ? match[1] : ""
}

export async function checkLeetcodeProblem(
  username: string,
  problemUrl: string
): Promise<boolean> {
  const slug = extractSlug(problemUrl)
  if (!slug) return false

  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
        timestamp
      }
    }
  `

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query,
        variables: { username, limit: 20 }
      }),
    })

    if (!response.ok) return false

    const data = await response.json()
    const submissions = data?.data?.recentAcSubmissionList ?? []

    // Check if any recent submission matches this problem slug
    return submissions.some(
      (s: { titleSlug: string }) => s.titleSlug === slug
    )

  } catch {
    // LeetCode API down or rate limited — return false gracefully
    return false
  }
}