"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import {
  publicProblemSchema,
  publicProblemInitialValues,
  IPublicProblemFormValues,
} from "./publicProblem.schema";
import { handleError } from "@app/utils/errorHandler";
import { API_BASE_URL } from "@app/utils/api";

import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";
import {
  Upload,
  FileImage,
  Loader2,
  Send,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

const CreateEntry = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_MP_PUBLIC_PROBLEMS]}>
      <CreateEntryContent />
    </RouteGuard>
  );
};

const CreateEntryContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Location Lists
  const [districtsList, setDistrictsList] = useState([]);
  const [assembliesList, setAssembliesList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [panchayatsList, setPanchayatsList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  const [boothsList, setBoothsList] = useState([]);

  // Other Lists
  const [departmentsList, setDepartmentsList] = useState([]);

  // Selection State for IDs (to fetch children)
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedPanchayatId, setSelectedPanchayatId] = useState("");

  const [fileName, setFileName] = useState("");

  const formik = useFormik({
    initialValues: publicProblemInitialValues,
    validationSchema: publicProblemSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.post("/public-problems", values);
        toast.success("Entry created successfully!");
        router.push("/mp-public-problem");
      } catch (error: unknown) {
        handleError(error, "Failed to create entry");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch Initial Data
  useEffect(() => {
    fetchDistricts();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!formik.values.district) {
      setSelectedDistrictId("");
      setAssembliesList([]);
      formik.setFieldValue("assembly", "");
      return;
    }
    const dist = districtsList.find(
      (d: any) => d.name === formik.values.district,
    );
    if (dist) setSelectedDistrictId((dist as any)._id);
    else {
      setSelectedDistrictId("");
      setAssembliesList([]);
      formik.setFieldValue("assembly", "");
    }
  }, [formik.values.district, districtsList]);

  useEffect(() => {
    if (selectedDistrictId) fetchAssemblies(selectedDistrictId);
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!formik.values.assembly) {
      setSelectedAssemblyId("");
      setBlocksList([]);
      formik.setFieldValue("block", "");
      return;
    }
    const asm = assembliesList.find(
      (a: any) => a.name === formik.values.assembly,
    );
    if (asm) setSelectedAssemblyId((asm as any)._id);
    else {
      setSelectedAssemblyId("");
      setBlocksList([]);
      formik.setFieldValue("block", "");
    }
  }, [formik.values.assembly, assembliesList]);

  useEffect(() => {
    if (selectedAssemblyId) fetchBlocks(selectedAssemblyId);
  }, [selectedAssemblyId]);

  useEffect(() => {
    if (!formik.values.block) {
      setSelectedBlockId("");
      setPanchayatsList([]);
      setBoothsList([]);
      formik.setFieldValue("panchayatName", "");
      formik.setFieldValue("boothName", "");
      formik.setFieldValue("boothNo", "");
      return;
    }
    const blk = blocksList.find((b: any) => b.name === formik.values.block);
    if (blk) setSelectedBlockId((blk as any)._id);
    else {
      setSelectedBlockId("");
      setPanchayatsList([]);
      setBoothsList([]);
      formik.setFieldValue("panchayatName", "");
      formik.setFieldValue("boothName", "");
      formik.setFieldValue("boothNo", "");
    }
  }, [formik.values.block, blocksList]);

  useEffect(() => {
    if (selectedBlockId) {
      fetchPanchayats(selectedBlockId);
      fetchBooths(selectedBlockId);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (!formik.values.panchayatName) {
      setSelectedPanchayatId("");
      setVillagesList([]);
      formik.setFieldValue("village", "");
      return;
    }
    const panch = panchayatsList.find(
      (p: any) => p.name === formik.values.panchayatName,
    );
    if (panch) setSelectedPanchayatId((panch as any)._id);
    else {
      setSelectedPanchayatId("");
      setVillagesList([]);
      formik.setFieldValue("village", "");
    }
  }, [formik.values.panchayatName, panchayatsList]);

  useEffect(() => {
    if (selectedPanchayatId) fetchVillages(selectedPanchayatId);
  }, [selectedPanchayatId]);

  // API Calls
  const fetchDistricts = async () => {
    try {
      const { data } = await axios.get(`/districts?limit=-1`);
      setDistrictsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch districts");
    }
  };
  const fetchAssemblies = async (dst: string) => {
    try {
      const { data } = await axios.get(`/assemblies?district=${dst}&limit=-1`);
      setAssembliesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch assemblies");
    }
  };
  const fetchBlocks = async (asm: string) => {
    try {
      const { data } = await axios.get(`/blocks?assembly=${asm}&limit=-1`);
      setBlocksList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch blocks");
    }
  };
  const fetchPanchayats = async (blk: string) => {
    try {
      const { data } = await axios.get(`/panchayat?block=${blk}&limit=-1`);
      setPanchayatsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch panchayats");
    }
  };
  const fetchVillages = async (pnch: string) => {
    try {
      const { data } = await axios.get(`/villages?panchayat=${pnch}&limit=-1`);
      setVillagesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch villages");
    }
  };
  const fetchBooths = async (blk: string) => {
    try {
      const { data } = await axios.get(`/booths?block=${blk}&limit=-1`);
      setBoothsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch booths");
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get("/departments?limit=-1");
      setDepartmentsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch departments");
    }
  };

  const [fileUploading, setFileUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB");
      return;
    }

    setFileName(file.name);
    setFileUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Store the URL — not base64
      formik.setFieldValue("avedan", data.url);
      toast.success("File uploaded successfully");
    } catch (error: unknown) {
      handleError(error, "File upload failed");
      formik.setFieldValue("avedan", "");
      setFileName("");
    } finally {
      setFileUploading(false);
    }
  };

  // --- Dynamic Configuration ---
  interface FormFieldConfig {
    name: string;
    label: string;
    type:
      | "text"
      | "date"
      | "select"
      | "textarea"
      | "file"
      | "number"
      | "mobile";
    placeholder?: string;
    optionsSource?: string;
    fullWidth?: boolean;
    required?: boolean;
  }

  const FORM_FIELDS: FormFieldConfig[] = [
    {
      name: "year",
      label: "Year *",
      type: "number",
      placeholder: "Year",
      required: true,
    },
    {
      name: "month",
      label: "Month *",
      type: "select",
      optionsSource: "months",
      required: true,
    },
    { name: "dateString", label: "Date *", type: "date", required: true },

    // Location Hierarchy (Starting from District)
    {
      name: "district",
      label: "District *",
      type: "select",
      optionsSource: "districts",
      required: true,
    },
    {
      name: "assembly",
      label: "Assembly",
      type: "select",
      optionsSource: "assemblies",
    },
    { name: "block", label: "Block", type: "select", optionsSource: "blocks" },
    {
      name: "panchayatName",
      label: "Panchayat Name",
      type: "select",
      optionsSource: "panchayats",
    },
    {
      name: "village",
      label: "Village",
      type: "select",
      optionsSource: "villages",
    },

    // Details
    {
      name: "recommendedLetterNo",
      label: "Recommended Letter No",
      type: "text",
    },
    {
      name: "boothName",
      label: "Booth Name",
      type: "select",
      optionsSource: "booths",
    },
    { name: "boothNo", label: "Booth No.", type: "text" },

    { name: "majraFaliya", label: "Majra/Faliya", type: "text" },

    { name: "workProblem", label: "Work/Problem", type: "text" },
    { name: "office", label: "Office", type: "text" },
    { name: "approximateCost", label: "Approximate Cost", type: "number" },

    {
      name: "department",
      label: "Department",
      type: "select",
      optionsSource: "departments",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      optionsSource: "statuses",
    },
    { name: "priority", label: "Priority", type: "text" },
    { name: "typeOfWork", label: "Type of Work", type: "text" },

    { name: "middleMen", label: "Middle Men", type: "text" },
    {
      name: "middleMenContactNo",
      label: "Middle Man Cont No.",
      type: "mobile",
    },
    { name: "beneficialName", label: "Beneficial(Name)", type: "text" },
    {
      name: "beneficialMobile",
      label: "Beneficial Cont No.",
      type: "mobile",
    },

    // Full Width
    { name: "avedan", label: "Avedan", type: "file", fullWidth: true },
    {
      name: "remarkGoshana",
      label: "Remark/Goshana (भईया द्वारा दिए गए निर्देश)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "remarkTipUsd",
      label: "Remark/Tip/USD",
      type: "textarea",
      fullWidth: true,
    },
  ];

  const getOptions = (source?: string) => {
    switch (source) {
      case "months":
        return [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((m) => ({ label: m, value: m, id: m }));
      case "districts":
        return districtsList.map((d: any) => ({
          label: d.name,
          value: d.name,
          id: d._id,
        }));
      case "assemblies":
        return assembliesList.map((a: any) => ({
          label: a.name,
          value: a.name,
          id: a._id,
        }));
      case "blocks":
        return blocksList.map((b: any) => ({
          label: b.name,
          value: b.name,
          id: b._id,
        }));
      case "panchayats":
        return panchayatsList.map((p: any) => ({
          label: p.name,
          value: p.name,
          id: p._id,
        }));
      case "villages":
        return villagesList.map((v: any) => ({
          label: v.name,
          value: v.name,
          id: v._id,
        }));
      case "booths":
        return boothsList.map((b: any) => ({
          label: `${b.name} (${b.code})`,
          value: b.name,
          id: b._id,
        }));
      case "departments":
        return departmentsList.map((d: any) => ({
          label: d.name,
          value: d.name,
          id: d._id,
        }));
      case "statuses":
        return [
          { label: "Pending", value: "Pending", id: "pending" },
          { label: "In Progress", value: "In Progress", id: "in-progress" },
          { label: "Resolved", value: "Resolved", id: "resolved" },
          { label: "Rejected", value: "Rejected", id: "rejected" },
        ];
      default:
        return [];
    }
  };

  const getFieldValue = (field: FormFieldConfig) => {
    return (formik.values as any)[field.name];
  };

  const handleFieldChange = (field: FormFieldConfig, value: any) => {
    formik.setFieldValue(field.name, value);
    if (field.name === "boothName") {
      const selectedBooth: any = boothsList.find((b: any) => b.name === value);
      if (selectedBooth) {
        formik.setFieldValue("boothNo", selectedBooth.code || "");
      }
    }
  };

  return (
    <>
      <ContentHeader title="Create Public Problem Entry" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-7xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-[#00563B] dark:text-[#368F8B]" />
                Enter Jansunwai Details
              </h2>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FORM_FIELDS.filter((f) => !f.fullWidth).map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                      {field.label}
                    </Label>
                    {field.type === "select" ? (
                      <Select
                        value={getFieldValue(field)}
                        onValueChange={(v) => handleFieldChange(field, v)}
                        disabled={
                          (field.name === "assembly" && !selectedDistrictId) ||
                          (field.name === "block" && !selectedAssemblyId) ||
                          (field.name === "panchayatName" &&
                            !selectedBlockId) ||
                          (field.name === "boothName" && !selectedBlockId) ||
                          (field.name === "village" && !selectedPanchayatId)
                        }
                      >
                        <SelectTrigger
                          className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                            (formik.touched as any)[field.name] &&
                            (formik.errors as any)[field.name]
                              ? "border-red-500 ring-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={`Select ${field.label.replace("*", "").trim()}`}
                          />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#1e1e2d] dark:border-gray-700">
                          {getOptions(field.optionsSource).map((opt) => (
                            <SelectItem
                              key={opt.id}
                              value={opt.value}
                              className="dark:focus:bg-gray-800 dark:focus:text-white"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        name={field.name}
                        value={getFieldValue(field)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                          (formik.touched as any)[field.name] &&
                          (formik.errors as any)[field.name]
                            ? "border-red-500 ring-red-500"
                            : ""
                        }`}
                      />
                    ) : field.type === "mobile" ? (
                      <Input
                        name={field.name}
                        type="text"
                        maxLength={10}
                        inputMode="numeric"
                        value={getFieldValue(field)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            formik.setFieldValue(field.name, value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                          (formik.touched as any)[field.name] &&
                          (formik.errors as any)[field.name]
                            ? "border-red-500 ring-red-500"
                            : ""
                        }`}
                        placeholder={
                          field.placeholder ||
                          field.label.replace("*", "").trim()
                        }
                      />
                    ) : field.type === "number" ? (
                      <Input
                        name={field.name}
                        type="text"
                        inputMode="numeric"
                        value={getFieldValue(field)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          formik.setFieldValue(field.name, value);
                        }}
                        onBlur={formik.handleBlur}
                        className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                          (formik.touched as any)[field.name] &&
                          (formik.errors as any)[field.name]
                            ? "border-red-500 ring-red-500"
                            : ""
                        }`}
                        placeholder={
                          field.placeholder ||
                          field.label.replace("*", "").trim()
                        }
                      />
                    ) : (
                      <Input
                        name={field.name}
                        type={field.type}
                        value={getFieldValue(field)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                          (formik.touched as any)[field.name] &&
                          (formik.errors as any)[field.name]
                            ? "border-red-500 ring-red-500"
                            : ""
                        }`}
                        placeholder={
                          field.placeholder ||
                          field.label.replace("*", "").trim()
                        }
                      />
                    )}
                    {(formik.touched as any)[field.name] &&
                      (formik.errors as any)[field.name] && (
                        <p className="text-red-500 text-xs mt-1 font-medium italic">
                          {(formik.errors as any)[field.name]}
                        </p>
                      )}
                  </div>
                ))}
              </div>

              {/* Full Width Fields */}
              <div className="mt-6 space-y-4">
                {FORM_FIELDS.filter((f) => f.fullWidth).map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                      {field.label}
                    </Label>
                    {field.type === "file" ? (
                      <div className="flex gap-4 items-center">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={fileUploading}
                          onClick={() =>
                            document
                              .getElementById(`${field.name}-upload`)
                              ?.click()
                          }
                          className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          {fileUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {(formik.values as any)[field.name]
                            ? "Change File"
                            : "Choose File"}
                        </Button>
                        <span className="text-gray-500 dark:text-gray-400">
                          {fileName || "No file chosen"}
                        </span>
                        {(formik.values as any)[field.name] && (
                          <a
                            href={
                              (formik.values as any)[field.name].startsWith("/")
                                ? `${API_BASE_URL.replace("/api", "")}${(formik.values as any)[field.name]}`
                                : (formik.values as any)[field.name]
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline text-sm ml-2 flex items-center gap-1"
                          >
                            <FileImage className="w-4 h-4" /> View Uploaded
                          </a>
                        )}
                        <input
                          id={`${field.name}-upload`}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        className={`flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                          (formik.touched as any)[field.name] &&
                          (formik.errors as any)[field.name]
                            ? "border-red-500 ring-red-500"
                            : ""
                        }`}
                        value={getFieldValue(field)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    ) : null}
                    {(formik.touched as any)[field.name] &&
                      (formik.errors as any)[field.name] && (
                        <p className="text-red-500 text-xs mt-1 font-medium italic">
                          {(formik.errors as any)[field.name]}
                        </p>
                      )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#004d35] text-white shadow-lg shadow-[#00563B]/20 transition-all flex items-center gap-2 rounded-lg font-bold px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Entry
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    formik.resetForm();
                    setSelectedDistrictId("");
                    setSelectedAssemblyId("");
                    setSelectedBlockId("");
                    setSelectedPanchayatId("");
                    setAssembliesList([]);
                    setBlocksList([]);
                    setPanchayatsList([]);
                    setVillagesList([]);
                    setFileName("");
                  }}
                  disabled={loading}
                  className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all flex items-center gap-2 rounded-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  type="button"
                  onClick={() => router.push("/mp-public-problem")}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to List
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateEntry;
