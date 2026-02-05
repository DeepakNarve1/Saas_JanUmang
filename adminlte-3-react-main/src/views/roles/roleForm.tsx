"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Checkbox } from "@app/components/ui/checkbox";
import { Label } from "@app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Loader2 } from "lucide-react";
import { roleSchema, roleInitialValues, IRoleFormValues } from "./role.schema";
import { IPermission } from "@app/types/role";

interface RoleFormProps {
  initialValues?: IRoleFormValues;
  onSubmit: (values: IRoleFormValues) => void;
  loading?: boolean;
}

const moduleIcons: Record<string, string> = {
  dashboard: "fas fa-tachometer-alt",
  users: "fas fa-wrench",
  roles: "fas fa-user-shield",
  user_count: "fas fa-user",
  members: "fas fa-users",
  mp_public_problems: "fas fa-exclamation-circle",
  assembly_issues: "fas fa-university",
  "vidhasabha-samiti": "fas fa-building",
  projects: "fas fa-user-friends",
  visitors: "fas fa-id-badge",
  events: "fas fa-calendar-alt",
  voter: "fas fa-vote-yea",
  samiti: "fas fa-handshake",
  districts: "fas fa-map-marker-alt",
  vidhan_sabha: "fas fa-gavel",
  blocks: "fas fa-cubes",
  booths: "fas fa-person-booth",
  panchayat: "fas fa-users",
  villages: "fas fa-home",
  party: "fas fa-flag",
  department: "fas fa-building",
  worktype: "fas fa-briefcase",
  sub_type_of_work: "fas fa-tasks",
  states: "fas fa-map",
  divisions: "fas fa-layer-group",
  parliaments: "fas fa-landmark",
  assemblies: "fas fa-columns",
  phone_directory: "fas fa-address-book",
  in_docs: "fas fa-file-alt",
  inward_register: "fas fa-file-invoice",
  dispatch_register: "fas fa-paper-plane",
  call_management: "fas fa-phone",
  activity_management: "fas fa-history",
};

