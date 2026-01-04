"use client";

import Link from "next/link";
import { Frown } from "lucide-react"; // nice icon
import "bootstrap/dist/css/bootstrap.min.css";

export default function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light">
      <div className="p-4 rounded shadow bg-white">
        <Frown size={64} className="text-primary mb-3" />
        <h1 className="fw-bold display-4">404</h1>
        <h2 className="fw-semibold mb-3">Oops! Page not found</h2>
        <p className="text-muted mb-4">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary btn-lg shadow">
          Go Home
        </Link>
      </div>
    </div>
  );
}
