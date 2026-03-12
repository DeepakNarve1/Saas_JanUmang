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
import { Loader2, Plus, X } from "lucide-react";
import {
  blockSchema,
  blockInitialValues,
  IBlockFormValues,
} from "./block.schema";

interface BlockFormProps {
  initialValues?: IBlockFormValues;
  onSubmit: (values: IBlockFormValues) => void;
  loading?: boolean;
  isEdit?: boolean;
}

interface OptionItem {
  _id: string;
  name: string;
}

const BlockForm = ({
  initialValues = blockInitialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}: BlockFormProps) => {
  const [statesList, setStatesList] = useState<OptionItem[]>([]);
  const [divisionsList, setDivisionsList] = useState<OptionItem[]>([]);
  const [districtsList, setDistrictsList] = useState<OptionItem[]>([]);
  const [parliamentsList, setParliamentsList] = useState<OptionItem[]>([]);
  const [assembliesList, setAssembliesList] = useState<OptionItem[]>([]);

  useEffect(() => {
    fetchStates();
    if (!initialValues.division) {
      fetchDistricts();
    }
  }, []);

  // Hydrate dependent dropdowns if initialValues are present (Edit mode)
  useEffect(() => {
    if (initialValues.state) {
      fetchDivisions(initialValues.state);
    }
  }, [initialValues.state]);

  useEffect(() => {
    if (initialValues.division) {
      fetchDistricts(initialValues.division);
      fetchParliaments({
        divisionId: initialValues.division,
        districtId: initialValues.district,
      });
    }
  }, [initialValues.division, initialValues.district]);

  useEffect(() => {
    if (initialValues.parliament) {
      fetchAssemblies(initialValues.parliament);
    }
  }, [initialValues.parliament]);

  const fetchStates = async () => {
    try {
      const { data } = await axios.get("/states?limit=-1");
      setStatesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch states");
    }
  };

  const fetchDivisions = async (stateId: string) => {
    if (!stateId) {
      setDivisionsList([]);
      return;
    }
    try {
      const { data } = await axios.get(`/divisions?limit=-1&state=${stateId}`);
      setDivisionsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch divisions");
    }
  };

  const fetchDistricts = async (divisionId?: string) => {
    try {
      let url = "/districts?limit=-1";
      if (divisionId) {
        url += `&division=${divisionId}`;
      }
      const { data } = await axios.get(url);
      setDistrictsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch districts");
    }
  };

  const fetchParliaments = async ({
    divisionId,
    districtId,
  }: {
    divisionId?: string;
    districtId?: string;
  }) => {
    if (!divisionId) {
      setParliamentsList([]);
      return;
    }
    try {
      let url = `/parliaments?limit=-1&division=${divisionId}`;
      if (districtId) {
        url += `&district=${districtId}`;
      }
      const { data } = await axios.get(url);
      setParliamentsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch parliaments");
    }
  };

  const fetchAssemblies = async (parliamentId: string) => {
    if (!parliamentId) {
      setAssembliesList([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `/assemblies?limit=-1&parliament=${parliamentId}`,
      );
      setAssembliesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch assemblies");
    }
  };

  const formik = useFormik<IBlockFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: blockSchema,
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
              <Label
                htmlFor="state"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.state}
                onValueChange={(value) => {
                  formik.setFieldValue("state", value);
                  formik.setFieldValue("division", "");
                  formik.setFieldValue("district", "");
                  formik.setFieldValue("parliament", "");
                  formik.setFieldValue("assembly", "");
                  fetchDivisions(value);
                }}
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
                onValueChange={(value) => {
                  formik.setFieldValue("division", value);
                  formik.setFieldValue("district", "");
                  formik.setFieldValue("parliament", "");
                  formik.setFieldValue("assembly", "");
                  fetchDistricts(value);
                  fetchParliaments({ divisionId: value });
                }}
                disabled={!formik.values.state}
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

            {/* District Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="district"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                District <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.district}
                onValueChange={(value) => {
                  formik.setFieldValue("district", value);
                  formik.setFieldValue("parliament", "");
                  formik.setFieldValue("assembly", "");
                  fetchParliaments({
                    divisionId: formik.values.division,
                    districtId: value,
                  });
                }}
                disabled={!formik.values.division}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.district && formik.errors.district
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districtsList.map((dist: OptionItem) => (
                    <SelectItem key={dist._id} value={dist._id}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.district && formik.errors.district && (
                <p className="text-sm text-red-500">{formik.errors.district}</p>
              )}
            </div>

            {/* Parliament Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="parliament"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Parliament <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.parliament}
                onValueChange={(value) => {
                  formik.setFieldValue("parliament", value);
                  formik.setFieldValue("assembly", "");
                  fetchAssemblies(value);
                }}
                disabled={!formik.values.division}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.parliament && formik.errors.parliament
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select parliament" />
                </SelectTrigger>
                <SelectContent>
                  {parliamentsList.map((par: OptionItem) => (
                    <SelectItem key={par._id} value={par._id}>
                      {par.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.parliament && formik.errors.parliament && (
                <p className="text-sm text-red-500">
                  {formik.errors.parliament}
                </p>
              )}
            </div>

            {/* Assembly Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="assembly"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Assembly <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.assembly}
                onValueChange={(value) =>
                  formik.setFieldValue("assembly", value)
                }
                disabled={!formik.values.parliament}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.assembly && formik.errors.assembly
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select assembly" />
                </SelectTrigger>
                <SelectContent>
                  {assembliesList.map((asm: OptionItem) => (
                    <SelectItem key={asm._id} value={asm._id}>
                      {asm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.assembly && formik.errors.assembly && (
                <p className="text-sm text-red-500">{formik.errors.assembly}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Block Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter block name"
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

            {/* Year Input */}
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
                placeholder="Enter year"
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
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[120px] rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Block"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlockForm;
