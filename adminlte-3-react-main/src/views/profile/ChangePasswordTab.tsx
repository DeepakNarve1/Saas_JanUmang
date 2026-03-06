import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { toast } from "react-toastify";
import {
  changePasswordSchema,
  changePasswordInitialValues,
} from "./profile.schema";
import { Lock, KeyRound, Save, ShieldCheck } from "lucide-react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";

const ChangePasswordTab = ({ isActive }: { isActive: boolean }) => {
  const formik = useFormik({
    initialValues: changePasswordInitialValues,
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const response = await axios.post("/auth/change-password", {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (response.data.success) {
          toast.success("Password updated successfully");
          resetForm();
        }
      } catch (error: unknown) {
        handleError(error, "Failed to update password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isActive) return null;

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <ShieldCheck className="w-4 h-4 text-[#368F8B]" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Security Credentials
          </h4>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="currentPassword"
              title="Current Password"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
            >
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`h-11 pl-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.currentPassword && formik.errors.currentPassword ? "border-red-500" : ""}`}
                placeholder="••••••••"
              />
            </div>
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.currentPassword}
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                title="New Password"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`h-11 pl-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.newPassword}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                title="Confirm Password"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`h-11 pl-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold uppercase">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-right">
          <Button
            type="submit"
            className="bg-[#368F8B] hover:bg-[#2d7a76] text-white font-extrabold h-12 px-10 rounded-xl shadow-lg shadow-[#368F8B]/25 transition-all active:scale-95 disabled:opacity-70"
            disabled={formik.isSubmitting}
          >
            <Save className="w-5 h-5 mr-3" />
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordTab;
