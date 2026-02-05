"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Loader2,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  UserCog,
  Lock,
  Key,
  MapPin,
} from "lucide-react";
import {
  userInitialValues,
  IUserFormValues,
  getCachedUserSchema,
  sanitizeUserFormValues,
} from "./user.schema";
import { USER_TYPE_OPTIONS, ADMIN_LEVEL_OPTIONS } from "./user.constants";
import { IRoleOption } from "@app/types/user";
import { HierarchySelector } from "@app/components";

interface UserFormProps {
  initialValues?: IUserFormValues;
  onSubmit: (values: IUserFormValues) => void;
  loading?: boolean;
  isEdit?: boolean;
}

const UserForm = ({
  initialValues = userInitialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}: UserFormProps) => {
  const router = useRouter();
  const [roles, setRoles] = useState<IRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError(null);
        const res = await axios.get("/rbac/roles", { params: { limit: -1 } });

        if (res.data?.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
        } else {
          throw new Error("Invalid response format from roles API");
        }
      } catch (error: unknown) {
        const errorMessage = "Failed to load roles. Please refresh the page.";
        console.error("Roles fetch error:", error);
        setRolesError(errorMessage);
        toast.error(errorMessage);
        setRoles([]); // Set empty array on error
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const formik = useFormik<IUserFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: getCachedUserSchema(isEdit),
    onSubmit: (values) => {
      // Sanitize values before submission
      const sanitizedValues = sanitizeUserFormValues(values);
      onSubmit(sanitizedValues);
    },
  });

  return (
    <div className="p-8 bg-white dark:bg-card">
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Row 1: Basic Identity */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <UserIcon size={14} className="text-[#368F8B]" />
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter full name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <Mail size={14} className="text-[#368F8B]" />
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Row 2: Contact & Access */}
          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <Phone size={14} className="text-[#368F8B]" />
              Mobile Number
            </Label>
            <Input
              id="mobile"
              name="mobile"
              type="text"
              placeholder="Enter 10-digit mobile"
              value={formik.values.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  formik.setFieldValue("mobile", value);
                }
              }}
              onBlur={formik.handleBlur}
              maxLength={10}
              inputMode="numeric"
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                formik.touched.mobile && formik.errors.mobile
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.mobile && formik.errors.mobile ? (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.mobile}
              </p>
            ) : formik.values.mobile ? (
              <p className="text-[10px] text-gray-400 font-medium">
                Valid Indian mobile format
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <Shield size={14} className="text-[#368F8B]" />
              System Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formik.values.role}
              onValueChange={(value) => formik.setFieldValue("role", value)}
              disabled={rolesLoading}
            >
              <SelectTrigger
                className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                  formik.touched.role && formik.errors.role
                    ? "border-red-500"
                    : ""
                }`}
              >
                <SelectValue
                  placeholder={
                    rolesLoading ? "Loading roles..." : "Select a role"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.displayName || r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.role}
              </p>
            )}
          </div>

          {/* Row 3: Account Classification */}
          <div className="space-y-2">
            <Label
              htmlFor="userType"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <UserCog size={14} className="text-[#368F8B]" />
              User Category
            </Label>
            <Select
              value={formik.values.userType}
              onValueChange={(value) => formik.setFieldValue("userType", value)}
            >
              <SelectTrigger
                id="userType"
                className="h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B]"
              >
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="level"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
            >
              <Shield size={14} className="text-[#368F8B]" />
              Administrative Level <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formik.values.level}
              onValueChange={(value) => {
                formik.setFieldValue("level", value);
                // Reset hierarchy if switched back to superadmin
                if (value === "superadmin") {
                  formik.setFieldValue("state", "");
                  formik.setFieldValue("division", "");
                  formik.setFieldValue("district", "");
                  formik.setFieldValue("assembly", "");
                  formik.setFieldValue("block", "");
                  formik.setFieldValue("panchayat", "");
                  formik.setFieldValue("village", "");
                  formik.setFieldValue("booth", "");
                }
              }}
            >
              <SelectTrigger
                id="level"
                className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] ${formik.touched.level && formik.errors.level ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.level && formik.errors.level && (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.level}
              </p>
            )}
          </div>

          {/* Hierarchical Scope Selection */}
          {formik.values.level !== "superadmin" && (
            <div className="md:col-span-2 p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-[#368F8B]" />
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                  Jurisdiction Assignment
                </h4>
              </div>
              <HierarchySelector
                formik={formik}
                targetLevel={formik.values.level as any}
              />
              <p className="text-[10px] text-gray-500 italic">
                * User will be restricted to data within the selected{" "}
                {formik.values.level}.
              </p>
            </div>
          )}

          {/* Row 4: Security Section Divider */}
          <div className="md:col-span-2 pt-4 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-[#368F8B]" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                Security Credentials
              </h4>
            </div>
          </div>

          {/* Row 5: Password Fields */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              title="Password"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
            >
              Password {!isEdit && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={isEdit ? "••••••••" : "Create password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`h-11 pr-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-[#368F8B] transition-colors focus:outline-hidden"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-[10px] text-red-500 font-bold uppercase">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              title="Confirm Password"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
            >
              Confirm Password{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`h-11 pr-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B] dark:focus:border-[#368F8B] transition-colors ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-[#368F8B] transition-colors focus:outline-hidden"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Row 6: Password Hints (Full Width for Symmetry) */}
          {!isEdit && formik.values.password && (
            <div className="md:col-span-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <Key className="w-4 h-4 text-[#368F8B] mt-1" />
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#368F8B] dark:text-emerald-400 uppercase tracking-wider">
                    Security Requirements
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                    {[
                      {
                        test: formik.values.password.length >= 8,
                        label: "At least 8 chars",
                      },
                      {
                        test: /[a-z]/.test(formik.values.password),
                        label: "Lowercase letter",
                      },
                      {
                        test: /[A-Z]/.test(formik.values.password),
                        label: "Uppercase letter",
                      },
                      {
                        test: /[0-9]/.test(formik.values.password),
                        label: "One number",
                      },
                      {
                        test: /[!@#$%^&*(),.?":{}|<>]/.test(
                          formik.values.password,
                        ),
                        label: "Special symbol",
                      },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${req.test ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        />
                        <span
                          className={`text-[11px] font-medium ${req.test ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#368F8B] hover:bg-[#2d7a76] dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] text-white min-w-[120px] rounded-lg shadow-lg dark:shadow-[#368F8B]/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium border border-gray-200"
            onClick={() => formik.resetForm()}
            disabled={loading}
          >
            Reset Form
          </Button>
          <Button
            type="button"
            className="dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-600 hover:bg-gray-50 bg-transparent"
            onClick={() => router.push("/users")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
