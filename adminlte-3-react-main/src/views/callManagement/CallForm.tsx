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
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { callSchema, callInitialValues, ICallFormValues } from "./call.schema";

interface CallFormProps {
  initialValues?: ICallFormValues;
  onSubmit: (values: ICallFormValues) => void;
  isLoading: boolean;
  isViewMode?: boolean;
}

const CallForm = ({
  initialValues = callInitialValues,
  onSubmit,
  isLoading,
  isViewMode = false,
}: CallFormProps) => {
  const router = useRouter();

  const formik = useFormik<ICallFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: callSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="p-6">
      <div className="space-y-6">
        <h4 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-700">
          Call Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              name="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={
                formik.touched.date && formik.errors.date
                  ? "border-red-500 bg-gray-50"
                  : "bg-gray-50"
              }
            />
            {formik.touched.date && formik.errors.date && (
              <p className="text-sm text-red-500">{formik.errors.date}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.category}
              onValueChange={(val) => formik.setFieldValue("category", val)}
              disabled={isViewMode}
            >
              <SelectTrigger
                className={
                  formik.touched.category && formik.errors.category
                    ? "border-red-500 bg-gray-50"
                    : "bg-gray-50"
                }
              >
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {["Appointment", "Samsya", "General"].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <p className="text-sm text-red-500">{formik.errors.category}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter full name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={
                formik.touched.name && formik.errors.name
                  ? "border-red-500 bg-gray-50"
                  : "bg-gray-50"
              }
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Mobile No */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mobile No <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter mobile number"
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
              disabled={isViewMode}
              className={
                formik.touched.mobile && formik.errors.mobile
                  ? "border-red-500 bg-gray-50"
                  : "bg-gray-50"
              }
            />
            {formik.touched.mobile && formik.errors.mobile && (
              <p className="text-sm text-red-500">{formik.errors.mobile}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Brief subject of the call"
              name="subject"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={
                formik.touched.subject && formik.errors.subject
                  ? "border-red-500 bg-gray-50"
                  : "bg-gray-50"
              }
            />
            {formik.touched.subject && formik.errors.subject && (
              <p className="text-sm text-red-500">{formik.errors.subject}</p>
            )}
          </div>

          {/* Assign Date & Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Assign Date & Time
            </label>
            <Input
              type="datetime-local"
              name="assignDate"
              value={formik.values.assignDate}
              onChange={formik.handleChange}
              disabled={isViewMode}
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Address</label>
          <Textarea
            placeholder="Complete address with landmarks"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            disabled={isViewMode}
            className="min-h-[80px] bg-gray-50"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Detailed description of the call or issue"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isViewMode}
            className={
              formik.touched.description && formik.errors.description
                ? "border-red-500 min-h-[100px] bg-gray-50"
                : "min-h-[100px] bg-gray-50"
            }
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-sm text-red-500">{formik.errors.description}</p>
          )}
        </div>

        {/* Remark */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Remark</label>
          <Textarea
            placeholder="Additional remarks or notes (optional)"
            name="remark"
            value={formik.values.remark}
            onChange={formik.handleChange}
            disabled={isViewMode}
            className="min-h-[100px] bg-gray-50"
          />
        </div>
      </div>

      {!isViewMode && (
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            className="bg-[#00563B] hover:bg-[#368F8B] min-w-[140px]"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Call Record"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-[120px]"
            disabled={isLoading}
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>
      )}
    </form>
  );
};

export default CallForm;
