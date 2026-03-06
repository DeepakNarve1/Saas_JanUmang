"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import {
  publicProblemSchema,
  publicProblemInitialValues,
  IPublicProblemFormValues,
} from "./publicProblem.schema";
import { handleError } from "@app/utils/errorHandler";

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
import { API_BASE_URL } from "@app/utils/api";
import { Loader2, Upload, FileImage } from "lucide-react";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

const EditEntry = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_MP_PUBLIC_PROBLEMS]}>
      <EditEntryContent />
    </RouteGuard>
  );
};

const EditEntryContent = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState("");
  const [blocksList, setBlocksList] = useState([]);
  const [panchayatsList, setPanchayatsList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  const [boothsList, setBoothsList] = useState([]); // Add boothsList
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedPanchayatId, setSelectedPanchayatId] = useState("");

  const [departmentsList, setDepartmentsList] = useState([]);
  const [assembliesList, setAssembliesList] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  const formik = useFormik({
    initialValues: publicProblemInitialValues,
    validationSchema: publicProblemSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.put(`/public-problems/${id}`, values);
        toast.success("Entry updated successfully!");
        router.push("/mp-public-problem");
      } catch (error: unknown) {
        handleError(error, "Failed to update entry");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    fetchDistricts();
    fetchDepartments();
  }, []);

  // Fetch Entry Data
  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const res = await axios.get(`/public-problems/${id}`);
        const data = res.data?.data;
        if (data) {
          formik.setValues({
            ...publicProblemInitialValues,
            ...data,
            district: data.district || "",
            assembly: data.assembly || "",
            block: data.block || "",
            panchayatName: data.panchayatName || "",
            village: data.village || "",
            boothName: data.boothName || "",
            boothNo: data.boothNo || "",
            department: data.department || "",
            status: data.status || "Pending",
          });

          if (data.related) {
            if (data.related.districtId)
              setSelectedDistrictId(data.related.districtId);
            if (data.related.assemblyId)
              setSelectedAssemblyId(data.related.assemblyId);
            if (data.related.blockId) setSelectedBlockId(data.related.blockId);
            if (data.related.panchayatId)
              setSelectedPanchayatId(data.related.panchayatId);
          }

          if (
            data.avedan &&
            typeof data.avedan === "string" &&
            data.avedan.startsWith("data:")
          ) {
            setFileName("Attached file");
          } else if (
            data.avedan &&
            typeof data.avedan === "string" &&
            (data.avedan.startsWith("http") || data.avedan.startsWith("/"))
          ) {
            const urlParts = data.avedan.split("/");
            setFileName(urlParts[urlParts.length - 1]);
          }
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch entry details");
        router.push("/mp-public-problem");
      } finally {
        setFetching(false);
      }
    };
    fetchEntry();
  }, [id]);

  // Synchronize IDs based on Names
  useEffect(() => {
    if (
      formik.values.district &&
      districtsList.length > 0 &&
      !selectedDistrictId
    ) {
      const d: any = districtsList.find(
        (x: any) => x.name === formik.values.district,
      );
      if (d) setSelectedDistrictId(d._id);
    }
  }, [formik.values.district, districtsList, selectedDistrictId]);

  useEffect(() => {
    if (
      formik.values.assembly &&
      assembliesList.length > 0 &&
      !selectedAssemblyId
    ) {
      const a: any = assembliesList.find(
        (x: any) => x.name === formik.values.assembly,
      );
      if (a) setSelectedAssemblyId(a._id);
    }
  }, [formik.values.assembly, assembliesList, selectedAssemblyId]);

  useEffect(() => {
    if (formik.values.block && blocksList.length > 0 && !selectedBlockId) {
      const b: any = blocksList.find(
        (x: any) => x.name === formik.values.block,
      );
      if (b) setSelectedBlockId(b._id);
    }
  }, [formik.values.block, blocksList, selectedBlockId]);

  useEffect(() => {
    if (
      formik.values.panchayatName &&
      panchayatsList.length > 0 &&
      !selectedPanchayatId
    ) {
      const p: any = panchayatsList.find(
        (x: any) => x.name === formik.values.panchayatName,
      );
      if (p) setSelectedPanchayatId(p._id);
    }
  }, [formik.values.panchayatName, panchayatsList, selectedPanchayatId]);

  // Cascading Fetches
  useEffect(() => {
    if (selectedDistrictId) fetchAssemblies(selectedDistrictId);
    else {
      setAssembliesList([]);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (selectedAssemblyId) fetchBlocks(selectedAssemblyId);
    else {
      setBlocksList([]);
    }
  }, [selectedAssemblyId]);

  useEffect(() => {
    if (selectedBlockId) {
      fetchPanchayats(selectedBlockId);
      fetchBooths(selectedBlockId); // Fetch booths
    } else {
      setPanchayatsList([]);
      setBoothsList([]);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (selectedPanchayatId) fetchVillages(selectedPanchayatId);
    else {
      setVillagesList([]);
    }
  }, [selectedPanchayatId]);

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
    // fetchBooths implementation
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

  if (fetching) {
    return (
      <div className="p-10 text-center dark:text-gray-300">Loading...</div>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Public Problem Entry" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-7xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Update Jansunwai Details
              </h2>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Year *
                  </Label>
                  <Input
                    name="year"
                    inputMode="numeric"
                    value={formik.values.year}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        formik.setFieldValue("year", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.year && formik.errors.year
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                    placeholder="Year"
                  />
                  {formik.touched.year && formik.errors.year && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.year}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Month *
                  </Label>
                  <Select
                    value={formik.values.month}
                    onValueChange={(v) => formik.setFieldValue("month", v)}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.month && formik.errors.month
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {[
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
                      ].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.month && formik.errors.month && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.month}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Date *
                  </Label>
                  <Input
                    type="date"
                    name="dateString"
                    value={formik.values.dateString}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.dateString && formik.errors.dateString
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.dateString && formik.errors.dateString && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.dateString}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    District *
                  </Label>
                  <Select
                    value={formik.values.district}
                    onValueChange={(v) => {
                      formik.setFieldValue("district", v);
                      const d: any = districtsList.find(
                        (x: any) => x.name === v,
                      );
                      if (d) setSelectedDistrictId(d._id);
                      else setSelectedDistrictId("");

                      // Reset children
                      formik.setFieldValue("assembly", "");
                      formik.setFieldValue("block", "");
                      setSelectedAssemblyId("");
                    }}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.district && formik.errors.district
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {districtsList.map((d: any) => (
                        <SelectItem key={d._id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.district && formik.errors.district && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.district}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Assembly
                  </Label>
                  <Select
                    value={formik.values.assembly}
                    onValueChange={(v) => {
                      formik.setFieldValue("assembly", v);
                      const a: any = assembliesList.find(
                        (x: any) => x.name === v,
                      );
                      if (a) setSelectedAssemblyId(a._id);
                      else setSelectedAssemblyId("");

                      // Reset child
                      formik.setFieldValue("block", "");
                    }}
                    disabled={
                      !selectedDistrictId && assembliesList.length === 0
                    }
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.assembly && formik.errors.assembly
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Assembly" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {assembliesList.map((a: any) => (
                        <SelectItem key={a._id} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.assembly && formik.errors.assembly && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.assembly}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Block
                  </Label>
                  <Select
                    value={formik.values.block}
                    onValueChange={(v) => {
                      formik.setFieldValue("block", v);
                      const b: any = blocksList.find((x: any) => x.name === v);
                      if (b) setSelectedBlockId(b._id);
                      else setSelectedBlockId("");

                      // Reset Child
                      formik.setFieldValue("panchayatName", "");
                      formik.setFieldValue("village", "");
                      setSelectedPanchayatId("");
                    }}
                    disabled={!selectedAssemblyId && blocksList.length === 0}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.block && formik.errors.block
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Block" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {blocksList.map((b: any) => (
                        <SelectItem key={b._id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.block && formik.errors.block && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.block}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Panchayat Name
                  </Label>
                  <Select
                    value={formik.values.panchayatName}
                    onValueChange={(v) => {
                      formik.setFieldValue("panchayatName", v);
                      const p: any = panchayatsList.find(
                        (x: any) => x.name === v,
                      );
                      if (p) setSelectedPanchayatId(p._id);
                      else setSelectedPanchayatId("");

                      // Reset Child
                      formik.setFieldValue("village", "");
                    }}
                    disabled={!selectedBlockId && panchayatsList.length === 0}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.panchayatName &&
                        formik.errors.panchayatName
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Panchayat" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {panchayatsList.map((p: any) => (
                        <SelectItem key={p._id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.panchayatName &&
                    formik.errors.panchayatName && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.panchayatName}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Village
                  </Label>
                  <Select
                    value={formik.values.village}
                    onValueChange={(v) => formik.setFieldValue("village", v)}
                    disabled={!selectedPanchayatId && villagesList.length === 0}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.village && formik.errors.village
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {villagesList.map((v: any) => (
                        <SelectItem key={v._id} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.village && formik.errors.village && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.village}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Recommended Letter No
                  </Label>
                  <Input
                    name="recommendedLetterNo"
                    type="number"
                    value={formik.values.recommendedLetterNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.recommendedLetterNo &&
                      formik.errors.recommendedLetterNo
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.recommendedLetterNo &&
                    formik.errors.recommendedLetterNo && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.recommendedLetterNo}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Booth Name
                  </Label>
                  <Select
                    value={formik.values.boothName}
                    onValueChange={(v) => {
                      formik.setFieldValue("boothName", v);
                      const b: any = boothsList.find((x: any) => x.name === v);
                      if (b) {
                        formik.setFieldValue("boothNo", b.code || "");
                      }
                    }}
                    disabled={!selectedBlockId && boothsList.length === 0}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.boothName && formik.errors.boothName
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Booth" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {boothsList.map((b: any) => (
                        <SelectItem key={b._id} value={b.name}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.boothName && formik.errors.boothName && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.boothName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Booth No.
                  </Label>
                  <Input
                    name="boothNo"
                    value={formik.values.boothNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.boothNo && formik.errors.boothNo
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.boothNo && formik.errors.boothNo && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.boothNo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Majra/Faliya
                  </Label>
                  <Input
                    name="majraFaliya"
                    value={formik.values.majraFaliya}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.majraFaliya && formik.errors.majraFaliya
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.majraFaliya && formik.errors.majraFaliya && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.majraFaliya}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Work/Problem
                  </Label>
                  <Input
                    name="workProblem"
                    value={formik.values.workProblem}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.workProblem && formik.errors.workProblem
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.workProblem && formik.errors.workProblem && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.workProblem}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Office
                  </Label>
                  <Input
                    name="office"
                    value={formik.values.office}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.office && formik.errors.office
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.office && formik.errors.office && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.office}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Approximate Cost
                  </Label>
                  <Input
                    name="approximateCost"
                    type="text"
                    inputMode="numeric"
                    value={formik.values.approximateCost}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue("approximateCost", value);
                    }}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.approximateCost &&
                      formik.errors.approximateCost
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.approximateCost &&
                    formik.errors.approximateCost && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.approximateCost}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Department
                  </Label>
                  <Select
                    value={formik.values.department}
                    onValueChange={(v) => formik.setFieldValue("department", v)}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.department && formik.errors.department
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      {departmentsList.map((dept: any) => (
                        <SelectItem key={dept._id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.department && formik.errors.department && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.department}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Priority
                  </Label>
                  <Input
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.priority && formik.errors.priority
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.priority && formik.errors.priority && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.priority}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Type of Work
                  </Label>
                  <Input
                    name="typeOfWork"
                    value={formik.values.typeOfWork}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.typeOfWork && formik.errors.typeOfWork
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.typeOfWork && formik.errors.typeOfWork && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.typeOfWork}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Middle Men
                  </Label>
                  <Input
                    name="middleMen"
                    value={formik.values.middleMen}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.middleMen && formik.errors.middleMen
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.middleMen && formik.errors.middleMen && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.middleMen}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Status
                  </Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(v) => formik.setFieldValue("status", v)}
                  >
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.status && formik.errors.status
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.status}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Middle Man Cont No.
                  </Label>
                  <Input
                    name="middleMenContactNo"
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    value={formik.values.middleMenContactNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        formik.setFieldValue("middleMenContactNo", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.middleMenContactNo &&
                      formik.errors.middleMenContactNo
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.middleMenContactNo &&
                    formik.errors.middleMenContactNo && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.middleMenContactNo}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Beneficial(Name)
                  </Label>
                  <Input
                    name="beneficialName"
                    value={formik.values.beneficialName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.beneficialName &&
                      formik.errors.beneficialName
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.beneficialName &&
                    formik.errors.beneficialName && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.beneficialName}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Beneficial Cont No.
                  </Label>
                  <Input
                    name="beneficialMobile"
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    value={formik.values.beneficialMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        formik.setFieldValue("beneficialMobile", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.beneficialMobile &&
                      formik.errors.beneficialMobile
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.beneficialMobile &&
                    formik.errors.beneficialMobile && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.beneficialMobile}
                      </p>
                    )}
                </div>
              </div>

              {/* Full width inputs */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Avedan
                  </Label>
                  <div className="flex gap-4 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={fileUploading}
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      {fileUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {formik.values.avedan ? "Change File" : "Choose File"}
                    </Button>
                    <span className="text-gray-500 dark:text-gray-400">
                      {fileName ||
                        (formik.values.avedan
                          ? "File attached"
                          : "No file chosen")}
                    </span>
                    {formik.values.avedan && (
                      <a
                        href={
                          formik.values.avedan.startsWith("/")
                            ? `${API_BASE_URL.replace("/api", "")}${formik.values.avedan}`
                            : formik.values.avedan
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline text-sm ml-2 flex items-center gap-1 hover:text-blue-700"
                      >
                        <FileImage className="w-4 h-4" />
                        View Current
                      </a>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {formik.touched.avedan && formik.errors.avedan && (
                    <p className="text-red-500 text-xs mt-1 font-medium italic">
                      {formik.errors.avedan}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Remark/Goshana (भईया द्वारा दिए गए निर्देश)
                  </Label>
                  <textarea
                    name="remarkGoshana"
                    className={`flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.remarkGoshana &&
                      formik.errors.remarkGoshana
                        ? "border-red-500"
                        : ""
                    }`}
                    value={formik.values.remarkGoshana}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.remarkGoshana &&
                    formik.errors.remarkGoshana && (
                      <p className="text-red-500 text-xs mt-1 font-medium italic">
                        {formik.errors.remarkGoshana}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Remark/Tip/USD
                  </Label>
                  <textarea
                    name="remarkTipUsd"
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.remarkTipUsd}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B] text-white shadow-lg transition-all"
                >
                  {loading ? "Updating..." : "Update Entry"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/mp-public-problem")}
                  disabled={loading}
                  className="rounded-lg border-gray-200 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-[#202123] dark:text-gray-300 dark:hover:bg-gray-800 transition-all shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => formik.resetForm()}
                  disabled={loading}
                  className="rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditEntry;
