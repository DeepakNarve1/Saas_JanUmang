"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Loader2 } from "lucide-react";
import { handleError } from "@app/utils/errorHandler";
import {
  useBlocks,
  useBooths,
  usePanchayats,
  useVillages,
} from "@app/hooks/useHierarchy";
import { IBlock } from "@app/types/block";
import { IBooth } from "@app/types/booth";
import { IPanchayat } from "@app/types/panchayat";
import { IVillage } from "@app/types/village";
import { AxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  genericSamitiSchema,
  genericSamitiInitialValues,
  IGenericSamitiFormValues,
} from "../samiti.schema";

interface GenericSamitiFormProps {
  title: string;
  apiEndpoint: string;
  initialValues?: IGenericSamitiFormValues;
  isEdit?: boolean;
  id?: string;
  isReadOnly?: boolean;
}

const GenericSamitiForm = ({
  title,
  apiEndpoint,
  initialValues = genericSamitiInitialValues,
  isEdit = false,
  id,
  isReadOnly = false,
}: GenericSamitiFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(
    (isEdit || isReadOnly) && !!id,
  );
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: blocks = [] } = useBlocks();

  const formik = useFormik<IGenericSamitiFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: genericSamitiSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const url = `/${apiEndpoint}${isEdit ? `/${id}` : ""}`;
        const method = isEdit ? "put" : "post";

        // Custom validation for boothName if booths are available
        if (booths.length > 0 && !values.boothName) {
          formik.setFieldError("boothName", "Booth Name is required");
          setLoading(false);
          return;
        }

        await axios[method](url, values);

        toast.success(
          `${title} ${isEdit ? "updated" : "created"} successfully`,
        );
        router.push(`/vidhasabha-samiti/${apiEndpoint}`);
      } catch (error: unknown) {
        handleError(error, `Failed to ${isEdit ? "update" : "create"} record`);
      } finally {
        setLoading(false);
      }
    },
  });

  // Query hooks depending on formik values
  // We need to cast block value because formik might hold an object in some edge cases (legacy),
  // but strictly it should be string ID. Logic below handles object/string.
  const blockId =
    typeof formik?.values?.block === "object"
      ? (formik.values.block as IBlock)?._id
      : formik?.values?.block;

  const { data: booths = [] } = useBooths(blockId || "");
  const { data: panchayats = [] } = usePanchayats(blockId || "");
  const { data: villages = [] } = useVillages(selectedPanchayatId || "");

  // Fetch Data for Edit or View
  useEffect(() => {
    if ((isEdit || isReadOnly) && id) {
      const fetchData = async () => {
        try {
          setPageLoading(true);
          const { data } = await axios.get(`/${apiEndpoint}/${id}`);
          if (data.success) {
            formik.setValues({
              uniqueId: data.data.uniqueId || "",
              year: data.data.year || "",
              acMpNo: data.data.acMpNo || "",
              block:
                (typeof data.data.block === "object"
                  ? data.data.block?._id
                  : data.data.block) || "",
              sector: data.data.sector || "",
              microSectorNo: data.data.microSectorNo || "",
              microSectorName: data.data.microSectorName || "",
              boothName: data.data.boothName || "",
              boothNo: data.data.boothNo || "",
              gramPanchayat: data.data.gramPanchayat || "",
              village: data.data.village || "",
              faliya: data.data.faliya || "",
              image: data.data.image || "",
              fileName: data.data.image ? "Existing Image" : "",
            });
          }
        } catch (error: unknown) {
          handleError(error, "Failed to load record details");
        } finally {
          setPageLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit, isReadOnly, apiEndpoint]);

  // Sync selectedPanchayatId
  useEffect(() => {
    if (formik.values.gramPanchayat && panchayats.length > 0) {
      const p = panchayats.find(
        (x: IPanchayat) => x.name === formik.values.gramPanchayat,
      );
      if (p) setSelectedPanchayatId(p._id);
    } else {
      setSelectedPanchayatId("");
    }
  }, [formik.values.gramPanchayat, panchayats]);

  const handleBoothChange = (boothId: string) => {
    const selectedBooth = booths.find((b: IBooth) => b._id === boothId);
    if (selectedBooth) {
      formik.setFieldValue("boothName", selectedBooth.name);
      formik.setFieldValue("boothNo", selectedBooth.code || selectedBooth.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("image", reader.result as string);
        formik.setFieldValue("fileName", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <ContentHeader
        title={`${isReadOnly ? "View" : isEdit ? "Edit" : "Add New"} ${title}`}
      />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="uniqueId"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Unique ID{" "}
                    {isEdit && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="uniqueId"
                    name="uniqueId"
                    value={formik.values.uniqueId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={
                      isEdit ? "Enter Unique ID" : "Auto-generated on save"
                    }
                    readOnly={isReadOnly || !isEdit}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly || !isEdit
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    } ${
                      formik.touched.uniqueId && formik.errors.uniqueId
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {!isEdit && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      System will automatically generate a unique ID.
                    </p>
                  )}
                  {formik.touched.uniqueId && formik.errors.uniqueId && (
                    <p className="text-sm text-red-500">
                      {formik.errors.uniqueId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="year"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.year}
                    onValueChange={(val) => formik.setFieldValue("year", val)}
                  >
                    <SelectTrigger
                      disabled={isReadOnly}
                      className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.year && formik.errors.year
                          ? "border-red-500"
                          : ""
                      } ${isReadOnly ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2020">2020</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                      <SelectItem value="2030">2030</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.year && formik.errors.year && (
                    <p className="text-sm text-red-500">{formik.errors.year}</p>
                  )}
                </div>
              </div>

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
                    value={formik.values.acMpNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly={isReadOnly}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
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
                    value={formik.values.block}
                    onValueChange={(val) => formik.setFieldValue("block", val)}
                  >
                    <SelectTrigger
                      disabled={isReadOnly}
                      className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.block && formik.errors.block
                          ? "border-red-500"
                          : ""
                      } ${isReadOnly ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block: IBlock) => (
                        <SelectItem key={block._id} value={block._id}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.block && formik.errors.block && (
                    <p className="text-sm text-red-500">
                      {formik.errors.block}
                    </p>
                  )}
                </div>
              </div>

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
                    value={formik.values.sector}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly={isReadOnly}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
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
                    value={formik.values.microSectorNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly={isReadOnly}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
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
                    value={formik.values.microSectorName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly={isReadOnly}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="boothName"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Booth Name{" "}
                    {booths.length > 0 && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Select
                    value={
                      booths.find(
                        (b: IBooth) => b.name === formik.values.boothName,
                      )?._id || ""
                    }
                    onValueChange={handleBoothChange}
                  >
                    <SelectTrigger
                      disabled={isReadOnly}
                      className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.boothName && formik.errors.boothName
                          ? "border-red-500"
                          : ""
                      } ${isReadOnly ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <SelectValue placeholder="Select Booth" />
                    </SelectTrigger>
                    <SelectContent>
                      {booths.length > 0 ? (
                        booths.map((booth: IBooth) => (
                          <SelectItem key={booth._id} value={booth._id}>
                            {booth.name} {booth.code ? `(${booth.code})` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-booths" disabled>
                          No Booths Found (Select Block First)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formik.touched.boothName && formik.errors.boothName && (
                    <p className="text-sm text-red-500">
                      {formik.errors.boothName}
                    </p>
                  )}
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
                    value={formik.values.boothNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Booth No"
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="gramPanchayat"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Gram Panchayat
                  </Label>
                  <Select
                    value={formik.values.gramPanchayat}
                    onValueChange={(val) =>
                      formik.setFieldValue("gramPanchayat", val)
                    }
                  >
                    <SelectTrigger
                      disabled={isReadOnly}
                      className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                    >
                      <SelectValue placeholder="Select Gram Panchayat" />
                    </SelectTrigger>
                    <SelectContent>
                      {panchayats.length > 0 ? (
                        panchayats.map((p: IPanchayat) => (
                          <SelectItem key={p._id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-panchayats" disabled>
                          No Panchayats Found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="village"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Village
                  </Label>
                  <Select
                    value={formik.values.village}
                    onValueChange={(val) =>
                      formik.setFieldValue("village", val)
                    }
                  >
                    <SelectTrigger
                      disabled={isReadOnly}
                      className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                    >
                      <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.length > 0 ? (
                        villages.map((v: IVillage) => (
                          <SelectItem key={v._id} value={v.name}>
                            {v.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-villages" disabled>
                          No Villages Found
                        </SelectItem>
                      )}
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
                    value={formik.values.faliya}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly={isReadOnly}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="file"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Image Upload
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="file"
                    type="text"
                    value={formik.values.fileName || ""}
                    placeholder="No file chosen"
                    readOnly
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300 ${
                      isReadOnly
                        ? "bg-gray-50 opacity-80 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isReadOnly}
                    className="w-fit dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {!isReadOnly && (
                  <>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all min-w-[120px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
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
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className={`rounded-lg border-gray-200 dark:border-gray-700 dark:bg-[#202123] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm ${
                    isReadOnly ? "w-full md:w-auto px-8" : ""
                  }`}
                >
                  {isReadOnly ? "Back" : "Cancel"}
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
