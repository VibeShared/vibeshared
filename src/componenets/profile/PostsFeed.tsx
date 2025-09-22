"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import style from "@/styles/componenet/profile/PostsFeed.module.css";

interface CloudinaryFile {
  url: string;
  postId: string;
  userId: string;
}

interface PostsFeedProps {
  userId: string;
}

export default function PostsFeed({ userId }: PostsFeedProps) {
  const router = useRouter();
  const params = useParams();

  const [media, setMedia] = useState<CloudinaryFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchMedia() {
      try {
        setLoading(true);
        const res = await fetch(`/api/user-media/${userId}`);
        const data = await res.json();
        setMedia(data.media || []);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [userId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <Spinner animation="border" />
      </div>
    );
  }

  if (media.length === 0) {
    return <p className="text-muted text-center my-3">No posts yet</p>;
  }

  return (
    <div className={style.instaGrid}>
      {media.map((item, index) => {
        const isVideo = item.url.match(/\.(mp4|webm|ogg)$/i);
        return (
          <div
            key={`${item.postId}-${index}`}
            className={style.instaItem}
            onClick={() => router.push(`/post/${userId}`)}
          >
            {isVideo ? (
              <>
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className={style.instaVideo}
                  onLoadedMetadata={(e) => (e.currentTarget.currentTime = 0.1)}
                />
                <div className={style.instaOverlay}>
                  <i className="bi bi-play-fill"></i>
                </div>
              </>
            ) : (
              <img src={item.url} className={style.instaImg} alt="post" />
            )}
          </div>
        );
      })}
    </div>
  );
}
