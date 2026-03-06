"use client";

import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import ReactSelect from "react-select";
import {
  dispatchRegisterSchema,
  dispatchRegisterInitialValues,
  IDispatchRegisterFormValues,
} from "./dispatchRegister.schema";

interface DispatchRegisterFormProps {
  initialValues?: IDispatchRegisterFormValues;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  isViewMode?: boolean;
}

const DispatchRegisterForm = ({
  initialValues = dispatchRegisterInitialValues,
  onSubmit,
  isLoading,
  isViewMode = false,
}: DispatchRegisterFormProps) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [panchayats, setPanchayats] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const formik = useFormik<IDispatchRegisterFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: dispatchRegisterSchema,
    onSubmit: (values) => {
      // Map selected objects to IDs for submission
      const submitValues = {
        ...values,
        panchayat: values.panchayat.map((p: any) => p.value),
        village: values.village.map((v: any) => v.value),
      };
      onSubmit(submitValues);
    },
  });

  // Fetch Departments and Districts on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, distRes] = await Promise.all([
          axios.get("/departments", { params: { limit: -1 } }),
          axios.get("/districts", { params: { limit: -1 } }),
        ]);

        setDepartments(deptRes.data.data || []);
        setDistricts(distRes.data.data || []);
      } catch (error: unknown) {
        handleError(
          error,
          "Failed to fetch initial data for dispatch register",
        );
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Blocks when District changes
  useEffect(() => {
    const fetchBlocks = async () => {
      if (formik.values.district) {
        try {
          const res = await axios.get("/blocks", {
            params: { district: formik.values.district, limit: -1 },
          });
          setBlocks(res.data.data || []);
        } catch (error: unknown) {
          handleError(error, "Failed to fetch blocks");
        }
      } else {
        setBlocks([]);
      }
    };
    fetchBlocks();
  }, [formik.values.district]);

  // Fetch Panchayats when Block changes
  useEffect(() => {
    const fetchPanchayats = async () => {
      if (formik.values.block) {
        try {
          const res = await axios.get("/panchayat", {
            params: { block: formik.values.block, limit: -1 },
          });
          setPanchayats(
            (res.data.data || []).map((p: any) => ({
              label: p.name,
              value: p._id,
            })),
          );
        } catch (error: unknown) {
          handleError(error, "Failed to fetch panchayats");
        }
      } else {
        setPanchayats([]);
      }
    };
    fetchPanchayats();
  }, [formik.values.block]);

  // Fetch Villages when Block changes
  useEffect(() => {
    const fetchVillages = async () => {
      if (formik.values.block) {
        try {
          const res = await axios.get("/villages", {
            params: { block: formik.values.block, limit: -1 },
          });
          setVillages(
            (res.data.data || []).map((v: any) => ({
              label: v.name,
              value: v._id,
            })),
          );
        } catch (error: unknown) {
          handleError(error, "Failed to fetch villages");
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillages();
  }, [formik.values.block]);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="p-6">
      <div className="space-y-6">
        <h4 className="text-lg font-semibold border-b pb-2 mb-4">
          Enter Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="date"
              value={formatDateForInput(formik.values.date)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={
                formik.touched.date && formik.errors.date
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.date && formik.errors.date && (
              <p className="text-sm text-red-500">{formik.errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Year <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.year}
              onValueChange={(val) => formik.setFieldValue("year", val)}
              disabled={isViewMode}
            >
              <SelectTrigger
                className={
                  formik.touched.year && formik.errors.year
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.year && formik.errors.year && (
              <p className="text-sm text-red-500">{formik.errors.year}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Month <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.month}
              onValueChange={(val) => formik.setFieldValue("month", val)}
              disabled={isViewMode}
            >
              <SelectTrigger
                className={
                  formik.touched.month && formik.errors.month
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.month && formik.errors.month && (
              <p className="text-sm text-red-500">{formik.errors.month}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Portal No.
            </label>
            <Input
              name="portalNo"
              value={formik.values.portalNo}
              onChange={formik.handleChange}
              disabled={isViewMode}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Samiti No.
            </label>
            <Input
              name="samitiNo"
              value={formik.values.samitiNo}
              onChange={formik.handleChange}
              disabled={isViewMode}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dispatch No. <span className="text-red-500">*</span>
            </label>
            <Input
              name="dispatchNo"
              value={formik.values.dispatchNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={
                formik.touched.dispatchNo && formik.errors.dispatchNo
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.dispatchNo && formik.errors.dispatchNo && (
              <p className="text-sm text-red-500">{formik.errors.dispatchNo}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Department
            </label>
            <Select
              value={formik.values.department}
              onValueChange={(val) => formik.setFieldValue("department", val)}
              disabled={isViewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Particular (subject)
            </label>
            <Textarea
              name="particulars"
              value={formik.values.particulars}
              onChange={formik.handleChange}
              disabled={isViewMode}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reference
            </label>
            <Textarea
              name="reference"
              value={formik.values.reference}
              onChange={formik.handleChange}
              disabled={isViewMode}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              District
            </label>
            <Select
              value={formik.values.district}
              onValueChange={(val) => {
                formik.setFieldValue("district", val);
                formik.setFieldValue("block", "");
                formik.setFieldValue("panchayat", []);
                formik.setFieldValue("village", []);
              }}
              disabled={isViewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Block</label>
            <Select
              value={formik.values.block}
              onValueChange={(val) => {
                formik.setFieldValue("block", val);
                formik.setFieldValue("panchayat", []);
                formik.setFieldValue("village", []);
              }}
              disabled={isViewMode || !formik.values.district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Block" />
              </SelectTrigger>
              <SelectContent>
                {blocks.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Panchayat (Multiple)
            </label>
            <ReactSelect
              isMulti
              options={panchayats}
              value={formik.values.panchayat}
              onChange={(val: any) => formik.setFieldValue("panchayat", val)}
              isDisabled={isViewMode}
              placeholder="Select Panchayat..."
              className="text-sm"
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Village (Multiple)
            </label>
            <ReactSelect
              isMulti
              options={villages}
              value={formik.values.village}
              onChange={(val: any) => formik.setFieldValue("village", val)}
              isDisabled={isViewMode}
              placeholder="Select Village..."
              className="text-sm"
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Upload Letter
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              name="uploadLetterInput"
              onChange={(event) => {
                if (event.currentTarget.files && event.currentTarget.files[0]) {
                  formik.setFieldValue(
                    "uploadLetter",
                    event.currentTarget.files[0],
                  );
                }
              }}
              disabled={isViewMode}
            />
          </div>
          <p className="text-xs text-gray-500">
            Allowed: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
          </p>
        </div>
      </div>

      {!isViewMode && (
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            className="bg-[#00563B] hover:bg-[#368F8B] min-w-[120px]"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-[120px]"
            disabled={isLoading}
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
};

export default DispatchRegisterForm;
