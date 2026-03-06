"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
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
  UserCog,
  Shield,
  Lock,
  Key,
  Building2,
} from "lucide-react";
import {
  userInitialValues,
  IUserFormValues,
  getCachedUserSchema,
  sanitizeUserFormValues,
} from "./user.schema";
import { USER_TYPE_OPTIONS } from "./user.constants";
import { IRoleOption } from "@app/types/user";
import { useAppSelector, RootState } from "@app/store/store";

import { ITenant } from "@app/types/tenant";

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
  const currentUser = useAppSelector(
    (state: RootState) => state.auth.currentUser,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tenants, setTenants] = useState<ITenant[]>([]);

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

  // Fetch tenants if true platform global admin (no tenantId + system-level)
  const isCurrentUserGlobalAdmin =
    !currentUser?.tenantId &&
    (currentUser?.level === "system_admin" ||
      currentUser?.level === "superadmin");

  useEffect(() => {
    if (isCurrentUserGlobalAdmin) {
      const fetchTenants = async () => {
        try {
          const res = await axios.get("/tenants?limit=-1");
          if (res.data?.data) {
            setTenants(res.data.data);
          }
        } catch (error: unknown) {
          handleError(error, "Failed to fetch tenants");
        }
      };
      fetchTenants();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError(null);

        // Pass the selected tenantId to get specific roles if applicable
        const headers: any = {};
        if (formik.values.tenantId) {
          headers["x-tenant-id"] = formik.values.tenantId;
        }

        const res = await axios.get("/rbac/roles", {
          params: { limit: -1 },
          headers,
        });

        if (res.data?.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
        } else {
          throw new Error("Invalid response format from roles API");
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load roles");
        setRoles([]); // Set empty array on error
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, [formik.values.tenantId, currentUser]);

  const filteredRoles = useMemo(() => {
    if (!roles || roles.length === 0) return [];

    // For non-global admins, roles are already filtered by the API
    if (!isCurrentUserGlobalAdmin) {
      return roles;
    }

    // For global admins:
    // We only want to show exactly two "levels": System Admin and Organization Admin
    const selectedTenantId = formik.values.tenantId;
    const roleMap = new Map();

    roles.forEach((r: any) => {
      const name = (r.name || "").toLowerCase();
      const level = (r.level || "").toLowerCase();
      const isSysAdmin =
        name === "system_admin" ||
        name === "superadmin" ||
        level === "system_admin";
      const isOrgAdmin =
        name === "tenant_admin" ||
        name === "organization admin" ||
        level === "tenant_admin";

      if (isSysAdmin || isOrgAdmin) {
        const key = isSysAdmin ? "System Administrator" : "Organization Admin";
        const belongsToSelected =
          selectedTenantId && r.tenantId === selectedTenantId;

        // Logic:
        // 1. If we haven't added this role type yet, add it.
        // 2. If we found a version of this role that belongs to the selected organization,
        //    prefer its ID over any others to ensure correct permissions.
        if (!roleMap.has(key) || belongsToSelected) {
          roleMap.set(key, {
            ...r,
            displayName: key, // Force consistent display name
          });
        }
      }
    });

    return Array.from(roleMap.values());
  }, [roles, formik.values.tenantId, currentUser]);

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
              onValueChange={(value: string) => {
                formik.setFieldValue("role", value);
                const selectedRole = filteredRoles.find((r) => r._id === value);
                if (selectedRole) {
                  const roleName = (selectedRole.name || "").toLowerCase();
                  if (
                    roleName === "system_admin" ||
                    roleName === "superadmin"
                  ) {
                    formik.setFieldValue("level", "system_admin");
                  } else if (roleName === "tenant_admin") {
                    formik.setFieldValue("level", "tenant_admin");
                  }
                }
              }}
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
                {filteredRoles.map((r) => (
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
              onValueChange={(value: string) =>
                formik.setFieldValue("userType", value)
              }
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

          {/* Organization Selection (Only for true Platform Admins) */}
          {isCurrentUserGlobalAdmin && (
            <div className="space-y-2">
              <Label
                htmlFor="tenantId"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"
              >
                <Building2 size={14} className="text-[#368F8B]" />
                Assign Organization
              </Label>
              <Select
                value={formik.values.tenantId}
                onValueChange={(value: string) =>
                  formik.setFieldValue("tenantId", value)
                }
              >
                <SelectTrigger className="h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:border-[#368F8B]">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} ({t.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hierarchy and Level fields removed as requested */}

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
