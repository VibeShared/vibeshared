import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";

/**
 * GET /api/user/search?q=...&limit=10&skip=0
 * Instagram-style search: username prioritized, paginated
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // max 50
    const skip = parseInt(searchParams.get("skip") || "0");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const regex = new RegExp(query, "i");

    /**
     * Aggregation pipeline:
     * 1. Filter active users
     * 2. Match username OR name
     * 3. Add ranking:
     *    - Exact username match = highest
     *    - Partial username = next
     *    - Name match = last
     * 4. Project sanitized fields
     * 5. Sort by rank
     * 6. Pagination
     */
    const users = await User.aggregate([
      {
        $match: {
          status: "active",
          $or: [
            { username: regex },
            { name: regex },
          ],
        },
      },
      {
        $addFields: {
          rank: {
            $switch: {
              branches: [
                { case: { $eq: ["$username", query.toLowerCase()] }, then: 3 },
                { case: { $regexMatch: { input: "$username", regex } }, then: 2 },
                { case: { $regexMatch: { input: "$name", regex } }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { rank: -1, username: 1 } },
      {
        $project: {
          _id: 1, // Change 0 to 1 to include the ID
          username: 1,
          name: 1,
          image: 1,
          isVerified: 1,
          bio: 1, // Include bio since your frontend interface expects it
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const sanitizedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return NextResponse.json({ users: sanitizedUsers });

   
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
