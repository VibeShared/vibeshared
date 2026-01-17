// lib/pusherClient.ts
import Pusher from "pusher-js";

export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_KEY!, // use NEXT_PUBLIC_ vars so it's safe for client
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
