"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

interface GenericSamitiFormProps {
  title: string;
  apiEndpoint: string; // e.g., 'ganesh-samiti'
  initialData?: any;
  isEdit?: boolean;
}

const GenericSamitiForm = ({
  title,
  apiEndpoint,
  initialData,
  isEdit = false,
}: GenericSamitiFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uniqueId: "",
    year: "",
    acMpNo: "",
    block: "",
    sector: "",
    microSectorNo: "",
    microSectorName: "",
    boothName: "",
    boothNo: "",
    gramPanchayat: "",
    village: "",
    faliya: "",
    file: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        uniqueId: initialData.uniqueId || "",
        year: initialData.year || "",
        acMpNo: initialData.acMpNo || "",
        block: initialData.block || "",
        sector: initialData.sector || "",
        microSectorNo: initialData.microSectorNo || "",
        microSectorName: initialData.microSectorName || "",
        boothName: initialData.boothName || "",
        boothNo: initialData.boothNo || "",
        gramPanchayat: initialData.gramPanchayat || "",
        village: initialData.village || "",
        faliya: initialData.faliya || "",
        file: initialData.file || "",
      });
    } else {
      // Generate a random Unique ID if creating new (Simulation)
      // In real app, backend might handle this or we fetch next ID
      // setFormData(prev => ({...prev, uniqueId: `GEN/${Math.floor(Math.random() * 1000)}`}));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `/${apiEndpoint}${
        isEdit && initialData?._id ? `/${initialData._id}` : ""
      }`;
      const method = isEdit ? "put" : "post";

      await axios[method](url, { ...formData });

      toast.success(`${title} ${isEdit ? "updated" : "created"} successfully`);
      router.push(`/vidhasabha-samiti/${apiEndpoint}`);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} record`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title={`${isEdit ? "Edit" : "Add New"} ${title}`} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Unique ID (Auto/Readonly) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="uniqueId"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Unique ID
                  </Label>
                  <Input
                    id="uniqueId"
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleChange}
                    placeholder="Auto Generated or Enter ID"
                    required
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Will be auto-generated on save if left empty (Backend logic
                    required) or enter manually.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="year"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Year
                  </Label>
                  <Select
                    value={formData.year}
                    onValueChange={(val) => handleSelectChange("year", val)}
                  >
                    <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row: AC/MP No. & Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="acMpNo"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    AC/MP No.
                  </Label>
                  <Input
                    id="acMpNo"
                    name="acMpNo"
                    value={formData.acMpNo}
                    onChange={handleChange}
                    placeholder="Enter AC/MP No."
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="block"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.block}
                    onValueChange={(val) => handleSelectChange("block", val)}
                  >
                    <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Barwani">Barwani</SelectItem>
                      <SelectItem value="Pati">Pati</SelectItem>
                      {/* Add more blocks */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row: Sector & Micro Sector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="sector"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Sector
                  </Label>
                  <Input
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="Enter Sector"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="microSectorNo"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Micro Sector No
                  </Label>
                  <Input
                    id="microSectorNo"
                    name="microSectorNo"
                    value={formData.microSectorNo}
                    onChange={handleChange}
                    placeholder="Enter Micro Sector No"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="microSectorName"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Micro Sector Name
                  </Label>
                  <Input
                    id="microSectorName"
                    name="microSectorName"
                    value={formData.microSectorName}
                    onChange={handleChange}
                    placeholder="Enter Micro Sector Name"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Row: Booth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="boothName"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Booth Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.boothName}
                    onValueChange={(val) =>
                      handleSelectChange("boothName", val)
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Booth" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Ideally fetched from API */}
                      <SelectItem value="Booth 1">Booth 1</SelectItem>
                      <SelectItem value="Booth 2">Booth 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="boothNo"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Booth No
                  </Label>
                  <Input
                    id="boothNo"
                    name="boothNo"
                    value={formData.boothNo}
                    onChange={handleChange}
                    placeholder="Enter Booth No"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Row: Village Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="gramPanchayat"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Gram Panchayat
                  </Label>
                  <Input
                    id="gramPanchayat"
                    name="gramPanchayat"
                    value={formData.gramPanchayat}
                    onChange={handleChange}
                    placeholder="Enter Gram Panchayat"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="village"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Village
                  </Label>
                  <Select
                    value={formData.village}
                    onValueChange={(val) => handleSelectChange("village", val)}
                  >
                    <SelectTrigger className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Village A">Village A</SelectItem>
                      <SelectItem value="Village B">Village B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="faliya"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Faliya
                  </Label>
                  <Input
                    id="faliya"
                    name="faliya"
                    value={formData.faliya}
                    onChange={handleChange}
                    placeholder="Enter Faliya"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* File Upload Placeholder */}
              <div className="space-y-2">
                <Label
                  htmlFor="file"
                  className="text-gray-700 dark:text-gray-300"
                >
                  File Upload
                </Label>
                <Input
                  id="file"
                  type="text"
                  name="file" // Just text for now, real upload needs state handling
                  placeholder="No file chosen"
                  disabled
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  Choose File
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="rounded-lg border-gray-200 dark:border-gray-700 dark:bg-[#202123] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default GenericSamitiForm;
