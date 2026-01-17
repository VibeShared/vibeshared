import BlockedUser from "@/lib/models/BlockedUser";
import mongoose from "mongoose";

/**
 * Returns true if either user has blocked the other
 */
export async function isBlocked(
  userA: string,
  userB: string
): Promise<boolean> {
  if (
    !mongoose.Types.ObjectId.isValid(userA) ||
    !mongoose.Types.ObjectId.isValid(userB)
  ) {
    return false;
  }

  const blocked = await BlockedUser.exists({
    $or: [
      { blocker: userA, blocked: userB },
      { blocker: userB, blocked: userA },
    ],
  });

  return Boolean(blocked);
}
