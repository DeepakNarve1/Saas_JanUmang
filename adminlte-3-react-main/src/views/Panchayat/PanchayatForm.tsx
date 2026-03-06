"use client";

import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { useFormik } from "formik";
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
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  panchayatSchema,
  panchayatInitialValues,
  IPanchayatFormValues,
} from "./panchayat.schema";

interface PanchayatFormProps {
  initialValues?: IPanchayatFormValues;
  onSubmit: (values: IPanchayatFormValues) => void;
  loading?: boolean;
  isEdit?: boolean;
}

interface OptionItem {
  _id: string;
  name: string;
}

const PanchayatForm = ({
  initialValues = panchayatInitialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}: PanchayatFormProps) => {
  const [statesList, setStatesList] = useState<OptionItem[]>([]);
  const [divisionsList, setDivisionsList] = useState<OptionItem[]>([]);
  const [districtsList, setDistrictsList] = useState<OptionItem[]>([]);
  const [parliamentsList, setParliamentsList] = useState<OptionItem[]>([]);
  const [assembliesList, setAssembliesList] = useState<OptionItem[]>([]);
  const [blocksList, setBlocksList] = useState<OptionItem[]>([]);
  const [boothsList, setBoothsList] = useState<OptionItem[]>([]);

  useEffect(() => {
    fetchStates();
    fetchBlocks();
  }, []);

  useEffect(() => {
    if (initialValues.state) {
      fetchDivisions(initialValues.state);
    }
    if (initialValues.division) {
      fetchDistricts(initialValues.division);
      fetchParliaments({ divisionId: initialValues.division });
    }
    if (initialValues.parliament) {
      fetchAssemblies(initialValues.parliament);
    }
    if (initialValues.assembly) {
      fetchBlocks();
    }
    if (initialValues.block) {
      fetchBooths(initialValues.block);
    }
  }, [initialValues]);

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

  const fetchDistricts = async (divisionId: string) => {
    if (!divisionId) {
      setDistrictsList([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `/districts?limit=-1&division=${divisionId}`,
      );
      setDistrictsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch districts");
    }
  };

  const fetchParliaments = async ({ divisionId }: { divisionId?: string }) => {
    if (!divisionId) {
      setParliamentsList([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `/parliaments?limit=-1&division=${divisionId}`,
      );
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

  const fetchBlocks = async () => {
    try {
      const { data } = await axios.get("/blocks?limit=-1");
      setBlocksList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch blocks");
    }
  };

  const fetchBooths = async (blockId: string) => {
    if (!blockId) {
      setBoothsList([]);
      return;
    }
    try {
      const { data } = await axios.get(`/booths?limit=-1&block=${blockId}`);
      setBoothsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch booths");
    }
  };

  const formik = useFormik<IPanchayatFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: panchayatSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {!isEdit && (
              <>
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
                      formik.setFieldValue("block", "");
                      formik.setFieldValue("booth", "");
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
                      {statesList.map((st) => (
                        <SelectItem key={st._id} value={st._id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.state && formik.errors.state && (
                    <p className="text-sm text-red-500">
                      {formik.errors.state}
                    </p>
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
                      formik.setFieldValue("block", "");
                      formik.setFieldValue("booth", "");
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
                      {divisionsList.map((div) => (
                        <SelectItem key={div._id} value={div._id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.division && formik.errors.division && (
                    <p className="text-sm text-red-500">
                      {formik.errors.division}
                    </p>
                  )}
                </div>

                {/* District Select */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="district"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    District (Optional)
                  </Label>
                  <Select
                    value={formik.values.district}
                    onValueChange={(value) => {
                      formik.setFieldValue("district", value);
                    }}
                    disabled={!formik.values.division}
                  >
                    <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsList.map((dist) => (
                        <SelectItem key={dist._id} value={dist._id}>
                          {dist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      formik.setFieldValue("block", "");
                      formik.setFieldValue("booth", "");
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
                      {parliamentsList.map((par) => (
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
                    onValueChange={(value) => {
                      formik.setFieldValue("assembly", value);
                      formik.setFieldValue("block", "");
                      formik.setFieldValue("booth", "");
                      fetchBlocks();
                    }}
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
                      {assembliesList.map((asm) => (
                        <SelectItem key={asm._id} value={asm._id}>
                          {asm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.assembly && formik.errors.assembly && (
                    <p className="text-sm text-red-500">
                      {formik.errors.assembly}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Block Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="block"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Block <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.block}
                onValueChange={(value) => {
                  formik.setFieldValue("block", value);
                  formik.setFieldValue("booth", "");
                  fetchBooths(value);
                }}
                disabled={!isEdit && !formik.values.assembly}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.block && formik.errors.block
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  {blocksList.map((blk) => (
                    <SelectItem key={blk._id} value={blk._id}>
                      {blk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.block && formik.errors.block && (
                <p className="text-sm text-red-500">{formik.errors.block}</p>
              )}
            </div>

            {/* Booth Select */}
            <div className="grid gap-2">
              <Label
                htmlFor="booth"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Booth <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.booth}
                onValueChange={(value) => formik.setFieldValue("booth", value)}
                disabled={!formik.values.block}
              >
                <SelectTrigger
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.booth && formik.errors.booth
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select booth" />
                </SelectTrigger>
                <SelectContent>
                  {boothsList.map((bth) => (
                    <SelectItem key={bth._id} value={bth._id}>
                      {bth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.booth && formik.errors.booth && (
                <p className="text-sm text-red-500">{formik.errors.booth}</p>
              )}
            </div>

            {/* Panchayat Name Input */}
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Panchayat Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter panchayat name"
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
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[120px] rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Panchayat"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PanchayatForm;
