"use client";

import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import { useFormik } from "formik";
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
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  districtSchema,
  districtInitialValues,
  IDistrictFormValues,
} from "./district.schema";

interface DistrictFormProps {
  initialValues?: IDistrictFormValues;
  onSubmit: (values: IDistrictFormValues) => void;
  loading?: boolean;
}

interface OptionItem {
  _id: string;
  name: string;
}

const DistrictForm = ({
  initialValues = districtInitialValues,
  onSubmit,
  loading = false,
}: DistrictFormProps) => {
  const [statesList, setStatesList] = useState<OptionItem[]>([]);
  const [divisionsList, setDivisionsList] = useState<OptionItem[]>([]);
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDivisions(selectedState);
    } else {
      setDivisionsList([]);
    }
  }, [selectedState]);

  // Pre-select state if initial division is present
  useEffect(() => {
    const init = async () => {
      if (initialValues.division && !selectedState) {
        try {
          const res = await axios.get(`/divisions/${initialValues.division}`);
          const divData = res.data?.data;
          if (divData && divData.state) {
            const stId = divData.state._id || divData.state;
            setSelectedState(stId);
          }
        } catch (error: unknown) {
          handleError(
            error,
            "Failed to fetch division details for state pre-selection",
          );
        }
      }
    };
    init();
  }, [initialValues.division]);

  const fetchStates = async () => {
    try {
      const { data } = await axios.get("/states");
      setStatesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch states");
    }
  };

  const fetchDivisions = async (stateId: string) => {
    try {
      const { data } = await axios.get(`/divisions?state=${stateId}&limit=-1`);
      setDivisionsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch divisions");
    }
  };

  const formik = useFormik<IDistrictFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: districtSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* State Select */}
            <div className="grid gap-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedState}
                onValueChange={(val) => {
                  setSelectedState(val);
                  formik.setFieldValue("division", "");
                }}
              >
                <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
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
            </div>

            {/* Division Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="division"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Division <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.division}
                onValueChange={(value) =>
                  formik.setFieldValue("division", value)
                }
                disabled={!selectedState}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.division && formik.errors.division
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisionsList.map((div: OptionItem) => (
                    <SelectItem key={div._id} value={div._id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.division && formik.errors.division && (
                <p className="text-sm text-red-500">{formik.errors.division}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                District Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter district name (e.g. Indore)"
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
                "Save District"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DistrictForm;
