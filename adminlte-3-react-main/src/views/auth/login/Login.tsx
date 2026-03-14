"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { setWindowClass } from "@app/utils/helpers";

import { Card } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";

import { Mail, Lock, Loader2, Users } from "lucide-react";
import { handleError } from "@app/utils/errorHandler";

// Redux imports
import { useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@store/reducers/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setWindowClass("hold-transition login-page bg-[#121212]");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = { email: "", password: "" };
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 5)
      newErrors.password = "Password must be at least 5 characters";

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const [mfaStep, setMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaStep && !validate()) return;
    if (mfaStep && mfaCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      if (mfaStep) {
        const res = await axios.post("/auth/mfa/verify-login", {
          tempToken,
          code: mfaCode,
        });
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        dispatch(setCurrentUser(user));
        toast.success("Login successful!");
        setTimeout(() => router.push("/"), 100);
      } else {
        const res = await axios.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        if (res.data.mfaRequired) {
          setTempToken(res.data.tempToken);
          setMfaStep(true);
          toast.info("Two-Factor Authentication required");
          return;
        }

        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        dispatch(setCurrentUser(user));
        toast.success("Login successful!");
        setTimeout(() => router.push("/"), 100);
      }
    } catch (error: any) {
      handleError(error, mfaStep ? "Invalid MFA code" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center px-4 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden dark:bg-[#1a1c1e] dark:border dark:border-gray-800">
        <div className="text-center py-10 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[#368F8B] to-[#2d7a76] shadow-xl">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 uppercase">
            JAN <span className="text-[#368F8B]">UMANG</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Welcome back! Please sign in.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!mfaStep ? (
              <>
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#368F8B] transition-colors z-10 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#368F8B] transition-colors z-10 pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="mfaCode"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Authenticator Code
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#368F8B] transition-colors z-10 pointer-events-none" />
                    <Input
                      id="mfaCode"
                      name="mfaCode"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] tracking-widest text-center text-lg`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#368F8B] hover:bg-[#2d7a76] text-white h-12 text-base font-bold shadow-lg shadow-[#368F8B]/20 transition-all rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mfaStep ? "Verifying..." : "Signing in..."}
                </>
              ) : (
                mfaStep ? "Verify Code" : "Sign In"
              )}
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#368F8B] focus:ring-[#368F8B] border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-semibold text-[#368F8B] hover:text-[#2d7a76] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white dark:bg-[#1a1c1e] px-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider
                  clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                >
                  <GoogleLogin
                    onSuccess={async (credentialResponse: any) => {
                      try {
                        setLoading(true);
                        const { credential } = credentialResponse;
                        const res = await axios.post("/auth/google-login", {
                          token: credential,
                        });

                        const { token, user } = res.data.data;
                        // Store ONLY the token in localStorage — user data stays in Redux memory.
                        localStorage.setItem("token", token);
                        dispatch(setCurrentUser(user));
                        toast.success("Login successful!");
                        router.push("/");
                      } catch (error: any) {
                        handleError(error, "Google Login failed");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => {
                      toast.error("Google Login Failed");
                    }}
                  />
                </GoogleOAuthProvider>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Google Login unavailable (No Client ID)
                </div>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
