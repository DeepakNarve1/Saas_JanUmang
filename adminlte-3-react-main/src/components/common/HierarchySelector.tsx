"use client";
import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import { FormikProps } from "formik";
import { Label } from "@app/components/ui/label";
import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

interface HierarchySelectorProps {
  formik: FormikProps<any>;
  targetLevel?:
    | "state"
    | "division"
    | "district"
    | "parliament"
    | "assembly"
    | "block"
    | "panchayat"
    | "village"
    | "booth";
  disabled?: boolean;
}

const HierarchySelector = ({
  formik,
  targetLevel = "booth",
  disabled = false,
}: HierarchySelectorProps) => {
  const [lists, setLists] = useState<Record<string, any[]>>({
    states: [],
    divisions: [],
    districts: [],
    parliaments: [],
    assemblies: [],
    blocks: [],
    panchayats: [],
    booths: [],
  });

  const levels = [
    "state",
    "division",
    "district",
    "parliament",
    "assembly",
    "block",
    "panchayat",
    "village",
    "booth",
  ];
  const targetIndex = levels.indexOf(targetLevel);

  useEffect(() => {
    // Initial fetch of states
    const fetchInit = async () => {
      try {
        const { data } = await axios.get("/states?limit=-1");
        setLists((prev: Record<string, any[]>) => ({
          ...prev,
          states: data.data || [],
        }));
      } catch (error: unknown) {
        handleError(error, "Failed to fetch states");
      }
    };
    fetchInit();
  }, []);

  const fetchData = async (
    endpoint: string,
    params: Record<string, string>,
    listKey: string,
  ) => {
    try {
      const { data } = await axios.get(`/${endpoint}?limit=-1`, { params });
      setLists((prev: Record<string, any[]>) => ({
        ...prev,
        [listKey]: data.data || [],
      }));
    } catch (error: unknown) {
      handleError(error, `Failed to fetch ${listKey}`);
    }
  };

  const handleValueChange = (field: string, value: string) => {
    formik.setFieldValue(field, value);

    // Logic to reset downstream fields and fetch next level data
    // This is a simplified approach to avoid complex cascading issues
    switch (field) {
      case "state":
        formik.setFieldValue("division", "");
        formik.setFieldValue("district", "");
        formik.setFieldValue("parliament", "");
        formik.setFieldValue("assembly", "");
        formik.setFieldValue("block", "");
        formik.setFieldValue("panchayat", "");
        formik.setFieldValue("village", "");
        formik.setFieldValue("booth", "");
        if (value) fetchData("divisions", { state: value }, "divisions");
        break;
      case "division":
        formik.setFieldValue("district", "");
        formik.setFieldValue("parliament", "");
        formik.setFieldValue("assembly", "");
        formik.setFieldValue("block", "");
        formik.setFieldValue("panchayat", "");
        formik.setFieldValue("village", "");
        formik.setFieldValue("booth", "");
        if (value) {
          fetchData("districts", { division: value }, "districts");
          fetchData("parliaments", { division: value }, "parliaments");
        }
        break;
      case "district":
        // Depending on hierarchy, district might filter assembly?
        // Assuming assembly is under district/parliament
        break;
      case "parliament":
        formik.setFieldValue("assembly", "");
        formik.setFieldValue("block", "");
        formik.setFieldValue("panchayat", "");
        formik.setFieldValue("village", "");
        formik.setFieldValue("booth", "");
        if (value) fetchData("assemblies", { parliament: value }, "assemblies");
        break;
      case "assembly":
        formik.setFieldValue("block", "");
        formik.setFieldValue("panchayat", "");
        formik.setFieldValue("village", "");
        formik.setFieldValue("booth", "");
        if (value) fetchData("blocks", { assembly: value }, "blocks");
        break;
      case "block":
        formik.setFieldValue("panchayat", "");
        formik.setFieldValue("village", "");
        formik.setFieldValue("booth", "");
        if (value) {
          fetchData("panchayats", { block: value }, "panchayats");
          fetchData("booths", { block: value }, "booths");
        }
        break;
      case "panchayat":
        if (value === "") formik.setFieldValue("village", "");
        // No longer fetching villages as it is now a text input
        break;
      case "booth":
        // Auto-select linked Panchayat if not already selected
        if (value && !formik.values.panchayat) {
          // We need to find the panchayat associated with this booth
          // Since we can't easily reverse lookup client-side without extra calls,
          // we'll fetch panchayats filtered by this booth
          const fetchLinkedPanchayat = async () => {
            try {
              const { data } = await axios.get(`/panchayat?booth=${value}`);
              if (data.data && data.data.length > 0) {
                const p = data.data[0];
                formik.setFieldValue("panchayat", p._id);
                // No longer fetching villages as it is now a text input
              }
            } catch (error: unknown) {
              handleError(error, "Failed to auto-select panchayat");
            }
          };
          fetchLinkedPanchayat();
        }
        break;
    }
  };

  // Pre-fetch logic for existing values (edit mode)
  useEffect(() => {
    const init = async () => {
      if (formik.values.state)
        await fetchData(
          "divisions",
          { state: formik.values.state },
          "divisions",
        );
      if (formik.values.division) {
        await fetchData(
          "districts",
          { division: formik.values.division },
          "districts",
        );
        await fetchData(
          "parliaments",
          { division: formik.values.division },
          "parliaments",
        );
      }
      if (formik.values.parliament)
        await fetchData(
          "assemblies",
          { parliament: formik.values.parliament },
          "assemblies",
        );
      if (formik.values.assembly)
        await fetchData(
          "blocks",
          { assembly: formik.values.assembly },
          "blocks",
        );
      if (formik.values.block) {
        await fetchData(
          "panchayats",
          { block: formik.values.block },
          "panchayats",
        );
        await fetchData("booths", { block: formik.values.block }, "booths");
      }
      // No longer initializing village list
    };
    init();
  }, [formik.initialValues]);

  const renderSelect = (level: string, label: string, parentLevel?: string) => {
    const listKey = level + "s";
    const options = lists[listKey] || [];
    const isLevelDisabled = Boolean(
      disabled || (parentLevel && !formik.values[parentLevel]),
    );

    // Only show up to targetLevel
    if (levels.indexOf(level) > targetIndex) return null;

    return (
      <div className="space-y-2" key={level}>
        <Label
          htmlFor={level}
          className="text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider"
        >
          {label}
        </Label>
        <Select
          value={formik.values[level] || ""}
          onValueChange={(val) => handleValueChange(level, val)}
          disabled={isLevelDisabled}
        >
          <SelectTrigger
            id={level}
            className={`h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:ring-[#00563B] ${formik.touched[level] && formik.errors[level] ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((item: any) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched[level] && formik.errors[level] && (
          <p className="text-[10px] text-red-500 font-bold uppercase">
            {formik.errors[level] as string}
          </p>
        )}
      </div>
    );
  };

  const renderInput = (level: string, label: string, parentLevel?: string) => {
    const isLevelDisabled = Boolean(
      disabled || (parentLevel && !formik.values[parentLevel]),
    );

    if (levels.indexOf(level) > targetIndex) return null;

    return (
      <div className="space-y-2" key={level}>
        <Label
          htmlFor={level}
          className="text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider"
        >
          {label}
        </Label>
        <Input
          id={level}
          name={level}
          placeholder={`Enter ${label}`}
          value={formik.values[level] || ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLevelDisabled}
          className={`h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 focus:ring-[#00563B] ${formik.touched[level] && formik.errors[level] ? "border-red-500" : ""}`}
        />
        {formik.touched[level] && formik.errors[level] && (
          <p className="text-[10px] text-red-500 font-bold uppercase">
            {formik.errors[level] as string}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {renderSelect("state", "State")}
      {renderSelect("division", "Division", "state")}
      {renderSelect("district", "District", "division")}
      {renderSelect("parliament", "Parliament", "division")}
      {renderSelect("assembly", "Assembly", "parliament")}
      {renderSelect("block", "Block", "assembly")}
      {renderSelect("panchayat", "Panchayat", "block")}
      {renderInput("village", "Village", "panchayat")}
      {renderSelect("booth", "Booth", "block")}
    </div>
  );
};

export { HierarchySelector };
export type { HierarchySelectorProps };