const RoleForm = ({
  initialValues = roleInitialValues,
  onSubmit,
  loading = false,
}: RoleFormProps) => {
  const [permissions, setPermissions] = useState<IPermission[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/rbac/permissions", {
          params: { limit: -1 },
        });
        setPermissions(res.data.data || []);
      } catch (err) {
        console.error("Failed to load permissions", err);
      }
    };
    fetchPermissions();
  }, []);

  const formik = useFormik<IRoleFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: roleSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  const togglePermission = (
    category: string,
    type: "view" | "create" | "edit" | "delete",
  ) => {
    let toToggle: IPermission[] = [];
    if (type === "view") {
      toToggle = permissions.filter(
        (p) =>
          p.category === category &&
          (p.name.includes("view") || p.name.includes("list")),
      );
    } else {
      toToggle = permissions.filter(
        (p) => p.category === category && p.name.includes(type),
      );
      if (toToggle.length === 0) {
        toToggle = permissions.filter(
          (p) => p.category === category && p.name.includes("manage"),
        );
      }
    }

    if (toToggle.length === 0) return;

    const ids = toToggle.map((p) => p._id);
    const currentPermissions = [...formik.values.permissions];
    const allPresent = ids.every((id) => currentPermissions.includes(id));

    if (allPresent) {
      formik.setFieldValue(
        "permissions",
        currentPermissions.filter((id) => !ids.includes(id)),
      );
    } else {
      formik.setFieldValue("permissions", [
        ...new Set([...currentPermissions, ...ids]),
      ]);
    }
  };

  const isChecked = (
    category: string,
    type: "view" | "create" | "edit" | "delete",
  ) => {
    let permsToCheck = [];
    if (type === "view") {
      permsToCheck = permissions.filter(
        (p) =>
          p.category === category &&
          (p.name.includes("view") || p.name.includes("list")),
      );
    } else {
      permsToCheck = permissions.filter(
        (p) => p.category === category && p.name.includes(type),
      );
      if (permsToCheck.length === 0) {
        permsToCheck = permissions.filter(
          (p) => p.category === category && p.name.includes("manage"),
        );
      }
    }

    if (permsToCheck.length === 0) return false;
    return permsToCheck.every((p) => formik.values.permissions.includes(p._id));
  };

  const isTotalChecked = (category: string) => {
    const categoryPermissions = permissions.filter(
      (p) => p.category === category,
    );
    if (categoryPermissions.length === 0) return false;
    return categoryPermissions.every((p) =>
      formik.values.permissions.includes(p._id),
    );
  };

  const toggleTotal = (category: string) => {
    const categoryPermissions = permissions.filter(
      (p) => p.category === category,
    );
    if (categoryPermissions.length === 0) return;

    const ids = categoryPermissions.map((p) => p._id);
    const currentPermissions = [...formik.values.permissions];
    const allPresent = ids.every((id) => currentPermissions.includes(id));

    if (allPresent) {
      formik.setFieldValue(
        "permissions",
        currentPermissions.filter((id) => !ids.includes(id)),
      );
    } else {
      formik.setFieldValue("permissions", [
        ...new Set([...currentPermissions, ...ids]),
      ]);
    }
  };

  const isDisabled = (
    category: string,
    type: "view" | "create" | "edit" | "delete",
  ) => {
    let permsToCheck = [];
    if (type === "view") {
      permsToCheck = permissions.filter(
        (p) =>
          p.category === category &&
          (p.name.includes("view") || p.name.includes("list")),
      );
    } else {
      permsToCheck = permissions.filter(
        (p) => p.category === category && p.name.includes(type),
      );
      if (permsToCheck.length === 0) {
        permsToCheck = permissions.filter(
          (p) => p.category === category && p.name.includes("manage"),
        );
      }
    }
    return permsToCheck.length === 0;
  };

  const isAllTotalChecked = () => {
    if (permissions.length === 0) return false;
    return permissions.every((p) => formik.values.permissions.includes(p._id));
  };

  const toggleAllTotal = () => {
    const allIds = permissions.map((p) => p._id);
    const allPresent = allIds.every((id) =>
      formik.values.permissions.includes(id),
    );
    formik.setFieldValue("permissions", allPresent ? [] : allIds);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Role Name (System) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. manager"
            className={
              formik.touched.name && formik.errors.name ? "border-red-500" : ""
            }
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-sm text-red-500">{formik.errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">
            Display Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="displayName"
            value={formik.values.displayName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Manager"
            className={
              formik.touched.displayName && formik.errors.displayName
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.displayName && formik.errors.displayName && (
            <p className="text-sm text-red-500">{formik.errors.displayName}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Role description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formik.values.status}
            onValueChange={(value) => formik.setFieldValue("status", value)}
          >
            <SelectTrigger
              id="status"
              className={
                formik.touched.status && formik.errors.status
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.status && formik.errors.status && (
            <p className="text-sm text-red-500">{formik.errors.status}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between dark:text-white">
          Permissions
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {formik.values.permissions.length} assigned
          </span>
        </h3>
        <div className="border rounded-lg overflow-hidden shadow-sm overflow-x-auto custom-scrollbar bg-white dark:bg-gray-900 dark:border-gray-700">
          <Table className="w-full border-collapse">
            {/* Sticky Header with improved background */}
            <TableHeader className="bg-[#00563B] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-white dark:text-gray-200 h-9 pl-6 w-1/4 lg:w-[20%]">
                  Module
                </TableHead>
                <TableHead className="font-bold text-white dark:text-gray-200 text-center h-9">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold">
                      Total
                    </span>
                    <Checkbox
                      checked={isAllTotalChecked()}
                      onCheckedChange={() => toggleAllTotal()}
                      className="w-4 h- border-gray-300 data-[state=checked]:bg-[#00563B] data-[state=checked]:border-[#00563B]"
                    />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-white dark:text-gray-200 text-center h-9">
                  View
                </TableHead>
                <TableHead className="font-bold text-white dark:text-gray-200 text-center h-9">
                  Create
                </TableHead>
                <TableHead className="font-bold text-white dark:text-gray-200 text-center h-9">
                  Edit
                </TableHead>
                <TableHead className="font-bold text-white dark:text-gray-200 text-center h-9">
                  Delete
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category}
                  className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 capitalize py-1 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {moduleIcons[category] ? (
                          <i className={`${moduleIcons[category]}`} />
                        ) : (
                          <i className="fas fa-layer-group" />
                        )}
                      </div>
                      <span className="truncate block flex-1">
                        {category.replace(/_/g, " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox
                      checked={isTotalChecked(category)}
                      onCheckedChange={() => toggleTotal(category)}
                      className="w-4 h-4 border-gray-300 data-[state=checked]:bg-[#00563B] data-[state=checked]:border-[#00563B]"
                    />
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Checkbox
                      checked={isChecked(category, "view")}
                      disabled={isDisabled(category, "view")}
                      onCheckedChange={() => togglePermission(category, "view")}
                      className="w-4 h-4 data-[state=checked]:bg-[#2e7a76] data-[state=checked]:border-[#2e7a76] border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox
                      checked={isChecked(category, "create")}
                      disabled={isDisabled(category, "create")}
                      onCheckedChange={() =>
                        togglePermission(category, "create")
                      }
                      className="w-4 h-4 data-[state=checked]:bg-[#2e7a76] data-[state=checked]:border-[#2e7a76] border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox
                      checked={isChecked(category, "edit")}
                      disabled={isDisabled(category, "edit")}
                      onCheckedChange={() => togglePermission(category, "edit")}
                      className="w-4 h-4 data-[state=checked]:bg-[#2e7a76] data-[state=checked]:border-[#2e7a76] border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox
                      checked={isChecked(category, "delete")}
                      disabled={isDisabled(category, "delete")}
                      onCheckedChange={() =>
                        togglePermission(category, "delete")
                      }
                      className="w-4 h-4 data-[state=checked]:bg-[#2e7a76] data-[state=checked]:border-[#2e7a76] border-gray-300"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#00563B] hover:bg-[#2e7a76] min-w-[120px] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Role"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => formik.resetForm()}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
