"use client";

import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { Label } from "@app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

interface HierarchySelectorProps {
  formik: any;
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
    villages: [],
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
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const { data } = await axios.get("/states?limit=-1");
      setLists((prev) => ({ ...prev, states: data.data || [] }));
    } catch (error) {
      console.error("Failed to fetch states", error);
    }
  };

  const fetchData = async (
    level: string,
    parentId: string,
    parentField: string,
  ) => {
    if (!parentId) {
      updateLists(level, []);
      return;
    }
    try {
      // Maps level to plural endpoint and plural list key
      const endpointMap: Record<string, string> = {
        division: "divisions",
        district: "districts",
        parliament: "parliaments",
        assembly: "assemblies",
        block: "blocks",
        panchayat: "panchayats",
        village: "villages",
        booth: "booths",
      };

      const plural = endpointMap[level];
      const { data } = await axios.get(
        `/${plural}?limit=-1&${parentField}=${parentId}`,
      );
      updateLists(plural, data.data || []);
    } catch (error) {
      console.error(`Failed to fetch ${level}`, error);
    }
  };

  const updateLists = (key: string, data: any[]) => {
    setLists((prev) => ({ ...prev, [key]: data }));
  };

  const handleValueChange = (level: string, value: string) => {
    formik.setFieldValue(level, value);

    // Reset all downstream levels
    const levelIndex = levels.indexOf(level);
    for (let i = levelIndex + 1; i < levels.length; i++) {
      formik.setFieldValue(levels[i], "");
      const listKey = levels[i] === "state" ? "states" : levels[i] + "s";
      if (listKey !== "states") updateLists(listKey, []);
    }

    // Fetch next level
    if (level === "state") fetchData("division", value, "state");
    else if (level === "division") {
      fetchData("district", value, "division");
      fetchData("parliament", value, "division");
    } else if (level === "district") {
      fetchData("assembly", value, "district");
    } else if (level === "parliament")
      fetchData("assembly", value, "parliament");
    else if (level === "assembly") fetchData("block", value, "assembly");
    else if (level === "block") {
      fetchData("panchayat", value, "block");
      fetchData("booth", value, "block");
    } else if (level === "panchayat") fetchData("village", value, "panchayat");
  };

  // Pre-fetch logic for existing values (edit mode)
  useEffect(() => {
    const init = async () => {
      if (formik.values.state)
        await fetchData("division", formik.values.state, "state");
      if (formik.values.division) {
        await fetchData("district", formik.values.division, "division");
        await fetchData("parliament", formik.values.division, "division");
      }
      if (formik.values.parliament)
        await fetchData("assembly", formik.values.parliament, "parliament");
      if (formik.values.assembly)
        await fetchData("block", formik.values.assembly, "assembly");
      if (formik.values.block) {
        await fetchData("panchayat", formik.values.block, "block");
        await fetchData("booth", formik.values.block, "block");
      }
      if (formik.values.panchayat)
        await fetchData("village", formik.values.panchayat, "panchayat");
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
            {options.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched[level] && formik.errors[level] && (
          <p className="text-[10px] text-red-500 font-bold uppercase">
            {formik.errors[level]}
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
      {renderSelect("village", "Village", "panchayat")}
      {renderSelect("booth", "Booth", "block")}
    </div>
  );
};

export { HierarchySelector };
export type { HierarchySelectorProps };
