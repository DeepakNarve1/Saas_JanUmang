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

const ViewSubTypeOfWork = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/sub-type-of-work/${id}`);
        setData(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load Sub Type of Work");
        router.push("/sub-type-of-work");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Sub Type of Work Details" />
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
      "Sub Type of Work": data.subTypeOfWork,
      "Type of Work": data.typeOfWork,
      "System ID": data._id,
    };
  };

  return (
    <>
      <ContentHeader title="Sub Type of Work Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {data?.subTypeOfWork}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Sub Type of Work Overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`SubTypeOfWork_${data?.subTypeOfWork || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/sub-type-of-work")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_SUB_WORK_TYPES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                    onClick={() => router.push(`/sub-type-of-work/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Info Card 1 */}
                <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Type of Work
                    </label>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                      {data?.typeOfWork}
                    </p>
                  </div>
                </div>

                {/* Info Card 2 */}
                <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
                  <div className="p-3 bg-green-100 dark:bg-emerald-900/30 rounded-xl text-green-600 dark:text-emerald-400">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Sub Type of Work
                    </label>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                      {data?.subTypeOfWork}
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

export default ViewSubTypeOfWork;
