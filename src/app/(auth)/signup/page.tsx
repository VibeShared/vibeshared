// src/app/(auth)/signup/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can contain only lowercase letters, numbers and underscores"
    ),

  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  otp: z.string().length(6, "OTP must be 6 digits"),
});

type FieldErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  otp?: string;
};

type PasswordStrength = {
  score: number;
  feedback: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

type SignupStep = "form" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check password strength in real-time
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({
        score: 0,
        feedback: "",
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      return;
    }

    const hasMinLength = formData.password.length >= 6;
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);

    // Calculate score (0-4)
    const score = [
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    let feedback = "";
    if (score === 0) feedback = "Very weak";
    else if (score === 1) feedback = "Weak";
    else if (score === 2) feedback = "Fair";
    else if (score === 3) feedback = "Good";
    else feedback = "Strong";

    setPasswordStrength({
      score,
      feedback,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      setFormData((prev) => ({
        ...prev,
        username: value.toLowerCase().replace(/\s/g, ""),
      }));
      return;
    }

    if (name === "otp") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (error) setError("");
  };

  const validateField = (name: string, value: string) => {
    try {
      if (name === "username") {
        signupSchema.pick({ username: true }).parse({ username: value });
      }
      if (name === "name") {
        signupSchema.pick({ name: true }).parse({ name: value });
      } else if (name === "email") {
        signupSchema.pick({ email: true }).parse({ email: value });
      } else if (name === "password") {
        signupSchema.pick({ password: true }).parse({ password: value });
      } else if (name === "otp") {
        signupSchema.pick({ otp: true }).parse({ otp: value });
      }
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFieldErrors((prev) => ({ ...prev, [name]: err.issues[0].message }));
      }
      return false;
    }
  };

 async function checkUsernameAvailability(username: string) {
  if (username.length < 3) return;

  try {
    const res = await fetch("/api/auth/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }), // ✅ ONLY username
    });

    if (!res.ok) {
      const data = await res.json();
      setFieldErrors((prev) => ({
        ...prev,
        username: data.error,
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        username: undefined,
      }));
    }
  } catch {
    // silent fail
  }
}



  async function handleSendOtp() {
    setIsOtpLoading(true);
    setError("");

    const isNameValid = validateField("name", formData.name);
    const isUsernameValid = validateField("username", formData.username);
    const isEmailValid = validateField("email", formData.email);

    if (!isNameValid || !isUsernameValid || !isEmailValid) {
      setIsOtpLoading(false);
      setError("Please fix the errors in the form.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    try {

      const checkRes = await fetch("/api/auth/check-availability", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: formData.username,
    email: formData.email,
  }),
});

