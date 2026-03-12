import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { Checkbox } from "@app/components/ui/checkbox";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { useEffect } from "react";
import { setCurrentUser } from "@app/store/reducers/auth";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import {
  profileSettingsSchema,
  profileSettingsInitialValues,
  IProfileSettingsFormValues,
} from "./profile.schema";
import { Save, User as UserIcon, Shield } from "lucide-react";

const SettingsTab = ({ isActive }: { isActive: boolean }) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();

  const formik = useFormik<IProfileSettingsFormValues>({
    initialValues: profileSettingsInitialValues,
    validationSchema: profileSettingsSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const response = await axios.put("/auth/profile", {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
        });

        if (response.data.success) {
          const updatedUser = response.data.data;
          // Update Redux state only — localStorage no longer holds user data.
          dispatch(setCurrentUser(updatedUser));
          toast.success("Profile changes saved successfully");
        }
      } catch (error: unknown) {
        handleError(error, "Failed to update profile");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (currentUser) {
      formik.setValues({
        ...formik.values,
        name: currentUser.name || "",
        email: currentUser.email || "",
        mobile: currentUser.mobile || "",
      });
    }
  }, [currentUser]);

  if (!isActive) return null;

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <UserIcon className="w-4 h-4 text-[#368F8B]" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Account Information
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`h-11 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`}
                placeholder="Name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`h-11 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="mobile"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
              >
                Mobile Number
              </Label>
              <Input
                id="mobile"
                name="mobile"
                type="text"
                maxLength={10}
                inputMode="numeric"
                value={formik.values.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    formik.setFieldValue("mobile", value);
                  }
                }}
                onBlur={formik.handleBlur}
                className={`h-11 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-[#368F8B] dark:focus:border-[#368F8B] focus:ring-[#368F8B]/20 transition-all ${formik.touched.mobile && formik.errors.mobile ? "border-red-500" : ""}`}
                placeholder="10-digit mobile"
              />
              {formik.touched.mobile && formik.errors.mobile && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.mobile}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Field Group: Consents & Actions */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-gray-100 dark:border-gray-800">
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() =>
              formik.setFieldValue("agreeTerms", !formik.values.agreeTerms)
            }
          >
            <Checkbox
              id="agreeTerms"
              checked={formik.values.agreeTerms}
              onCheckedChange={(checked) =>
                formik.setFieldValue("agreeTerms", checked)
              }
              className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 data-[state=checked]:bg-[#368F8B] data-[state=checked]:border-[#368F8B] transition-all"
            />
            <Label
              htmlFor="agreeTerms"
              className="text-sm text-gray-500 dark:text-gray-400 font-medium cursor-pointer"
            >
              I certify that these details are correct
            </Label>
          </div>

          <Button
            type="submit"
            className="bg-[#368F8B] hover:bg-[#2d7a76] text-white font-extrabold h-12 px-10 rounded-xl shadow-lg shadow-[#368F8B]/25 transition-all active:scale-95 disabled:opacity-70"
            disabled={formik.isSubmitting}
          >
            <Save className="w-5 h-5 mr-3" />
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;
