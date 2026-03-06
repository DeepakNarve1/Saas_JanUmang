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
  Building,
  MapPin,
  File,
  Info,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { ViewPageActions } from "@app/components/ViewPageActions";

const ViewDispatchRegister = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/dispatch-register/${id}`);
        setData(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load Dispatch Register data");
        router.push("/dispatch-register");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Dispatch Register Details" />
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
    value: React.ReactNode;
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
        <div className="text-gray-700 font-medium mt-1">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </div>
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
      "Dispatch No": data.dispatchNo,
      Year: data.year,
      Month: data.month,
      Date: data.date ? formatDate(data.date) : "",
      "Portal No": data.portalNo,
      "Samiti No": data.samitiNo,
      Department: data.department?.name || "",
      Particulars: data.particulars || "",
      Reference: data.reference || "",
      District: data.district?.name || "",
      Block: data.block?.name || "",
      Panchayat: data.panchayat?.map((p: any) => p.name).join(", ") || "",
      Village: data.village?.map((v: any) => v.name).join(", ") || "",
      "Upload Letter": data.uploadLetter || "",
      "Added By": data.addedBy?.name || "",
    };
  };

  return (
    <>
      <ContentHeader title="Dispatch Register Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00563B]" />
                  Dispatch No: {data?.dispatchNo}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Year: {data?.year}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                    Month: {data?.month}
                  </span>
                  <span>•</span>
                  <span>Date: {formatDate(data?.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Dispatch_${data?.dispatchNo || "Entry"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/dispatch-register")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_DISPATCH_REGISTER) && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/dispatch-register/${id}/edit`)}
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
                  icon={File}
                  label="Portal No"
                  value={data?.portalNo}
                />
                <InfoItem
                  icon={Building}
                  label="Samiti No"
                  value={data?.samitiNo}
                />
                <InfoItem
                  icon={Building}
                  label="Department"
                  value={data?.department?.name}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">
                    Particulars (Subject)
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[100px]">
                    {data?.particulars || "No particulars provided."}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">
                    Reference
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[100px]">
                    {data?.reference || "No reference provided."}
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      District
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.district?.name || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Block
                    </label>
                    <p className="font-medium text-gray-800">
                      {data?.block?.name || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Panchayat
                    </label>
                    <div className="font-medium text-gray-800 flex flex-wrap gap-1">
                      {data?.panchayat && data.panchayat.length > 0
                        ? data.panchayat.map((p: any) => (
                            <span
                              key={p._id}
                              className="bg-gray-100 px-2 py-0.5 rounded text-xs"
                            >
                              {p.name}
                            </span>
                          ))
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase">
                      Village
                    </label>
                    <div className="font-medium text-gray-800 flex flex-wrap gap-1">
                      {data?.village && data.village.length > 0
                        ? data.village.map((v: any) => (
                            <span
                              key={v._id}
                              className="bg-gray-100 px-2 py-0.5 rounded text-xs"
                            >
                              {v.name}
                            </span>
                          ))
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 uppercase mb-1">
                    Upload Letter
                  </label>
                  {data?.uploadLetter ? (
                    <a
                      href={data.uploadLetter}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {data.uploadLetter}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">
                      No file uploaded
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <label className="text-xs text-gray-400 uppercase mb-1">
                    Added By
                  </label>
                  <span className="font-medium text-gray-800">
                    {data?.addedBy?.name || "System"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewDispatchRegister;
