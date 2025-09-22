// src\componenets\profile\PostsFeed.tsx

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Tabs, Tab, Row, Col } from "react-bootstrap";

interface CloudinaryFile {
  url: string;
  public_id: string;
  format: string;
  resource_type: string;
  postId: string;
  userId: string;
}

interface PostsFeedProps {
  userId: string;
}

export default function ProfilePage({userId}: PostsFeedProps) {
  const router = useRouter();
  const params = useParams();
  // const userId = params?.id as string;

  const [photos, setPhotos] = useState<CloudinaryFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchPhotos() {
      try {
        setLoading(true);
        const res = await fetch(`/api/user-media/${userId}`);
        const data = await res.json();
        
        setPhotos(data.media || []);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [userId]);

  return (
    <Tabs defaultActiveKey="posts" className="mb-3">
      {/* Posts Tab will go here */}

      <Tab eventKey="photos" title="Photos">
        <Card className="shadow-sm ">
          <Card.Body>
            {loading ? (
              <p className="text-muted"> 
                Vibes... <span className="spinner-border"></span>
              </p>
            ) : photos.length === 0 ? (
              <p className="text-muted">No photos found</p>
            ) : (
              <Row>
                {photos.map((photo, index) => (
                  <Col
                    xs={6}
                    sm={4}
                    className="mb-3 "
                    key={`${photo.postId}-${index}`} // ✅ unique key (postId + index)
                  >
                    <div
                      onClick={() => router.push(`/post/${userId}`)}
                      style={{
                        height: "120px",
                        width: "120px",
                        backgroundImage: `url(${photo.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      </Tab>

      {/* About Tab will go here */}
    </Tabs>
  );
}
