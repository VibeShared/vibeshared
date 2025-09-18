"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function GlobalMessages() {
  const params = useSearchParams();

  useEffect(() => {
    const message = params.get("message");
    if (!message) return;

    switch (message) {
      case "login-required":
        toast.error("Please Login to access that page.");
        break;
      case "already-logged-in":
        toast("You are already Logged in.");
        break;
      case "login":
        toast.success("Welcome back!");
        break;
    }
  }, [params]);

  return null;
}
