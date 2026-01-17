import { Follower } from "@/lib/models/Follower";
import User from "@/lib/models/User";
import { isBlocked } from "./isBlocked";

export async function canViewFullProfile(
  viewerId: string | null,
  targetUserId: string
): Promise<boolean> {

  // ✅ OWNER ALWAYS ALLOWED
  if (viewerId && viewerId === targetUserId) return true;

  // Fetch target user privacy
  const target = await User.findById(targetUserId)
    .select("private")
    .lean();

  if (!target) return false;

  // ✅ PUBLIC PROFILE
  if (!target.private) return true;

  // ❌ PRIVATE + NOT LOGGED IN
  if (!viewerId) return false;

  // ❌ BLOCK CHECK
  if (await isBlocked(viewerId, targetUserId)) return false;

  // ✅ PRIVATE + APPROVED FOLLOWER
  const isFollower = await Follower.exists({
    follower: viewerId,
    following: targetUserId,
    status: "approved",
  });

  return !!isFollower;
}
