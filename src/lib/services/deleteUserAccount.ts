import mongoose from "mongoose";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Likes";
import { Follower } from "@/lib/models/Follower";
import { Notification } from "@/lib/models/Notification";
import BlockedUser from "@/lib/models/BlockedUser";
import cloudinary from "@/lib/cloudinary";

export async function deleteUserAccount(userId: string) {
  const _id = new mongoose.Types.ObjectId(userId);
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const user = await User.findById(_id).session(session);
    if (!user) throw new Error("User not found");

    /* ---------- POSTS + MEDIA ---------- */
    const posts = await Post.find({ userId: _id })
  .select("_id cloudinary_id")
  .session(session);

const postIds = posts.map(p => p._id);

/* delete interactions on these posts */
await Comment.deleteMany({ postId: { $in: postIds } }).session(session);
await Like.deleteMany({ postId: { $in: postIds } }).session(session);
await Notification.deleteMany({ postId: { $in: postIds } }).session(session);

/* delete media */
for (const post of posts) {
  if (post.cloudinary_id) {
    await cloudinary.uploader.destroy(post.cloudinary_id);
  }
}

/* delete posts */
await Post.deleteMany({ _id: { $in: postIds } }).session(session);

    /* ---------- COMMENTS ---------- */
    await Comment.deleteMany({ userId: _id }).session(session);

    /* ---------- LIKES + COUNTERS ---------- */
    const likes = await Like.find({ userId: _id }).session(session);
    for (const like of likes) {
      await Post.updateOne(
        { _id: like.postId },
        { $inc: { likesCount: -1 } }
      ).session(session);
    }
    await Like.deleteMany({ userId: _id }).session(session);

    /* ---------- FOLLOW GRAPH ---------- */
    await Follower.deleteMany({
      $or: [{ follower: _id }, { following: _id }],
    }).session(session);

    /* ---------- NOTIFICATIONS ---------- */
    await Notification.deleteMany({
      $or: [{ user: _id }, { sender: _id }],
    }).session(session);

    /* ---------- BLOCK LIST ---------- */
    await BlockedUser.deleteMany({
      $or: [{ blocker: _id }, { blocked: _id }],
    }).session(session);

    /* ---------- PROFILE IMAGE ---------- */
    if (user.cloudinary_id && !user.image?.includes("default")) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }

    /* ---------- USER ---------- */
    await User.deleteOne({ _id }).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
