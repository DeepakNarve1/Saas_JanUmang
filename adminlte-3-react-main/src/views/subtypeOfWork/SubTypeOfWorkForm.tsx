"use client";

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
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import {
  subtypeOfWorkSchema,
  subtypeOfWorkInitialValues,
  ISubTypeOfWorkFormValues,
} from "./subtypeOfWork.schema";

interface SubTypeOfWorkFormProps {
  initialValues?: ISubTypeOfWorkFormValues;
  onSubmit: (values: ISubTypeOfWorkFormValues) => void;
  loading?: boolean;
}

const SubTypeOfWorkForm = ({
  initialValues = subtypeOfWorkInitialValues,
  onSubmit,
  loading = false,
}: SubTypeOfWorkFormProps) => {
  const formik = useFormik<ISubTypeOfWorkFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: subtypeOfWorkSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Fetch Work Types
  const { data: workTypes = [], isLoading: loadingWorkTypes } = useQuery({
    queryKey: ["work-types-list"],
    queryFn: async () => {
      const res = await axios.get("/worktypes?limit=-1");
      return res.data?.data || [];
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                htmlFor="typeOfWork"
                className="text-gray-700 dark:text-gray-300"
              >
                Type of Work <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.typeOfWork}
                onValueChange={(value) =>
                  formik.setFieldValue("typeOfWork", value)
                }
                disabled={loadingWorkTypes || loading}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.typeOfWork && formik.errors.typeOfWork
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select Type of Work" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWorkTypes ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm">Loading...</span>
                    </div>
                  ) : workTypes.length === 0 ? (
                    <div className="py-2 px-3 text-sm text-gray-500">
                      No work types found
                    </div>
                  ) : (
                    workTypes.map((workType: any) => (
                      <SelectItem key={workType._id} value={workType.name}>
                        {workType.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formik.touched.typeOfWork && formik.errors.typeOfWork && (
                <p className="text-sm text-red-500">
                  {formik.errors.typeOfWork}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="subTypeOfWork"
                className="text-gray-700 dark:text-gray-300"
              >
                Sub Type of Work <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subTypeOfWork"
                name="subTypeOfWork"
                placeholder="Enter Sub Type of Work"
                value={formik.values.subTypeOfWork}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                  formik.touched.subTypeOfWork && formik.errors.subTypeOfWork
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {formik.touched.subTypeOfWork && formik.errors.subTypeOfWork && (
                <p className="text-sm text-red-500">
                  {formik.errors.subTypeOfWork}
                </p>
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
                "Save"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubTypeOfWorkForm;
