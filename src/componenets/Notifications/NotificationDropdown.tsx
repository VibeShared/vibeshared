"use client";

import { useState, useEffect, useRef } from "react";
import { Dropdown, Badge, Spinner, Image, Button } from "react-bootstrap";
import { useNotifications } from "@/componenets/hooks/useNotifications";

interface NotificationDropdownProps {
  userId?: string | null;
}

export default function NotificationDropdown({
  userId,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ----------------------------
  // Fetch notifications from API
  // ----------------------------
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&limit=20`);
      const data = await res.json();

      const notificationsArray: any[] = Array.isArray(data)
        ? data
        : data.notifications || [];

      notificationsArray.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Mark single notification as read
  // ----------------------------
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
      console.error("Failed to mark notification as read:", err);
    }
  };

  // ----------------------------
  // Real-time notifications
  // ----------------------------
  useNotifications(userId || "", (newNotification) => {
    if (!newNotification) return;
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  // ----------------------------
  // IntersectionObserver for marking visible notifications
  // ----------------------------
  useEffect(() => {
    if (!notifications.length) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) markSingleAsRead(id);
          }
        });
      },
      { threshold: 1.0 }
    );

    document
      .querySelectorAll(".notification-item")
      .forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [notifications]);

  // ----------------------------
  // Fetch notifications on page load or dropdown open
  // ----------------------------
  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const getNotificationText = (n: any) => {
  const senders = n.senders || (n.sender ? [n.sender] : []);
  const names = senders.map((s: any) => s.name);
  let mainText = "";

  if (names.length === 1) mainText = names[0];
  else if (names.length === 2) mainText = `${names[0]} and ${names[1]}`;
  else mainText = `${names[0]}, ${names[1]} and ${names.length - 2} others`;

  switch (n.type) {
    case "like":
      return `${mainText} liked your post ❤️`;
    case "comment":
      return `${mainText} commented: "${n.commentText?.slice(0, 50)}..."`;
    case "follow":
      return `${mainText} started following you ➕`;
    default:
      return "";
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
        style={{ width: "350px", maxHeight: "400px", overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notifications</strong>
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
          notifications.map((n) => (
            <Dropdown.Item
              key={n._id}
              data-id={n._id}
              className={`notification-item d-flex align-items-center gap-2 ${
                n.read ? "bg-light" : "bg-white fw-bold"
              }`}
              onClick={() => {
                if ((n.type === "like" || n.type === "comment") && n.postId) {
                  window.location.href = `/post/${n.postId}`;
                } else if (n.type === "follow" && n.senders?.[0]?._id) {
                  window.location.href = `/profile/${n.senders[0]._id}`;
                } else if (n.type === "comment" && n.postId && n.commentId) {
                  window.location.href = `/post/${n.postId}?comment=${n.commentId}`;
                }
              }}
            >
              <div className="d-flex" style={{ minWidth: "90px" }}>
                {n.senders?.slice(0, 3).map((s: any, idx: number) => (
                  <Image
                    key={s._id}
                    src={s.image || "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"}
                    roundedCircle
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "cover",
                      border: "2px solid white",
                      marginLeft: idx > 0 ? "-10px" : "0px",
                    }}
                  />
                ))}
              </div>

              <div className="text-truncate" style={{ maxWidth: "200px" }}>
                <div>{getNotificationText(n)}</div>
                <small className="text-muted">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </small>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
