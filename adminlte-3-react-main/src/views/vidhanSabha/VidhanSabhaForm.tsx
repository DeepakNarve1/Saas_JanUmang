"use client";

import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  vidhanSabhaSchema,
  vidhanSabhaInitialValues,
  IVidhanSabhaFormValues,
} from "./vidhanSabha.schema";

interface VidhanSabhaFormProps {
  initialValues?: IVidhanSabhaFormValues;
  onSubmit: (values: IVidhanSabhaFormValues) => void;
  loading?: boolean;
}

const VidhanSabhaForm = ({
  initialValues = vidhanSabhaInitialValues,
  onSubmit,
  loading = false,
}: VidhanSabhaFormProps) => {
  const formik = useFormik<IVidhanSabhaFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: vidhanSabhaSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                VidhanSabha Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter VidhanSabha name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="year"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="Enter Election Year (e.g. 2022, 2027)"
                value={formik.values.year || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                  formik.touched.year && formik.errors.year
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {formik.touched.year && formik.errors.year && (
                <p className="text-sm text-red-500">{formik.errors.year}</p>
              )}
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
              className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[120px] rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save VidhanSabha"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VidhanSabhaForm;
