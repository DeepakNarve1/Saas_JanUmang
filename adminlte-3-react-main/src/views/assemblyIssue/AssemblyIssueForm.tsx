"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Loader2, Upload, FileImage } from "lucide-react";
import { API_BASE_URL } from "@app/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  assemblyIssueSchema,
  assemblyIssueInitialValues,
  IAssemblyIssueFormValues,
} from "./assemblyIssue.schema";
import { IDistrict } from "@app/types/district";
import { IAssembly } from "@app/types/assembly";
import { IBlock } from "@app/types/block";
import { IBooth } from "@app/types/booth";
import { IPanchayat } from "@app/types/panchayat";
import { IVillage } from "@app/types/village";
import { IDepartment } from "@app/types/department";
import { IWorkType } from "@app/types/workType";
import { ISubTypeOfWork } from "@app/types/subtypeOfWork";
import { handleError } from "@app/utils/errorHandler";

interface AssemblyIssueFormProps {
  initialValues?: IAssemblyIssueFormValues;
  onSubmit: (values: IAssemblyIssueFormValues) => void;
  loading?: boolean;
  basePath?: string;
}

interface FormFieldConfig {
  name: keyof IAssemblyIssueFormValues;
  label: string;
  type: "text" | "number" | "date" | "select" | "file" | "textarea" | "mobile";
  placeholder?: string;
  optionsSource?: string;
  required?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  fileNameField?: keyof IAssemblyIssueFormValues;
  accept?: string;
  useIdAsValue?: boolean;
  dependsOn?: keyof IAssemblyIssueFormValues;
  dependsOnLabel?: string;
}

