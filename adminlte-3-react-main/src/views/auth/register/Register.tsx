"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { setWindowClass } from "@app/utils/helpers";
import { Checkbox } from "@app/components/ui/checkbox";

import { setCurrentUser } from "@app/store/reducers/auth";
// backend handles registration via axios; firebase helpers removed
import { useAppDispatch } from "@app/store/store";
import axios from "axios";
import { API_BASE_URL } from "@app/utils/api";
import { handleError } from "@app/utils/errorHandler";
import { Card } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { Mail, Lock, Loader2, UserPlus, Users } from "lucide-react";

const Register = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
  const [t] = useTranslation();
  const dispatch = useAppDispatch();

  const router = useRouter();

  const register = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const result = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      // server responds with { success: true, data: { ... } }
      const data = result.data?.data || result.data;

      // SAVE USER & TOKEN
      if (data) {
        // Store ONLY the opaque access token — user data stays in Redux memory.
        localStorage.setItem("token", data.token);
        dispatch(setCurrentUser(data));
      }

      toast.success("Registration success");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration Error:", error);
      handleError(error, "Failed to register");
      setAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, submitForm } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
        passwordRetype: "",
      },
      validationSchema: Yup.object({
        email: Yup.string().email("Invalid email address").required("Required"),
        password: Yup.string()
          .min(5, "Must be 5 characters or more")
          .max(30, "Must be 30 characters or less")
          .required("Required"),
        passwordRetype: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords do not match")
          .required("Required"),
      }),
      onSubmit: (values) => {
        register(values.email, values.password);
      },
    });

  useEffect(() => {
    setWindowClass("hold-transition register-page");
  }, []);

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
            Create your account to get started
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={handleChange}
                  value={values.email}
                  className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] ${
                    touched.email && errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.email}
                </p>
              )}
            </div>

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
                  placeholder="Create a password"
                  onChange={handleChange}
                  value={values.password}
                  className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] ${
                    touched.password && errors.password ? "border-red-500" : ""
                  }`}
                />
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="passwordRetype"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#368F8B] transition-colors z-10 pointer-events-none" />
                <Input
                  id="passwordRetype"
                  name="passwordRetype"
                  type="password"
                  placeholder="Repeat your password"
                  onChange={handleChange}
                  value={values.passwordRetype}
                  className={`pl-11! h-12 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 focus-visible:ring-[#368F8B] ${
                    touched.passwordRetype && errors.passwordRetype
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>
              {touched.passwordRetype && errors.passwordRetype && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.passwordRetype}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox id="terms" checked={false} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-400"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#368F8B] font-bold hover:underline"
                >
                  Terms of Service
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-[#368F8B] hover:bg-[#2d7a76] text-white h-12 text-base font-bold shadow-lg shadow-[#368F8B]/20 transition-all rounded-lg"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Sign Up
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#368F8B] font-bold hover:underline transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;
