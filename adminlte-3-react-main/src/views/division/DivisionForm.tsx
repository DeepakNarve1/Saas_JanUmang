"use client";

import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
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
import {
  divisionSchema,
  divisionInitialValues,
  IDivisionFormValues,
} from "./division.schema";

interface DivisionFormProps {
  initialValues?: IDivisionFormValues;
  onSubmit: (values: IDivisionFormValues & { districts: string[] }) => void;
  loading?: boolean;
}

interface OptionItem {
  _id: string;
  name: string;
}

const DivisionForm = ({
  initialValues = divisionInitialValues,
  onSubmit,
  loading = false,
}: DivisionFormProps) => {
  const [statesList, setStatesList] = useState<OptionItem[]>([]);
  const [newDistricts, setNewDistricts] = useState<string[]>([]);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const { data } = await axios.get("/states");
      setStatesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch states");
    }
  };

  const formik = useFormik<IDivisionFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: divisionSchema,
    onSubmit: (values) => {
      onSubmit({ ...values, districts: newDistricts });
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* State Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="state"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.state}
                onValueChange={(value) => formik.setFieldValue("state", value)}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.state && formik.errors.state
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {statesList.map((st: OptionItem) => (
                    <SelectItem key={st._id} value={st._id}>
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.state && formik.errors.state && (
                <p className="text-sm text-red-500">{formik.errors.state}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Division Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter division name"
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
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
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
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[120px] rounded-lg shadow-lg shadow-[#368F8B]/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Division"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DivisionForm;
