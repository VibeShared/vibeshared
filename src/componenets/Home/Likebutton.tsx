"use client";
import style from '@/styles/componenet/Home/HeroSction.module.css';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LikebuttonProps {
  likes: number;
  id: string;
  category: "bollywood" | "kollywood" | "tollywood";
}

export default function Likebutton({ likes, id, category }: LikebuttonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(likes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/${category}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setLikeCount(data.likes);
      } else {
        console.error("Failed to update likes:", data.error);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      type="button"
      className={`${style.btn} btn btn-primary`}
      disabled={loading}
    >
      Like {likeCount}
    </button>
  );
}

