"use client";

import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Card, CardContent } from "@app/components/ui/card";
import { Textarea } from "@app/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  inDocsSchema,
  inDocsInitialValues,
  IInDocsFormValues,
} from "./inDocs.schema";

interface InDocsFormProps {
  initialValues?: IInDocsFormValues;
  onSubmit: (values: IInDocsFormValues) => void;
  loading?: boolean;
}

const InDocsForm = ({
  initialValues = inDocsInitialValues,
  onSubmit,
  loading = false,
}: InDocsFormProps) => {
  const formik = useFormik<IInDocsFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: inDocsSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="issueNo">
                Issue No (जावक क्रमांक) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issueNo"
                name="issueNo"
                placeholder="Issue Number"
                value={formik.values.issueNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.issueNo && formik.errors.issueNo
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.issueNo && formik.errors.issueNo && (
                <p className="text-sm text-red-500">{formik.errors.issueNo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date (तारीख) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formatDateForInput(formik.values.date)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.date && formik.errors.date
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.date && formik.errors.date && (
                <p className="text-sm text-red-500">{formik.errors.date}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nameAddress">
                Name & Address (नाम व पता){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="nameAddress"
                name="nameAddress"
                placeholder="Complete name and address"
                value={formik.values.nameAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.nameAddress && formik.errors.nameAddress
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.nameAddress && formik.errors.nameAddress && (
                <p className="text-sm text-red-500">
                  {formik.errors.nameAddress}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="place">Place (स्थान)</Label>
              <Input
                id="place"
                name="place"
                placeholder="Place"
                value={formik.values.place}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject (विषय) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Subject of document"
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.subject && formik.errors.subject
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formik.touched.subject && formik.errors.subject && (
                <p className="text-sm text-red-500">{formik.errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentsCount">Documents Count</Label>
              <Input
                id="documentsCount"
                name="documentsCount"
                placeholder="Number of documents"
                value={formik.values.documentsCount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceIssueNo">Reference Issue No</Label>
              <Input
                id="referenceIssueNo"
                name="referenceIssueNo"
                placeholder="Reference issue details"
                value={formik.values.referenceIssueNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedIssueNo">Received Issue No</Label>
              <Input
                id="receivedIssueNo"
                name="receivedIssueNo"
                placeholder="Received issue details"
                value={formik.values.receivedIssueNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileHeadNo">File Head & No (फाइल नंबर)</Label>
              <Input
                id="fileHeadNo"
                name="fileHeadNo"
                placeholder="File head and number"
                value={formik.values.fileHeadNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stampReceived">Stamp Received (₹/पैसे)</Label>
              <Input
                id="stampReceived"
                name="stampReceived"
                placeholder="Stamp amount in rupees"
                value={formik.values.stampReceived}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="remarks">Remarks (टिप्पणी)</Label>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Additional remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00563B] hover:bg-[#368F8B] min-w-[120px]"
              disabled={loading}
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InDocsForm;
