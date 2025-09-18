"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import User from "@/lib/models/User";

const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});



export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check for messages from redirects
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // ✅ Show values in console
  console.log("Login attempt with:");
  console.log("Email:", email);
  console.log("Password:", password);



    const result = await signIn("credentials", {
      redirect: false, // prevent automatic redirect
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    // ✅ Successful login → redirect home
    router.push("/?success=login");
    router.refresh(); // update auth state
  }

  async function handleOAuthSignIn(provider: string) {
    try {
      setError("");
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl: "/",
      });
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  }

  // Alternative: Direct API login (if you prefer not using NextAuth credentials)
  async function handleDirectApiLogin(data: { email: string; password: string }) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (res.ok) {
        // Login successful
        router.push("/");
        router.refresh();
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h1 className="h3 fw-bold text-primary">Login</h1>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {message === "signup_success" && (
                <div className="alert alert-success" role="alert">
                  ✅ Account created successfully! Please sign in.
                </div>
              )}

              {errorParam === "OAuthAccountNotLinked" && (
                <div className="alert alert-warning" role="alert">
                  This email is already associated with another account. Please use your original login method.
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="d-grid gap-2 mb-4">
                <button
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading}
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-google me-2"></i>
                  Sign in with Google
                </button>

                <button
                  onClick={() => handleOAuthSignIn("facebook")}
                  disabled={isLoading}
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-facebook me-2"></i>
                  Sign in with Facebook
                </button>

                <button
                  onClick={() => handleOAuthSignIn("twitter")}
                  disabled={isLoading}
                  className="btn btn-outline-info d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-twitter me-2"></i>
                  Sign in with Twitter
                </button>
              </div>

              <div className="text-center mb-3">
                <span className="text-muted">Or sign in with email</span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    defaultValue={searchParams.get("email") || ""}
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">{formErrors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {formErrors.password && (
                      <div className="invalid-feedback">{formErrors.password}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3 text-end">
                  <Link href="/forgot-password" className="text-decoration-none text-primary">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-100 py-2 fw-semibold"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-decoration-none fw-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}