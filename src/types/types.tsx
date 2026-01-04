// types.ts

export interface User {
  _id: string;
  name: string;
  image?: string;
}

export interface PopulatedComment {
  _id: string;
  text: string;
  postId?: string;        // ✅ made optional
  userId: User;
  createdAt?: string;     // ✅ made optional
  updatedAt?: string;     // ✅ made optional
}

export interface Post {
  _id: string;
  content: string;
  mediaUrl?: string;
  userId: User;
  likesCount: number;
  comments: PopulatedComment[];
}