if (!checkRes.ok) {
  const data = await checkRes.json();

  const message = data?.error || data?.message || "Already exists";

  setFieldErrors((prev) => ({
    ...prev,
    username: data?.field === "username" ? message : undefined,
    email: data?.field === "email" ? message : undefined,
  }));

  setIsOtpLoading(false);
  return;
}





      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Failed to send OTP.");
      } else {
        setSuccess("OTP sent to your email!");
        setOtpSent(true);
        setCountdown(60);
        setSignupStep("otp");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsOtpLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate all fields
    const isNameValid = validateField("name", formData.name);
    const isEmailValid = validateField("email", formData.email);
    const isPasswordValid = validateField("password", formData.password);
    const isOtpValid = validateField("otp", formData.otp);

    const isUsernameValid = validateField("username", formData.username);

    if (
      !isNameValid ||
      !isUsernameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isOtpValid
    ) {
      setIsLoading(false);
      setError("Please fix the errors in the form.");
      return;
    }

    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      setError("Please fix the errors in the form.");
      setIsLoading(false);
      return;
    }

    try {
      // Verify OTP using your API
      const otpRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const otpResponseData = await otpRes.json();

      if (!otpRes.ok) {
        setError(
          otpResponseData.error || "Invalid or expired OTP. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // OTP verified successfully, now create account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          otp: formData.otp.trim(),
          termsAccepted,
        }),
      });

      const signupResponseData = await signupRes.json();

      if (!signupRes.ok) {
        setError(
          signupResponseData.error || "Something went wrong. Please try again."
        );
      } else {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/login?message=signup_success");
        });
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(
          responseData.error || "Failed to resend OTP. Please try again."
        );
      } else {
        setSuccess("OTP resent to your email!");
        setCountdown(60); // Reset countdown
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="container py-1">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0">
                <i className="bi bi-person-plus-fill me-2"></i>
                Create Your Account
              </h2>
              <p className="mb-0 mt-2">Join Vibeshared Today And Send You Vibes...</p>
            </div>

            <div className="card-body p-5">
              {error && (
                <div
                  className="alert alert-danger d-flex align-items-center"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div
                  className="alert alert-success d-flex align-items-center"
                  role="alert"
                >
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{success}</div>
                </div>
              )}

              {signupStep === "form" ? (
                <div>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person-fill me-2"></i>Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`form-control form-control-lg ${
                        fieldErrors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={(e) => validateField("name", e.target.value)}
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="username" className="form-label">
                      <i className="bi bi-at me-2"></i>Username
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      className={`form-control form-control-lg ${
                        fieldErrors.username ? "is-invalid" : ""
                      }`}
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={(e) => {
  validateField("username", e.target.value);
  checkUsernameAvailability(e.target.value);
}}
                    />

                    <small className="text-muted">
                      Only lowercase letters, numbers and underscores
                    </small>

                    {fieldErrors.username && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {fieldErrors.username}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope-fill me-2"></i>Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-control form-control-lg ${
                        fieldErrors.email ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={(e) => validateField("email", e.target.value)}
                    />
                    {fieldErrors.email && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock-fill me-2"></i>Password
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${
                          fieldErrors.password ? "is-invalid" : ""
                        }`}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={(e) =>
                          validateField("password", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {formData.password && (
                      <div className="mt-3">
                        <div
                          className="progress mb-2"
                          style={{ height: "8px" }}
                        >
                          <div
                            className={`progress-bar ${
                              passwordStrength.score < 2
                                ? "bg-danger"
                                : passwordStrength.score < 4
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                            role="progressbar"
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                            aria-valuenow={passwordStrength.score}
                            aria-valuemin={0}
                            aria-valuemax={5}
                          ></div>
                        </div>
                        <small
                          className={`fw-bold ${
                            passwordStrength.score < 2
                              ? "text-danger"
                              : passwordStrength.score < 4
                              ? "text-warning"
                              : "text-success"
                          }`}
                        >
                          Password Strength: {passwordStrength.feedback}
                        </small>

                        <div className="mt-2">
                          <small className="d-block">
                            <i
                              className={`bi ${
                                passwordStrength.hasMinLength
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-x-circle-fill text-secondary"
                              } me-1`}
                            ></i>
                            At least 6 characters
                          </small>
                          <small className="d-block">
                            <i
                              className={`bi ${
                                passwordStrength.hasUppercase
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-x-circle-fill text-secondary"
                              } me-1`}
                            ></i>
                            One uppercase letter
                          </small>
                          <small className="d-block">
                            <i
                              className={`bi ${
                                passwordStrength.hasLowercase
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-x-circle-fill text-secondary"
                              } me-1`}
                            ></i>
                            One lowercase letter
                          </small>
                          <small className="d-block">
                            <i
                              className={`bi ${
                                passwordStrength.hasNumber
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-x-circle-fill text-secondary"
                              } me-1`}
                            ></i>
                            One number
                          </small>
                          <small className="d-block">
                            <i
                              className={`bi ${
                                passwordStrength.hasSpecialChar
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-x-circle-fill text-secondary"
                              } me-1`}
                            ></i>
                            One special character
                          </small>
                        </div>
                      </div>
                    )}

                    {fieldErrors.password && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {fieldErrors.password}
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleSendOtp}
                      disabled={isOtpLoading || !termsAccepted}
                    >
                      {isOtpLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check me-2"></i>
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="text-center mb-4">
                    <p>
                      We've sent a 6-digit OTP to{" "}
                      <strong>{formData.email}</strong>
                    </p>
                    <p>Please check your inbox and enter the code below.</p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="otp" className="form-label">
                      <i className="bi bi-shield-check me-2"></i>OTP
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      className={`form-control form-control-lg ${
                        fieldErrors.otp ? "is-invalid" : ""
                      }`}
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      onBlur={(e) => validateField("otp", e.target.value)}
                      maxLength={6}
                    />
                    {fieldErrors.otp && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {fieldErrors.otp}
                      </div>
                    )}

                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={handleResendOtp}
                        disabled={countdown > 0}
                      >
                        {countdown > 0
                          ? `Resend OTP in ${countdown}s`
                          : "Resend OTP"}
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
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Verify & Create Account
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSignupStep("form")}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Edit Details
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{" "}
                  <a href="/login" className="text-decoration-none">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>

            <div className="card-footer bg-info text-center  py-3">
              <div className="form-check d-flex justify-content-center align-items-center gap-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="form-check-label text-muted">
                  I agree to the{" "}
                  <Link href="/termsAndconditions">Terms & Conditions</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
