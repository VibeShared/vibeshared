// src/app/(auth)/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Username or email is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFormErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    // ✅ Zod validation
    const parsed = loginSchema.safeParse({ identifier, password });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setFormErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // ✅ Credentials sign in
    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      setError("Invalid username/email or password");
      setIsLoading(false);
      return;
    }

    router.push("/?success=login");
  }

  async function handleOAuthSignIn(provider: string) {
    try {
      setError("");
      setIsLoading(true);
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(false);
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
                <div className="alert alert-success">
                  ✅ Account created successfully. Please sign in.
                </div>
              )}

              {errorParam === "OAuthAccountNotLinked" && (
                <div className="alert alert-warning">
                  This email is already linked with another provider.
                </div>
              )}

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {/* OAuth */}
              <div className="d-grid gap-2 mb-4">
                <button onClick={() => handleOAuthSignIn("google")} className="btn btn-outline-danger">
                  Sign in with Google
                </button>
                <button onClick={() => handleOAuthSignIn("twitter")} className="btn btn-outline-info">
                  Sign in with Twitter
                </button>
              </div>

              <div className="text-center mb-3 text-muted">
                Or sign in with username or email
              </div>

              <form onSubmit={handleSubmit}>

                {/* Identifier */}
                <div className="mb-3">
                  <label className="form-label">Username or Email</label>
                  <input
                    name="identifier"
                    className={`form-control ${formErrors.identifier ? "is-invalid" : ""}`}
                    placeholder="username or email"
                    disabled={isLoading}
                  />
                  {formErrors.identifier && (
                    <div className="invalid-feedback">{formErrors.identifier}</div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {formErrors.password && (
                      <div className="invalid-feedback">{formErrors.password}</div>
                    )}
                  </div>
                </div>

                <div className="text-end mb-3">
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>

                <button className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </button>
              </form>

              <div className="text-center mt-4">
                Don’t have an account? <Link href="/signup">Sign up</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
