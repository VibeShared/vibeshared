"use client";
import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Import dynamically *only on client*, never during SSR
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js" as any)
        .then(() => {
         
        })
        .catch((err) => console.error("Bootstrap import failed", err));
    }
  }, []);

  return null;
}
