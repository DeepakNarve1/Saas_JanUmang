"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, Calendar, ShieldCheck, Hash } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IDistrict } from "@app/types/district";
import { PERMISSIONS } from "@app/config/permissions";

const ViewDistrict = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [district, setDistrict] = useState<IDistrict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const res = await axios.get(`/districts/${id}`);
        setDistrict(res.data?.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load district");
        router.push("/districts");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDistrict();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="District Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!district) return {};
    return {
      "District Name": district.name,
      Division: (district.division as { name?: string })?.name || "",
      State:
        (district.division as { state?: { name?: string } })?.state?.name || "",
      "Created At": district.createdAt
        ? new Date(district.createdAt).toLocaleDateString()
        : "",
      "System ID": district._id,
    };
  };

  return (
    <>
      <ContentHeader title="District Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {district?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  District Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`District_${district?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/districts")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_DISTRICTS) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20"
                    onClick={() => router.push(`/districts/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit District
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      District Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {district?.name}
                    </p>
                  </div>
                </div>

                {/* Info Card 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Created At
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {district?.createdAt
                        ? new Date(district.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {/* Info Card 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-green-100 dark:bg-emerald-900/30 rounded-lg text-green-600 dark:text-emerald-400">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Division
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {(district?.division as { name?: string })?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Info Card - State */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      State
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {(district?.division as { state?: { name?: string } })
                        ?.state?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-700 dark:text-yellow-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    System Information
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                    Unique System ID:{" "}
                    <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm ml-1 text-gray-800 dark:text-gray-200">
                      {district?._id}
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewDistrict;
