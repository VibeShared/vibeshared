// src/componenets/hooks/useNotifications.ts
import { useEffect } from "react";
import Pusher from "pusher-js"; // if using Pusher

export function useNotifications(userId: string, callback: (notification: any) => void) {
  useEffect(() => {
    if (!userId) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.error("Pusher key or cluster is not defined in environment variables!");
      return;
    }

    const pusher = new Pusher(key, { cluster });

    const channel = pusher.subscribe(`notifications-${userId}`);
    channel.bind("new-notification", (data: any) => {
      callback(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, callback]);
}
