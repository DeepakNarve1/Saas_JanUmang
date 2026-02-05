"use client";
import { useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [t] = useTranslation();

  const { handleChange, values, handleSubmit, touched, errors, handleBlur } =
    useFormik({
      initialValues: {
        email: "",
      },
      validationSchema: Yup.object({
        email: Yup.string().email("Invalid email address").required("Required"),
      }),
      onSubmit: (values) => {
        toast.warn("Not yet functional");
      },
    });

  useEffect(() => {
    setWindowClass("hold-transition login-page bg-[#121212]");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#368F8B]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#368F8B]/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-[#1a1c1e] border-gray-800 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#368F8B] to-transparent" />

        <CardHeader className="space-y-3 pt-8 px-8">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-[#368F8B]/10 rounded-2xl flex items-center justify-center border border-[#368F8B]/20 shadow-inner">
              <Mail className="w-8 h-8 text-[#368F8B]" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">
            Forgot Password
          </CardTitle>
          <p className="text-center text-gray-400 text-sm px-2">
            {t("recover.forgotYourPassword")}
          </p>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-[#368F8B]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className={`pl-10 h-12 bg-[#202123]/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-[#368F8B] focus:border-[#368F8B] transition-all duration-200 ${
                    touched.email && errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-red-400 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 font-medium italic">
                  {errors.email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#368F8B] hover:bg-[#2d7a76] text-white font-semibold rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all duration-300 transform active:scale-[0.98] border-0"
            >
              {t("recover.requestNewPassword")}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-4">
            <Link
              href="/login"
              className="flex items-center text-sm text-[#368F8B] hover:text-[#45a8a4] transition-colors font-medium group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {t("login.button.signIn.label")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
