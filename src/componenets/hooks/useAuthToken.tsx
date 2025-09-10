"use client";

import { useAuth } from "@/componenets/hooks/AuthContext";
import { useEffect } from "react";

export function useAuthToken() {
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    // Decode expiry from JWT
    const { exp } = JSON.parse(atob(accessToken.split(".")[1]));
    const expiresIn = exp * 1000 - Date.now();

    // Refresh 1 min before expiry
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }),
        });

        const data = await res.json();

        if (res.ok && data.accessToken) {
          setAccessToken(data.accessToken);
        } else {
          console.error("Failed to refresh token");
        }
      } catch (error) {
        console.error("Refresh error:", error);
      }
    }, expiresIn - 60 * 1000);

    return () => clearTimeout(timeout);
  }, [accessToken, setAccessToken]);

  return accessToken;
}
