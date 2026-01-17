"use client";

import { Modal, Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/ui/FollowButton";

interface FollowersModalProps {
  show: boolean;
  onHide: () => void;
  list: any[];
  title: string;
}

export function FollowersModal({
  show,
  onHide,
  list,
  title,
}: FollowersModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {list.length === 0 ? (
          <p className="text-center text-muted">No {title.toLowerCase()}</p>
        ) : (
          list.map((f, i) => {
            const u = f.user;
            if (!u) return null;

            return (
              <div
                key={u._id || i}
                className="d-flex align-items-center justify-content-between mb-3"
              >
                <Link href={`/profile/${u.username}`} onClick={onHide}>
                  <div className="d-flex align-items-center gap-2">
                    <Image
                    
                      src={u.image || "/avatar.png"}
                      width={40}
                      height={40}
                      className="rounded-circle"
                      alt={u.name || "User Avatar"}
                    />
                    <div>
                      <div className="fw-bold">{u.name}</div>
                      <small className="text-muted">@{u.username}</small>
                    </div>
                  </div>
                </Link>

                <FollowButton
  targetUserId={u._id}
  
/>
              </div>
            );
          })
        )}
      </Modal.Body>
    </Modal>
  );
}
