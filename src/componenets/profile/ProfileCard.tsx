"use client";
import { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { Session } from "next-auth";
import { z } from "zod";

// ✅ Type-safe props
interface ProfileCardProps {
  session: Session | null;
}

// ✅ Schema validation (for editing profile)
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional(),
});

export default function ProfileCard({ session }: ProfileCardProps) {
  const user = session?.user;

  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "",
    location: "",
    website: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }
    console.log("Updated profile:", result.data);
    setShowEdit(false);
  };

  return (
    <Card as="section" className="shadow-sm mb-4" aria-labelledby="profile-heading">
      <Card.Body>
        {/* Profile Picture */}
        <div className="d-flex flex-column align-items-center text-center mb-3">
          <img
            src={user?.image || "https://via.placeholder.com/150"}
            alt={`${user?.name || "User"} profile picture`}
            width={120}
            height={120}
            className="rounded-circle border border-3 border-white object-cover"
          />
          <h1 id="profile-heading" className="h4 mt-2 mb-1">
            {formData.name || "Guest User"}
          </h1>
          <p className="text-muted mb-1">
            @{user?.email?.split("@")[0] || "guest"}
          </p>
          {formData.bio && (
            <p className="fst-italic" aria-label="User bio">
              {formData.bio}
            </p>
          )}
        </div>

        {/* Location & Website */}
        <ul className="list-unstyled small text-muted mb-3">
          {formData.location && (
            <li>
              📍 <span aria-label="Location">{formData.location}</span>
            </li>
          )}
          {formData.website && (
            <li>
              🔗{" "}
              <a
                href={formData.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.website}
              </a>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="d-flex justify-content-center gap-2">
          <Button
            variant="primary"
            size="sm"
            aria-label="Edit profile"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            aria-label="View settings"
          >
            Settings
          </Button>
        </div>
      </Card.Body>

      {/* ---- Edit Profile Modal ---- */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="name">Name</Form.Label>
              <Form.Control
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="bio">Bio</Form.Label>
              <Form.Control
                id="bio"
                as="textarea"
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell something about yourself"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="location">Location</Form.Label>
              <Form.Control
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, Country"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="website">Website</Form.Label>
              <Form.Control
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
