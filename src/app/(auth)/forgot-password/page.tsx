"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers for OTP field
    if (name === "otp" && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (error) setError("");
  };

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsOtpLoading(true);
    setError("");

    if (!formData.email) {
      setError("Please enter your email address.");
      setIsOtpLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Failed to send OTP. Please try again.");
      } else {
        setSuccess("OTP sent to your email!");
        setCountdown(60); // 60 seconds countdown
        setStep("otp");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsOtpLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Invalid or expired OTP. Please try again.");
      } else {
        setSuccess("OTP verified successfully!");
        setStep("reset");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsResetting(true);
    setError("");

    if (!formData.newPassword) {
      setError("Please enter a new password.");
      setIsResetting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsResetting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Failed to reset password. Please try again.");
      } else {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsResetting(false);
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Failed to resend OTP. Please try again.");
      } else {
        setSuccess("OTP resent to your email!");
        setCountdown(60); // Reset countdown
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Reset Password
              </h2>
              <p className="mb-0 mt-2">Recover your account access</p>
            </div>
            
            <div className="card-body p-5">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{success}</div>
                </div>
              )}
              
              {step === "email" && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope-fill me-2"></i>Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="form-text">
                      Enter the email address associated with your account.
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isOtpLoading}
                    >
                      {isOtpLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="text-center mb-4">
                    <p>We've sent a 6-digit OTP to <strong>{formData.email}</strong></p>
                    <p>Please check your inbox and enter the code below.</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="otp" className="form-label">
                      <i className="bi bi-shield-check me-2"></i>OTP Verification Code
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength={6}
                      required
                    />
                    
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={handleResendOtp}
                        disabled={countdown > 0}
                      >
                        {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Verify OTP
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setStep("email")}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Change Email
                    </button>
                  </div>
                </form>
              )}
              
              {step === "reset" && (
                <form onSubmit={handleResetPassword}>
                  <div className="text-center mb-4">
                    <p>Now set your new password for <strong>{formData.email}</strong></p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label">
                      <i className="bi bi-lock-fill me-2"></i>New Password
                    </label>
                    <div className="input-group">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="bi bi-lock-fill me-2"></i>Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-key-fill me-2"></i>
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              <div className="text-center mt-4">
                <p className="mb-0">
                  Remember your password?{" "}
                  <Link href="/login" className="text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="card-footer text-center py-3">
              <small className="text-muted">
                Enter your email address and we'll send you an OTP to reset your password.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}