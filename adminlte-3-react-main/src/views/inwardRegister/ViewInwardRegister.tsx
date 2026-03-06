"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Edit,
  ArrowLeft,
  FileText,
  Calendar,
  User,
  File,
  CornerDownRight,
  Send,
  Link,
  Info,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { PERMISSIONS } from "@app/config/permissions";

const ViewInwardRegister = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/inward-register/${id}`);
        setData(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load Inward Register data");
        router.push("/inward-register");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Inward Register Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    className = "",
  }: {
    icon: any;
    label: string;
    value: string | undefined | null;
    className?: string;
  }) => (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">
          {label}
        </label>
        <p className="text-gray-700 font-medium mt-1">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      "Issue No": data.issueNo,
      "Issue Date": formatDate(data.issueDate),
      "Letter Name": data.letterName,
      "Received Date": formatDate(data.letterReceivedDate),
      From: data.fromWhomReceived || "",
      Description: data.letterDescription || "",
      Subject: data.subject || "",
      "Received Letter No": data.receivedLetterNumber || "",
      "Received Letter Date": formatDate(data.receivedLetterDate) || "",
      "File No": data.fileNo || "",
      Section: data.section || "",
      "Sent To": data.sentTo || "",
      Remarks: data.remarks || "",
    };
  };

  return (
    <>
      <ContentHeader title="Inward Register Details (आवक पंजी)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00563B]" />
                  {data?.letterName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Issue No: {data?.issueNo}
                  </span>
                  <span>•</span>
                  <span>Received: {formatDate(data?.letterReceivedDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`InwardRegister_${data?.issueNo || "Entry"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/inward-register")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_INWARD_REGISTER) && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/inward-register/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoItem
                  icon={Calendar}
                  label="Issue Date"
                  value={formatDate(data?.issueDate)}
                />
                <InfoItem
                  icon={User}
                  label="From Whom Received"
                  value={data?.fromWhomReceived}
                  className="md:col-span-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">
                    Letter Description
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[100px]">
                    {data?.letterDescription || "No description provided."}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">
                    Subject
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[100px]">
                    {data?.subject || "No subject provided."}
                  </div>
                </div>
              </div>

              {/* Document Details Section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  Detailed Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Received Letter No
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.receivedLetterNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Received Letter Date
                    </label>
                    <p className="font-medium text-gray-800">
                      {formatDate(data?.receivedLetterDate) || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      File No
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.fileNo || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Attachment
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.attachment || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <CornerDownRight className="w-5 h-5 text-gray-400" />
                  Reply Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="space-y-1">
                    <label className="text-xs text-blue-400 uppercase">
                      Reply To No
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.replyToNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-blue-400 uppercase">
                      Reply To Date
                    </label>
                    <p className="font-medium text-gray-800">
                      {formatDate(data?.replyToDate) || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-blue-400 uppercase">
                      Our Reply No
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.ourReplyNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-blue-400 uppercase">
                      Our Reply Date
                    </label>
                    <p className="font-medium text-gray-800">
                      {formatDate(data?.ourReplyDate) || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Forwarding & Section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-gray-400" />
                  Forwarding & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Forwarded Letter No
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.forwardedLetterNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Forwarded Letter Date
                    </label>
                    <p className="font-medium text-gray-800">
                      {formatDate(data?.forwardedLetterDate) || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Section
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.section || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Sent To
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.sentTo || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Signed Date
                    </label>
                    <p className="font-medium text-gray-800">
                      {formatDate(data?.signedDate) || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Added By
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.addedBy?.name || "System"}
                    </p>
                  </div>
                </div>
              </div>

              {data?.remarks && (
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Remarks
                  </h3>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    {data.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewInwardRegister;
