import { Types } from "mongoose";
import { Follower } from "@/lib/models/Follower";

/**
 * Checks if viewerId follows ownerId
 */
export async function isFollower(
  viewerId: string,
  ownerId: Types.ObjectId
): Promise<boolean> {
  if (!Types.ObjectId.isValid(viewerId)) return false;

  const exists = await Follower.exists({
    follower: new Types.ObjectId(viewerId),
    following: ownerId,
  });

  return !!exists;
}