const AssemblyIssueForm = ({
  initialValues = assemblyIssueInitialValues,
  onSubmit,
  loading = false,
  basePath = "/assembly-issue",
}: AssemblyIssueFormProps) => {
  const router = useRouter();
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const [booths, setBooths] = useState<IBooth[]>([]);
  const [panchayats, setPanchayats] = useState<IPanchayat[]>([]);
  const [villages, setVillages] = useState<IVillage[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [workTypes, setWorkTypes] = useState<IWorkType[]>([]);
  const [subWorkTypes, setSubWorkTypes] = useState<ISubTypeOfWork[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string>("");
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>("");
  const [fileUploading, setFileUploading] = useState<{
    [key: string]: boolean;
  }>({});

  const months = [
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
  ];

  const formik = useFormik<IAssemblyIssueFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: assemblyIssueSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Districts
      try {
        const districtsRes = await axios.get("/districts?limit=-1");
        if (districtsRes.data.success) {
          setDistricts(districtsRes.data.data);
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch districts");
      }

      // Fetch Departments
      try {
        const deptsRes = await axios.get("/departments?limit=-1");
        if (deptsRes.data.success || deptsRes.data.data) {
          setDepartments(deptsRes.data.data || []);
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch departments");
      }

      // Fetch Work Types
      try {
        const worksRes = await axios.get("/worktypes?limit=-1");
        if (worksRes.data.success || worksRes.data.data) {
          setWorkTypes(worksRes.data.data || []);
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch worktypes");
      }
    };
    fetchData();
  }, []);

  // Fetch Sub Work Types when Work Type changes
  useEffect(() => {
    const fetchSubWorkTypes = async () => {
      if (formik.values.typeOfWork) {
        try {
          const { data } = await axios.get(
            `/sub-type-of-work?limit=-1&typeOfWork=${formik.values.typeOfWork}`,
          );
          setSubWorkTypes(data.data || []);
        } catch (err: unknown) {
          handleError(err, "Failed to fetch sub-work-types");
          setSubWorkTypes([]);
        }
      } else {
        setSubWorkTypes([]);
      }
    };
    fetchSubWorkTypes();
  }, [formik.values.typeOfWork]);

  // Sync selectedDistrictId
  useEffect(() => {
    if (formik.values.district && districts.length > 0) {
      const d = districts.find((x) => x.name === formik.values.district);
      if (d) setSelectedDistrictId(d._id);
    } else {
      setSelectedDistrictId("");
      setAssemblies([]);
    }
  }, [formik.values.district, districts]);

  // Fetch Assemblies when District changes
  useEffect(() => {
    if (selectedDistrictId) {
      axios
        .get(`/assemblies?limit=-1&district=${selectedDistrictId}`)
        .then(({ data }) => setAssemblies(data.data || []))
        .catch((err: unknown) =>
          handleError(err, "Failed to fetch assemblies"),
        );
    } else {
      setAssemblies([]);
    }
  }, [selectedDistrictId]);

  // Sync selectedAssemblyId
  useEffect(() => {
    if (formik.values.assembly && assemblies.length > 0) {
      const a = assemblies.find((x) => x.name === formik.values.assembly);
      if (a) setSelectedAssemblyId(a._id);
    } else {
      setSelectedAssemblyId("");
      setBlocks([]);
    }
  }, [formik.values.assembly, assemblies]);

  // Fetch Blocks when Assembly changes
  useEffect(() => {
    if (selectedAssemblyId) {
      axios
        .get(`/blocks?limit=-1&assembly=${selectedAssemblyId}`)
        .then(({ data }) => setBlocks(data.data || []))
        .catch((err: unknown) => handleError(err, "Failed to fetch blocks"));
    } else {
      setBlocks([]);
    }
  }, [selectedAssemblyId]);

  // Fetch Booths & Panchayats when Block changes
  useEffect(() => {
    if (formik.values.block) {
      axios
        .get(`/booths?limit=-1&block=${formik.values.block}`)
        .then(({ data }) => setBooths(data.data || []))
        .catch((err: unknown) => handleError(err, "Failed to fetch booths"));

      axios
        .get(`/panchayat?limit=-1&block=${formik.values.block}`)
        .then(({ data }) => setPanchayats(data.data || []))
        .catch((err: unknown) =>
          handleError(err, "Failed to fetch panchayats"),
        );
    } else {
      setBooths([]);
      setPanchayats([]);
    }
  }, [formik.values.block]);

  // Sync selectedPanchayatId
  useEffect(() => {
    if (formik.values.panchayatName && panchayats.length > 0) {
      const p = panchayats.find((x) => x.name === formik.values.panchayatName);
      if (p) setSelectedPanchayatId(p._id);
    } else {
      setSelectedPanchayatId("");
    }
  }, [formik.values.panchayatName, panchayats]);

  // Fetch Villages when selectedPanchayatId changes
  useEffect(() => {
    if (selectedPanchayatId) {
      axios
        .get(`/villages?limit=-1&panchayat=${selectedPanchayatId}`)
        .then(({ data }) => setVillages(data.data || []))
        .catch((err: unknown) => handleError(err, "Failed to fetch villages"));
    } else {
      setVillages([]);
    }
  }, [selectedPanchayatId]);

  const handleBoothChange = (boothId: string) => {
    const selectedBooth = booths.find((b) => b._id === boothId);
    if (selectedBooth) {
      formik.setFieldValue("boothName", selectedBooth.name);
      // Using Name as No if Code not available or as per request 'Booth No'
      formik.setFieldValue("boothNo", selectedBooth.name);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    fileNameField: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setFileUploading((prev) => ({ ...prev, [fieldName]: true }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        formik.setFieldValue(fieldName, data.url);
        formik.setFieldValue(fileNameField, file.name);
        toast.success("File uploaded successfully");
      } catch (err: unknown) {
        handleError(err, "File upload failed");
        formik.setFieldValue(fieldName, "");
        formik.setFieldValue(fileNameField, "");
      } finally {
        setFileUploading((prev) => ({ ...prev, [fieldName]: false }));
      }
    }
  };

  const getOptions = (source?: string) => {
    switch (source) {
      case "months":
        return months.map((m) => ({ id: m, name: m, value: m }));
      case "districts":
        return districts.map((d) => ({
          id: d._id,
          name: d.name,
          value: d.name,
        }));
      case "assemblies":
        return assemblies.map((a) => ({
          id: a._id,
          name: a.name,
          value: a.name,
        }));
      case "blocks":
        return blocks.map((b) => ({ id: b._id, name: b.name, value: b._id }));
      case "booths":
        return booths.map((b) => ({ id: b._id, name: b.name, value: b._id }));
      case "panchayats":
        return panchayats.map((p) => ({
          id: p._id,
          name: p.name,
          value: p.name,
        }));
      case "villages":
        return villages.map((v) => ({
          id: v._id,
          name: v.name,
          value: v.name,
        }));
      case "departments":
        return departments.map((d) => ({
          id: d._id,
          name: d.name,
          value: d.name,
        }));
      case "workTypes":
        return workTypes.map((w) => ({
          id: w._id,
          name: w.name,
          value: w.name,
        }));
      case "subWorkTypes":
        return subWorkTypes.map((s) => ({
          id: s._id,
          name: s.subTypeOfWork,
          value: s.subTypeOfWork,
        }));
      case "statusOptions":
        return [
          { id: "Pending", name: "Pending", value: "Pending" },
          { id: "In Progress", name: "In Progress", value: "In Progress" },
          { id: "Resolved", name: "Resolved", value: "Resolved" },
          { id: "Rejected", name: "Rejected", value: "Rejected" },
          { id: "Approved", name: "Approved", value: "Approved" },
        ];
      default:
        return [];
    }
  };

  const FORM_FIELDS: FormFieldConfig[] = [
    { name: "sectorName", label: "Sector Name", type: "text" },
    { name: "microSectorNo", label: "Micro Sector No.", type: "text" },
    { name: "microSectorName", label: "Micro Sector Name", type: "text" },
    { name: "year", label: "Year", type: "text", required: true },
    {
      name: "month",
      label: "Month",
      type: "select",
      optionsSource: "months",
    },
    { name: "date", label: "Date", type: "date" },
    {
      name: "district",
      label: "District",
      type: "select",
      optionsSource: "districts",
    },
    {
      name: "assembly",
      label: "Assembly",
      type: "select",
      optionsSource: "assemblies",
      dependsOn: "district",
      dependsOnLabel: "District",
    },
    {
      name: "acMpNo",
      label: "AC/MP No.",
      type: "text",
    },
    {
      name: "block",
      label: "Block",
      type: "select",
      optionsSource: "blocks",
      required: true,
      useIdAsValue: true,
      dependsOn: "assembly",
      dependsOnLabel: "Assembly",
    },
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
      useIdAsValue: true,
      dependsOn: "block",
      dependsOnLabel: "Block",
    },
    { name: "boothNo", label: "Booth No.", type: "text", readOnly: true },
    {
      name: "panchayatName",
      label: "Panchayat Name",
      type: "select",
      optionsSource: "panchayats",
      required: true,
      dependsOn: "block",
      dependsOnLabel: "Block",
    },
    {
      name: "village",
      label: "Village",
      type: "select",
      optionsSource: "villages",
      required: true,
      dependsOn: "panchayatName",
      dependsOnLabel: "Panchayat",
    },
    { name: "majraFaliya", label: "Majra/Faliya", type: "text" },
    {
      name: "workProblem",
      label: "Work/Problem",
      type: "text",
      required: true,
    },
    { name: "office", label: "Office", type: "text" },
    { name: "approximateCost", label: "Approximate Cost", type: "number" },
    { name: "totalMembers", label: "Total Members", type: "number" },
    {
      name: "department",
      label: "Department",
      type: "select",
      optionsSource: "departments",
      required: true,
    },
    { name: "priority", label: "Priority", type: "text" },
    { name: "tsNoDate", label: "TS No/Date", type: "text" },
    { name: "asNoDate", label: "AS No/Date", type: "text" },
    {
      name: "typeOfWork",
      label: "Type of Work",
      type: "select",
      optionsSource: "workTypes",
    },
    {
      name: "subWorkType",
      label: "Sub Work Type",
      type: "select",
      optionsSource: "subWorkTypes",
      dependsOn: "typeOfWork",
      dependsOnLabel: "Type of Work",
    },
    { name: "middleMen", label: "Middle Man", type: "text" },
    { name: "middleManContact", label: "Middle Man Cont No.", type: "mobile" },
    { name: "beneficiaryName", label: "Beneficial (Name)", type: "text" },
    {
      name: "beneficiaryContact",
      label: "Beneficial Cont No.",
      type: "mobile",
    },
    { name: "po", label: "PO", type: "text" },
    { name: "accountDetails", label: "Account Details", type: "text" },
    { name: "adharCardNumber", label: "Adhar Card Number", type: "number" },
    { name: "ifscNumber", label: "IFSC Number", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      optionsSource: "statusOptions",
    },
    {
      name: "avedanFile",
      label: "Avedan",
      type: "file",
      fileNameField: "avedanFileName",
      fullWidth: true,
    },
    {
      name: "documentFile",
      label: "Upload Document (Set Of Complete Doc Pdf)",
      type: "file",
      fileNameField: "documentFileName",
      accept: "application/pdf",
      fullWidth: true,
    },
    {
      name: "remarkGoshana",
      label: "Remark/Goshana ( भईया द्वारा दिए गए निर्देश )",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "remarkTipUsd",
      label: "REMARK / TIP / USD",
      type: "textarea",
      fullWidth: true,
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="p-8 dark:bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FORM_FIELDS.filter((f) => !f.fullWidth).map((field) => {
          const isError =
            formik.touched[field.name] && formik.errors[field.name];
          const isDisabled = field.dependsOn && !formik.values[field.dependsOn];

          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === "select" ? (
                <div
                  onClick={() => {
                    if (isDisabled) {
                      toast.warning(
                        `Please select ${field.dependsOnLabel} first`,
                      );
                    }
                  }}
                  className={isDisabled ? "cursor-not-allowed" : ""}
                >
                  <div className={isDisabled ? "pointer-events-none" : ""}>
                    <Select
                      disabled={isDisabled}
                      value={
                        field.name === "boothName"
                          ? booths.find(
                              (b) => b.name === formik.values.boothName,
                            )?._id || ""
                          : field.useIdAsValue &&
                              typeof formik.values[field.name] !== "string"
                            ? (
                                formik.values[field.name] as unknown as {
                                  _id: string;
                                }
                              )?._id
                            : formik.values[field.name]?.toString() || ""
                      }
                      onValueChange={(val) => {
                        if (field.name === "district") {
                          formik.setFieldValue("district", val);
                          formik.setFieldValue("assembly", "");
                          formik.setFieldValue("block", "");
                          formik.setFieldValue("panchayatName", "");
                          formik.setFieldValue("village", "");
                          formik.setFieldValue("boothName", "");
                          formik.setFieldValue("boothNo", "");
                        } else if (field.name === "assembly") {
                          formik.setFieldValue("assembly", val);
                          formik.setFieldValue("block", "");
                          formik.setFieldValue("panchayatName", "");
                          formik.setFieldValue("village", "");
                          formik.setFieldValue("boothName", "");
                          formik.setFieldValue("boothNo", "");
                        } else if (field.name === "block") {
                          formik.setFieldValue("block", val);
                          formik.setFieldValue("panchayatName", "");
                          formik.setFieldValue("village", "");
                          formik.setFieldValue("boothName", "");
                          formik.setFieldValue("boothNo", "");
                        } else if (field.name === "panchayatName") {
                          formik.setFieldValue("panchayatName", val);
                          formik.setFieldValue("village", "");
                        } else if (field.name === "boothName") {
                          handleBoothChange(val);
                        } else if (field.name === "typeOfWork") {
                          formik.setFieldValue("typeOfWork", val);
                          formik.setFieldValue("subWorkType", "");
                        } else {
                          formik.setFieldValue(field.name, val);
                        }
                      }}
                    >
                      <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getOptions(field.optionsSource).map((opt) => (
                          <SelectItem key={opt.id} value={opt.value}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : field.type === "mobile" ? (
                <Input
                  id={field.name}
                  type="text"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  value={formik.values[field.name] as string}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      formik.setFieldValue(field.name, value);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  {...formik.getFieldProps(field.name)}
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  readOnly={field.readOnly}
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${field.readOnly ? "bg-gray-50 border-gray-100" : ""}`}
                />
              )}

              {isError && (
                <p className="text-sm text-red-500">
                  {formik.errors[field.name] as string}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Width Fields */}
      <div className="mt-8 space-y-6">
        {FORM_FIELDS.filter((f) => f.fullWidth).map((field) => {
          const isError =
            formik.touched[field.name] && formik.errors[field.name];

          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  value={String(formik.values[field.name] || "")}
                  onChange={formik.handleChange}
                />
              ) : field.type === "file" ? (
                <div className="flex gap-4 items-center flex-wrap">
                  <Input
                    className="max-w-md dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                    value={String(
                      (field.fileNameField &&
                        formik.values[field.fileNameField]) ||
                        "",
                    )}
                    placeholder="No file chosen"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={fileUploading[field.name as string]}
                    className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 flex items-center gap-2"
                    onClick={() =>
                      document
                        .getElementById(`${field.name}-file-input`)
                        ?.click()
                    }
                  >
                    {fileUploading[field.name as string] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Choose File
                  </Button>

                  {formik.values[field.name] &&
                    typeof formik.values[field.name] === "string" && (
                      <a
                        href={
                          (formik.values[field.name] as string).startsWith("/")
                            ? `${API_BASE_URL.replace("/api", "")}${formik.values[field.name]}`
                            : (formik.values[field.name] as string)
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2 ml-2"
                      >
                        <FileImage className="w-5 h-5" /> View Current
                      </a>
                    )}

                  <input
                    id={`${field.name}-file-input`}
                    type="file"
                    className="hidden"
                    accept={field.accept}
                    onChange={(e) =>
                      handleFileChange(e, field.name, field.fileNameField || "")
                    }
                  />
                </div>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  {...formik.getFieldProps(field.name)}
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
              )}

              {isError && (
                <p className="text-sm text-red-500">
                  {formik.errors[field.name] as string}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[140px] rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Issue"
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          type="button"
          onClick={() => router.push(basePath)}
          disabled={loading}
          className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
        >
          Cancel
        </Button>
        <Button
          size="lg"
          variant="ghost"
          type="button"
          onClick={() => formik.resetForm()}
          disabled={loading}
          className="dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-lg"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

export default AssemblyIssueForm;
