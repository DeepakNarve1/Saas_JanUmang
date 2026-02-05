"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Card, CardContent } from "@app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Textarea } from "@app/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  phoneDirectorySchema,
  phoneDirectoryInitialValues,
  IPhoneDirectoryFormValues,
} from "./phoneDirectory.schema";

interface IDropdownOption {
  _id: string;
  name: string;
}

interface PhoneDirectoryFormProps {
  initialValues?: IPhoneDirectoryFormValues;
  onSubmit: (values: IPhoneDirectoryFormValues) => void;
  loading?: boolean;
  departments: IDropdownOption[];
  districts: IDropdownOption[];
  blocks: IDropdownOption[];
  parties: IDropdownOption[];
}

const PhoneDirectoryForm = ({
  initialValues = phoneDirectoryInitialValues,
  onSubmit,
  loading = false,
  departments,
  districts,
  blocks,
  parties,
}: PhoneDirectoryFormProps) => {
  const formik = useFormik<IPhoneDirectoryFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: phoneDirectorySchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Resolve "Other" block name to its ID if it's the default
  useEffect(() => {
    if (formik.values.block === "Other" && blocks.length > 0) {
      const otherBlock = blocks.find((b) => b.name.toLowerCase() === "other");
      if (otherBlock) {
        formik.setFieldValue("block", otherBlock._id);
      }
    }
  }, [blocks, formik.values.block, formik.setFieldValue]);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-red-500">{formik.errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="post">Post</Label>
              <Input
                id="post"
                name="post"
                placeholder="Enter Post"
                value={formik.values.post}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formik.values.department}
                onValueChange={(value) =>
                  formik.setFieldValue("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={formik.values.district}
                onValueChange={(value) =>
                  formik.setFieldValue("district", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts?.map((dist) => (
                    <SelectItem key={dist._id} value={dist._id}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">
                VS Block <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.block}
                onValueChange={(value) => formik.setFieldValue("block", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.block && formik.errors.block
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select Block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks?.map((blk) => (
                    <SelectItem key={blk._id} value={blk._id}>
                      {blk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.block && formik.errors.block && (
                <p className="text-xs text-red-500">{formik.errors.block}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Party</Label>
              <Select
                value={formik.values.party}
                onValueChange={(value) => formik.setFieldValue("party", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Party" />
                </SelectTrigger>
                <SelectContent>
                  {parties?.map((party) => (
                    <SelectItem key={party._id} value={party._id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">
                Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                name="number"
                type="text"
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter Phone Number"
                value={formik.values.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    formik.setFieldValue("number", value);
                  }
                }}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.number && formik.errors.number
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.number && formik.errors.number && (
                <p className="text-xs text-red-500">{formik.errors.number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternateNumber">Alternate Number</Label>
              <Input
                id="alternateNumber"
                name="alternateNumber"
                type="text"
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter Alternate Number"
                value={formik.values.alternateNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    formik.setFieldValue("alternateNumber", value);
                  }
                }}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.alternateNumber &&
                  formik.errors.alternateNumber
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.alternateNumber &&
                formik.errors.alternateNumber && (
                  <p className="text-xs text-red-500">
                    {formik.errors.alternateNumber}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              name="remark"
              placeholder="Enter Remark"
              value={formik.values.remark}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialValues.name ? "Update Entry" : "Create Entry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhoneDirectoryForm;
