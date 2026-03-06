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
import { IVidhanSabha } from "@app/types/vidhanSabha";
import { PERMISSIONS } from "@app/config/permissions";

const ViewVidhanSabha = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [vidhanSabhaData, setVidhanSabhaData] = useState<IVidhanSabha | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVidhanSabha = async () => {
      try {
        const res = await axios.get(`/vidhan-sabha/${id}`);
        setVidhanSabhaData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load VidhanSabha");
        router.push("/vidhansabha");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVidhanSabha();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="VidhanSabha Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!vidhanSabhaData) return {};
    return {
      "Vidhan Sabha Name": vidhanSabhaData.name,
      "Election Year": vidhanSabhaData.year,
      "System ID": vidhanSabhaData._id,
    };
  };

  return (
    <>
      <ContentHeader title="VidhanSabha Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {vidhanSabhaData?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  VidhanSabha Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`VidhanSabha_${vidhanSabhaData?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/vidhansabha")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_ASSEMBLIES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                    onClick={() => router.push(`/vidhansabha/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2 font-bold" /> Edit VidhanSabha
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      VidhanSabha Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {vidhanSabhaData?.name}
                    </p>
                  </div>
                </div>

                {/* Info Card 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      System ID
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {vidhanSabhaData?._id}
                    </p>
                  </div>
                </div>

                {/* Info Card 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Election Year
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {vidhanSabhaData?.year}
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

export default ViewVidhanSabha;
