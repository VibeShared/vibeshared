// components/CreatePost.tsx
"use client";
import { useState, useRef } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Image, Camera, Calendar, X, Globe } from "react-bootstrap-icons";
import { useSession } from "next-auth/react";
// import { CreatePostSchema } from "@/lib/validations/post";
import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z
    .string()
    .max(1000, "Content must be less than 1000 characters")
    .optional(),
  media: z.string().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
});

interface CreatePostProps {
  onPostCreate?: () => void;
  isOwnProfile: boolean;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function CreatePost({
  onPostCreate,
  isOwnProfile = false,
}: CreatePostProps) {
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const handleSubmit = async () => {
    setError("");
    setValidationErrors({});

    // Client-side validation with Zod
    try {
      CreatePostSchema.parse({
        content: postContent,
        media: media ? "exists" : undefined,
        mediaType: media?.type,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setValidationErrors(errors);
        return;
      }
    }

    if (!postContent.trim() && !media) {
      setError("Please add some content or media to your post");
      return;
    }

    setIsUploading(true);

    try {
      let mediaBase64 = "";
      let mediaType: "image" | "video" | undefined;

      if (media) {
        mediaType = media.type;
        mediaBase64 = await convertToBase64(media.file);
      }

      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postContent,
          media: mediaBase64,
          mediaType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.details)) {
          // ✅ Transform Zod issues array into key-value object
          const serverErrors: Record<string, string> = {};
          data.details.forEach((issue: any) => {
            const field = issue.path?.[0] || "general";
            serverErrors[field] = issue.message;
          });
          setValidationErrors(serverErrors);
        } else {
          setError(data.error || "Failed to create post");
        }
        return;
      }

      // Reset form
      setPostContent("");
      setMedia(null);
      setShowModal(false);
      onPostCreate?.();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : null;

    if (!fileType) {
      setError("Please select an image or video file");
      return;
    }

    if (fileType === "video" && file.size > 50 * 1024 * 1024) {
      setError("Video files must be smaller than 50MB");
      return;
    }

    setMedia({
      file,
      preview: URL.createObjectURL(file),
      type: fileType,
    });
    setError("");
    setValidationErrors((prev) => ({ ...prev, media: "" }));
  };

  const removeMedia = () => {
    if (media?.preview) {
      URL.revokeObjectURL(media.preview);
    }
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValidationErrors((prev) => ({ ...prev, media: "" }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
    if (validationErrors.content) {
      setValidationErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  return (
    <>
      {/* Create Post Card */}
            {isOwnProfile && (
      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle me-3 shadow-sm"
              style={{
                width: "50px",
                height: "50px",
                backgroundImage: `url(${
                  session?.user?.image || "/avatar.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
              <Button
                variant="light"
                className="flex-grow-1 text-start px-3 py-2 rounded-pill border-0"
                style={{ backgroundColor: "#f0f2f5", color: "#65676b" }}
                onClick={() => setShowModal(true)}
              >
                What's on your mind, {session?.user?.name}?
              </Button>
          </div>

          <hr className="my-3" />

          {/* <Row className="g-2">
            <Col>
            <Button variant="outline-light" className="w-100 rounded-pill text-muted" onClick={() => fileInputRef.current?.click()}>
            <Image className="me-2 text-primary" /> Photo/Video
            </Button>
            </Col>
            <Col>
            <Button variant="outline-light" className="w-100 rounded-pill text-muted">
            <Camera className="me-2 text-success" /> Live Video
            </Button>
            </Col>
            <Col>
            <Button variant="outline-light" className="w-100 rounded-pill text-muted">
            <Calendar className="me-2 text-warning" /> Event
            </Button>
            </Col>
            </Row> */}
        </Card.Body>
      </Card>
            )}

      {/* Create Post Modal */}
      <Modal
        show={showModal}
        onHide={() => !isUploading && setShowModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header className="border-0 pb-0 position-relative">
          <Modal.Title className="fw-bold fs-5 text-center w-100">
            Create Post
          </Modal.Title>
          <Button
            variant="light"
            size="sm"
            className="position-absolute end-0 top-0 rounded-circle"
            style={{ width: "36px", height: "36px" }}
            onClick={() => setShowModal(false)}
            disabled={isUploading}
          >
            <X size={20} />
          </Button>
        </Modal.Header>

        <Modal.Body className="pt-0">
          <div className="d-flex mb-3">
            <div
              className="rounded-circle me-3"
              style={{
                width: "40px",
                height: "40px",
                backgroundImage: `url(${
                  session?.user?.image ||
                  "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div>
              <div className="fw-semibold">{session?.user?.name}</div>
              <small className="text-muted d-flex align-items-center">
                <Globe size={12} className="me-1" /> Public
              </small>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}
          {validationErrors.content && (
            <Alert variant="danger" className="py-2">
              {validationErrors.content}
            </Alert>
          )}
          {validationErrors.media && (
            <Alert variant="danger" className="py-2">
              {validationErrors.media}
            </Alert>
          )}

          <Form>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                className="border-0 shadow-none fs-6"
                placeholder="What's on your mind?"
                value={postContent}
                onChange={handleContentChange}
                style={{
                  resize: "none",
                  backgroundColor: "transparent",
                  padding: "0",
                  minHeight: "120px",
                }}
                disabled={isUploading}
                isInvalid={!!validationErrors.content}
              />
            </Form.Group>

            {media && (
              <div className="position-relative mt-3 w-25">
                {media.type === "image" ? (
                  <img
                    src={media.preview}
                    alt="Preview"
                    className="img-fluid rounded-3 w-100"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                ) : (
                  <video
                    src={media.preview}
                    controls
                    className="img-fluid rounded-3 w-100"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                )}
                <Button
                  variant="dark"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2 rounded-circle"
                  style={{ width: "30px", height: "30px" }}
                  onClick={removeMedia}
                  disabled={isUploading}
                >
                  <X size={14} />
                </Button>
              </div>
            )}

            <Card
              className="mt-3 border-0 rounded-3"
              style={{ backgroundColor: "#f0f2f5" }}
            >
              <Card.Body className="py-2">
                <Row className="g-2">
                  <Col>
                    <Button
                      variant="outline-light"
                      className="w-100 rounded-pill text-muted"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Image className="me-2 text-primary" /> Add to your post
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              style={{ display: "none" }}
              disabled={isUploading}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            className="rounded-pill px-4"
            onClick={() => setShowModal(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4"
            onClick={handleSubmit}
            disabled={(!postContent.trim() && !media) || isUploading}
          >
            {isUploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
