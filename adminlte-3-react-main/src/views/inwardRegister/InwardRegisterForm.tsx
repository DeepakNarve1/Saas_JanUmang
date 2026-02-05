"use client";

import { useFormik } from "formik";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import {
  inwardRegisterSchema,
  inwardRegisterInitialValues,
  IInwardRegisterFormValues,
} from "./inwardRegister.schema";

interface InwardRegisterFormProps {
  initialValues?: IInwardRegisterFormValues;
  onSubmit: (values: IInwardRegisterFormValues) => void;
  isLoading: boolean;
  isViewMode?: boolean;
}

const InwardRegisterForm = ({
  initialValues = inwardRegisterInitialValues,
  onSubmit,
  isLoading,
  isViewMode = false,
}: InwardRegisterFormProps) => {
  const formik = useFormik<IInwardRegisterFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: inwardRegisterSchema,
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
    <form onSubmit={formik.handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Issue No / वार्षिक पंजी क्रमांक{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="issueNo"
              placeholder="Enter issue number"
              value={formik.values.issueNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                formik.touched.issueNo && formik.errors.issueNo
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.issueNo && formik.errors.issueNo && (
              <p className="text-sm text-red-500">{formik.errors.issueNo}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Issue Date / दिनांक <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="issueDate"
              value={formatDateForInput(formik.values.issueDate)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                formik.touched.issueDate && formik.errors.issueDate
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.issueDate && formik.errors.issueDate && (
              <p className="text-sm text-red-500">{formik.errors.issueDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Letter Name / पत्र का नाम <span className="text-red-500">*</span>
            </label>
            <Input
              name="letterName"
              placeholder="Enter letter name"
              value={formik.values.letterName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                formik.touched.letterName && formik.errors.letterName
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.letterName && formik.errors.letterName && (
              <p className="text-sm text-red-500">{formik.errors.letterName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Letter Received Date / आपी का दिनांक{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="letterReceivedDate"
              value={formatDateForInput(formik.values.letterReceivedDate)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                formik.touched.letterReceivedDate &&
                formik.errors.letterReceivedDate
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.letterReceivedDate &&
              formik.errors.letterReceivedDate && (
                <p className="text-sm text-red-500">
                  {formik.errors.letterReceivedDate}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From whom Received / पत्र किसने और से आया{" "}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="fromWhomReceived"
              placeholder="Enter sender details"
              value={formik.values.fromWhomReceived}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className={`min-h-[100px] dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                formik.touched.fromWhomReceived &&
                formik.errors.fromWhomReceived
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.fromWhomReceived &&
              formik.errors.fromWhomReceived && (
                <p className="text-sm text-red-500">
                  {formik.errors.fromWhomReceived}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Letter Description / आए हुए पत्र का विवरण
            </label>
            <Textarea
              name="letterDescription"
              placeholder="Enter letter description"
              value={formik.values.letterDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="min-h-[100px] dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Subject / पत्र का विषय
            </label>
            <Textarea
              name="subject"
              placeholder="Enter subject"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              File No / फाइल क्रमांक
            </label>
            <Input
              name="fileNo"
              placeholder="Enter file number"
              value={formik.values.fileNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Received Letter Number / क्रमांक
              </label>
              <Input
                name="receivedLetterNumber"
                placeholder="Enter received letter number"
                value={formik.values.receivedLetterNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Received Letter Date / दिनांक
              </label>
              <Input
                type="date"
                name="receivedLetterDate"
                value={formatDateForInput(formik.values.receivedLetterDate)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Attachment / संलग्न
            </label>
            <Input
              name="attachment"
              placeholder="Enter attachment details"
              value={formik.values.attachment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reply To Number / उत्तर क्रमांक
              </label>
              <Input
                name="replyToNumber"
                placeholder="Enter reply number"
                value={formik.values.replyToNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reply To Date / दिनांक
              </label>
              <Input
                type="date"
                name="replyToDate"
                value={formatDateForInput(formik.values.replyToDate)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Our Reply Number / उत्तर क्रमांक
              </label>
              <Input
                name="ourReplyNumber"
                placeholder="Enter our reply number"
                value={formik.values.ourReplyNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Our Reply Date / दिनांक
              </label>
              <Input
                type="date"
                name="ourReplyDate"
                value={formatDateForInput(formik.values.ourReplyDate)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Forwarded Letter Number / क्रमांक
              </label>
              <Input
                name="forwardedLetterNumber"
                placeholder="Enter forwarded letter number"
                value={formik.values.forwardedLetterNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Forwarded Letter Date / दिनांक
              </label>
              <Input
                type="date"
                name="forwardedLetterDate"
                value={formatDateForInput(formik.values.forwardedLetterDate)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Section / शाखा या विभाग
            </label>
            <Input
              name="section"
              placeholder="Enter section"
              value={formik.values.section}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Signed Date / हस्त. दिनांक
            </label>
            <Input
              type="date"
              name="signedDate"
              value={formatDateForInput(formik.values.signedDate)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Sent To / जिसको पत्र भेजा गया
            </label>
            <Input
              name="sentTo"
              placeholder="Enter recipient name/department"
              value={formik.values.sentTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Remarks / टिप्पणी
            </label>
            <Textarea
              name="remarks"
              placeholder="Enter remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isViewMode}
              className="min-h-[100px] dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {!isViewMode && (
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="submit"
            className="bg-[#00563B] hover:bg-[#004d35] text-white min-w-[120px] rounded-lg shadow-lg shadow-[#00563B]/20 transition-all font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Entry"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-[120px] rounded-lg border-gray-200 dark:border-gray-700 dark:bg-[#202123] dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
            disabled={isLoading}
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
};

export default InwardRegisterForm;
