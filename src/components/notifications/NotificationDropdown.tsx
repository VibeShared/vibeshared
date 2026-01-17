"use client";

import { useState, useEffect, useRef } from "react";
import { Dropdown, Badge, Spinner, Image, Button } from "react-bootstrap";
import Link from "next/link"; // Navigation ke liye better approach

export default function NotificationDropdown({
  userId,
}: {
  userId?: string | null;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch logic same rakhi hai...
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&limit=20`);
      const data = await res.json();
      const notificationsArray = Array.isArray(data)
        ? data
        : data.notifications || [];
      notificationsArray.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          markAll: true,
        }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const markSingleAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationText = (n: any) => {
    const senders = n.senders || (n.sender ? [n.sender] : []);
    const names = senders.map((s: any) => s.name || "Someone");
    let mainText = "";

    if (names.length <= 1) mainText = names[0] || "Someone";
    else if (names.length === 2) mainText = `${names[0]} and ${names[1]}`;
    else mainText = `${names[0]}, ${names[1]} and ${names.length - 2} others`;

    switch (n.type) {
      case "like":
        return `${mainText} liked your post ❤️`;
      case "comment":
  return n.message
    ? `${mainText} commented: "${n.message}"`
    : `${mainText} commented on your post 💬`;
      case "follow":
        return `${mainText} started following you ➕`;
      case "tip":
        return n.message || `${mainText} sent you a tip 💰`;
      case "follow_request":
        return `${mainText} sent you a follow request`;
      default:
        return `${mainText} interacted with you`;
    }
  };

  return (
    <Dropdown
      align="end"
      show={isOpen}
      onToggle={() => setIsOpen((prev) => !prev)}
    >
      <Dropdown.Toggle variant="light" className="position-relative">
        <i className="bi bi-bell" style={{ fontSize: "1.3rem" }}></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ width: "380px", maxHeight: "500px", overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-white">
          <strong style={{ fontSize: "0.9rem" }}>Notifications</strong>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="link"
              onClick={() => markAllAsRead()}
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted py-3">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            // Senders logic fix for ID navigation
            const senderData = n.senders?.[0] || n.sender;

            return (
              <Dropdown.Item
                key={n._id}
                className={`notification-item d-flex align-items-start gap-2 py-3 border-bottom ${
                  n.read ? "opacity-75" : "bg-light fw-bold"
                }`}
                style={{ whiteSpace: "normal", wordBreak: "break-word" }} // 👈 Details cut hone se rokega
                onClick={() => {
                  markSingleAsRead(n._id);

                  if ((n.type === "like" || n.type === "comment") && n.postId) {
                    window.location.href = `/post/${n.postId}`;
                    return;
                  }

                  if (n.type === "follow" || n.type === "follow_request") {
                    if (senderData?.username) {
                      window.location.href = `/profile/${senderData.username}`;
                    }
                  }
                }}
              >
                <Image
                  src={
                    senderData?.image ||
                    "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"
                  }
                  roundedCircle
                  style={{
                    width: "40px",
                    height: "40px",
                    flexShrink: 0,
                    objectFit: "cover",
                  }}
                />
                <div className="flex-grow-1">
                  <div style={{ fontSize: "0.85rem", lineHeight: "1.2" }}>
                    {getNotificationText(n)}
                  </div>
                  <small
                    className="text-muted d-block mt-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </div>
              </Dropdown.Item>
            );
          })
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
