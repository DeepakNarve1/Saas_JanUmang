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
  Calendar,
  User,
  Phone,
  Tag,
  MapPin,
  FileText,
  Clock,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { ViewPageActions } from "@app/components/ViewPageActions";

const ViewCall = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/call-management/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load Call Details");
        router.push("/call-management");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Call Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  const getExportData = () => {
    if (!data) return {};
    return {
      Subject: data.subject || "",
      Category: data.category || "",
      Date: data.date ? new Date(data.date).toLocaleString() : "",
      "Caller Name": data.name || "",
      Mobile: data.mobile || "",
      Address: data.address || "",
      Description: data.description || "",
      "Assigned Date": data.assignDate
        ? new Date(data.assignDate).toLocaleString()
        : "Not Assigned",
      Remark: data.remark || "",
    };
  };

  return (
    <>
      <ContentHeader title="Call Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {data?.subject || "Call Subject"}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      data?.category === "Samsya"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {data?.category}
                  </span>
                  <span>•</span>
                  <span>
                    {data?.date ? new Date(data.date).toLocaleString() : "-"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Call_${data?.subject.replace(/\s+/g, "_")}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/call-management")}
                  className="bg-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_CALL_MANAGEMENT) && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/call-management/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Call
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Priority Info */}
                <div className="space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                      Caller Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">
                            {data?.name || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Mobile Number</p>
                          <p className="font-medium text-gray-900">
                            {data?.mobile || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">
                            {data?.address || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm h-full">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                      Call Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="w-full">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded-md text-sm leading-relaxed border border-gray-100">
                            {data?.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Assign Date & Time
                          </p>
                          <p className="font-medium text-gray-900">
                            {data?.assignDate
                              ? new Date(data.assignDate).toLocaleString()
                              : "Not Assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="w-full">
                          <p className="text-sm text-gray-500">Remark</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {data?.remark || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewCall;
