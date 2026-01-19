"use client";

import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  FaFacebookF,
  FaWhatsapp,
  FaXTwitter,
  FaLinkedinIn,
  FaRedditAlien,
  FaPinterestP,
  FaThreads,
  FaSnapchat,
  FaEnvelope,
  FaCopy,
} from "react-icons/fa6";
import { Share2 , X } from "lucide-react";

interface ShareButtonProps {
  post: {
    _id: string;
    content?: string;
    userId?: {
      name?: string;
      username?: string;
    };
  };
}

export default function ShareButton({ post }: ShareButtonProps) {
  const [show, setShow] = useState(false);

  if (!post?._id || !post.userId?.username) return null;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL;

  const url = `${origin}/${post.userId.username}/post/${post._id}`;
  const text =
    post.content?.slice(0, 120) || "Check out this post on VibeShared";
  const title = `${post.userId.name ?? "User"} on VibeShared`;

  const open = (shareUrl: string) =>
    window.open(shareUrl, "_blank", "noopener,noreferrer");

  const share = {
    facebook: () =>
      open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`
      ),

    whatsapp: () =>
      open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`),

    twitter: () =>
      open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`
      ),

    linkedin: () =>
      open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`
      ),

    reddit: () =>
      open(
        `https://www.reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}`
      ),

    pinterest: () =>
      open(
        `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
          url
        )}&description=${encodeURIComponent(text)}`
      ),

    threads: () =>
      open(
        `https://www.threads.net/intent/post?text=${encodeURIComponent(
          text + " " + url
        )}`
      ),

    snapchat: () =>
      open(
        `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(
          url
        )}`
      ),

    email: () =>
      open(
        `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(text + "\n\n" + url)}`
      ),

    copy: async () => {
      await navigator.clipboard.writeText(url);
      alert("🔗 Link copied");
    },

    native: async () => {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await share.copy();
      }
    },
  };

  return (
    <>
      {/* Share Trigger */}
      <button
        className="btn btn-sm mb-5"
        aria-label="Share post"
        onClick={() => setShow(true)}
      >
        <Share2 size={24} />
      </button>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header className="justify-content-between">
          <Modal.Title>Share</Modal.Title>
          <Button variant="light" onClick={() => setShow(false)}>
            <X />
          </Button>
        </Modal.Header>

        <Modal.Body className="share-icon-grid">
  <button className="share-icon" onClick={share.facebook}>
    <FaFacebookF size={22} />
  </button>

  <button className="share-icon" onClick={share.whatsapp}>
    <FaWhatsapp size={22} />
  </button>

  <button className="share-icon" onClick={share.twitter}>
    <FaXTwitter size={22} />
  </button>

  <button className="share-icon" onClick={share.linkedin}>
    <FaLinkedinIn size={22} />
  </button>

  <button className="share-icon" onClick={share.reddit}>
    <FaRedditAlien size={22} />
  </button>

  <button className="share-icon" onClick={share.pinterest}>
    <FaPinterestP size={22} />
  </button>

  <button className="share-icon" onClick={share.threads}>
    <FaThreads size={22} />
  </button>

  <button className="share-icon" onClick={share.snapchat}>
    <FaSnapchat size={22} />
  </button>

  <button className="share-icon" onClick={share.email}>
    <FaEnvelope size={22} />
  </button>

  <button className="share-icon" onClick={share.copy}>
    <FaCopy size={22} />
  </button>
</Modal.Body>

      </Modal>
    </>
  );
}
