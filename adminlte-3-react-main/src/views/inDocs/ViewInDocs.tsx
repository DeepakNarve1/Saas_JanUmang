"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Edit,
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  User,
  File,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { PERMISSIONS } from "@app/config/permissions";

const ViewInDocs = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/in-docs/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load In Docs data",
        );
        router.push("/in-docs");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="In Doc Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      Subject: data.subject,
      "Issue No": data.issueNo,
      "Reference Issue No": data.referenceIssueNo || "",
      "Received Issue No": data.receivedIssueNo || "",
      Date: data.date ? new Date(data.date).toLocaleDateString() : "",
      "Name & Address": data.nameAddress || "",
      Place: data.place || "",
      "Documents Count": data.documentsCount || "0",
      "File Head/No": data.fileHeadNo || "",
      "Stamp Received": data.stampReceived || "",
      "Added By": data.addedBy?.name || "",
      Remarks: data.remarks || "",
    };
  };

  return (
    <>
      <ContentHeader title="In Doc Details (जावक दस्तावेज़)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {data?.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-500">Issue No: {data?.issueNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`InDoc_${data?.issueNo || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/in-docs")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_IN_DOCS) && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/in-docs/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Document Information
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Issue Details
                      </label>
                      <p className="text-gray-700 font-medium">
                        No: {data?.issueNo}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Ref Issue: {data?.referenceIssueNo || "N/A"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Received Issue: {data?.receivedIssueNo || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </label>
                      <p className="text-gray-700 font-medium">
                        {data?.date
                          ? new Date(data.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Recipient Details
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Name & Address
                      </label>
                      <p className="text-gray-700 font-medium whitespace-pre-wrap">
                        {data?.nameAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Place
                      </label>
                      <p className="text-gray-700 font-medium">
                        {data?.place || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="md:col-span-2 space-y-6 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-gray-400 uppercase">
                        Docs Count
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {data?.documentsCount || "0"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-gray-400 uppercase">
                        File Head/No
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {data?.fileHeadNo || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-gray-400 uppercase">
                        Stamp
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {data?.stampReceived ? `₹${data.stampReceived}` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs font-medium text-gray-400 uppercase">
                        Added By
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {data?.addedBy?.name || "System"}
                      </p>
                    </div>
                  </div>

                  {data?.remarks && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <label className="text-xs font-medium text-gray-400 uppercase">
                        Remarks
                      </label>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                        {data?.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewInDocs;
