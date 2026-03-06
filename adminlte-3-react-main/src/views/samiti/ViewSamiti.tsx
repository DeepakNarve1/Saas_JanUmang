"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, ShieldCheck, Hash } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { PERMISSIONS } from "@app/config/permissions";

const ViewSamiti = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [samitiData, setSamitiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSamiti = async () => {
      try {
        const res = await axios.get(`/samiti/${id}`);
        setSamitiData(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load Samiti");
        router.push("/samiti");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSamiti();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Samiti Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!samitiData) return {};
    return {
      "Samiti Name": samitiData.name,
      "System ID": samitiData._id,
    };
  };

  return (
    <>
      <ContentHeader title="Samiti Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {samitiData?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Samiti Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Samiti_${samitiData?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/samiti")}
                  className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_SAMITI) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white"
                    onClick={() => router.push(`/samiti/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Samiti
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Samiti Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {samitiData?.name}
                    </p>
                  </div>
                </div>

                {/* Info Card 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      System ID
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {samitiData?._id}
                    </p>
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

export default ViewSamiti;
