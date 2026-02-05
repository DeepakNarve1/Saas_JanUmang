"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  bhagoriaSamitiSchema,
  bhagoriaSamitiInitialValues,
  IBhagoriaSamitiFormValues,
} from "../samiti.schema";
import { useBlocks } from "@app/hooks/useHierarchy";

interface BhagoriaSamitiFormProps {
  initialValues?: IBhagoriaSamitiFormValues;
  isEdit?: boolean;
  id?: string;
}

const BhagoriaSamitiForm = ({
  initialValues = bhagoriaSamitiInitialValues,
  isEdit = false,
  id,
}: BhagoriaSamitiFormProps) => {
  const router = useRouter();
  const { data: blocks } = useBlocks();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit && !!id);

  const formik = useFormik<IBhagoriaSamitiFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: bhagoriaSamitiSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const url = `/bhagoria-samiti${isEdit ? `/${id}` : ""}`;
        const method = isEdit ? "put" : "post";

        await axios[method](url, values);

        toast.success(
          `Bhagoria Samiti record ${isEdit ? "updated" : "created"} successfully`,
        );
        router.push("/vidhasabha-samiti/bhagoria-samiti");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${isEdit ? "update" : "create"} record`,
        );
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          setPageLoading(true);
          const { data } = await axios.get(`/bhagoria-samiti/${id}`);
          if (data.success) {
            formik.setValues(data.data);
          }
        } catch (error) {
          toast.error("Failed to load record details");
        } finally {
          setPageLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit]);

  if (pageLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  }

  return (
    <>
      <ContentHeader
        title={`${isEdit ? "Edit" : "Enter"} Bhagoria Karyakram Samiti Details`}
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
                    Serial No (क्र. ){" "}
                    {isEdit && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="uniqueId"
                    name="uniqueId"
                    value={formik.values.uniqueId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={
                      isEdit ? "Enter Serial No" : "Auto-generated on save"
                    }
                    readOnly={!isEdit}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      !isEdit ? "bg-gray-50 opacity-80 cursor-not-allowed" : ""
                    } ${
                      formik.touched.uniqueId && formik.errors.uniqueId
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {!isEdit && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      System will automatically generate a Serial No.
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
                    htmlFor="block"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Block (ब्लॉक) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.block}
                    onValueChange={(val) => formik.setFieldValue("block", val)}
                  >
                    <SelectTrigger
                      className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.block && formik.errors.block
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks?.map((block: any) => (
                        <SelectItem key={block._id} value={block.name}>
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

                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Date (दिनांक) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.date && formik.errors.date
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.date && formik.errors.date && (
                    <p className="text-sm text-red-500">{formik.errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="day"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Day (वार) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.day}
                    onValueChange={(val) => formik.setFieldValue("day", val)}
                  >
                    <SelectTrigger
                      className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                        formik.touched.day && formik.errors.day
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday (सोमवार)</SelectItem>
                      <SelectItem value="Tuesday">Tuesday (मंगलवार)</SelectItem>
                      <SelectItem value="Wednesday">
                        Wednesday (बुधवार)
                      </SelectItem>
                      <SelectItem value="Thursday">
                        Thursday (गुरुवार)
                      </SelectItem>
                      <SelectItem value="Friday">Friday (शुक्रवार)</SelectItem>
                      <SelectItem value="Saturday">
                        Saturday (शनिवार)
                      </SelectItem>
                      <SelectItem value="Sunday">Sunday (रविवार)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.day && formik.errors.day && (
                    <p className="text-sm text-red-500">{formik.errors.day}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bhagoriaHat"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Bhagoria Hat (भगोरिया हाट){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bhagoriaHat"
                    name="bhagoriaHat"
                    value={formik.values.bhagoriaHat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Bhagoria Hat"
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.bhagoriaHat && formik.errors.bhagoriaHat
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.bhagoriaHat && formik.errors.bhagoriaHat && (
                    <p className="text-sm text-red-500">
                      {formik.errors.bhagoriaHat}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfDol"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Number of Dol (डोल की संख्या)
                  </Label>
                  <Input
                    id="numberOfDol"
                    name="numberOfDol"
                    value={formik.values.numberOfDol}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue("numberOfDol", value);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Number of Dol"
                    inputMode="numeric"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="inChargeName"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    In-charge Name (प्रभारी का नाम)
                  </Label>
                  <Input
                    id="inChargeName"
                    name="inChargeName"
                    value={formik.values.inChargeName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter In-charge Name"
                    className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="mobileNumber"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Mobile Number (मोबाइल नम्बर)
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formik.values.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        formik.setFieldValue("mobileNumber", value);
                        // Also trigger handleChange to update touched status if needed, or rely on blur
                      }
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Mobile Number"
                    inputMode="numeric"
                    maxLength={10}
                    className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                      formik.touched.mobileNumber && formik.errors.mobileNumber
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.mobileNumber &&
                    formik.errors.mobileNumber && (
                      <p className="text-sm text-red-500">
                        {formik.errors.mobileNumber}
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="remark"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Remark (रिमार्क)
                </Label>
                <Textarea
                  id="remark"
                  name="remark"
                  value={formik.values.remark}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Remark"
                  rows={4}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
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

export default BhagoriaSamitiForm;
