"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, ShieldCheck, Hash } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IState } from "@app/types/state";
import { PERMISSIONS } from "@app/config/permissions";

const ViewState = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [stateData, setStateData] = useState<IState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await axios.get(`/states/${id}`);
        setStateData(res.data.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to load state");
        router.push("/states");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchState();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="State Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!stateData) return {};
    return {
      "State Name": stateData.name,
      "System ID": stateData._id,
      Divisions:
        stateData.divisions?.map((d: { name: string }) => d.name).join(", ") ||
        "",
    };
  };

  return (
    <>
      <ContentHeader title="State Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stateData?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  State Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`State_${stateData?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/states")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_STATES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20"
                    onClick={() => router.push(`/states/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit State
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
                      State Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {stateData?.name}
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
                      System ID
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {stateData?._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divisions List */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Divisions under {stateData?.name}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stateData?.divisions && stateData.divisions.length > 0 ? (
                    stateData.divisions.map(
                      (div: { _id: string; name: string }) => (
                        <div
                          key={div._id}
                          className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {div.name}
                          </span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="px-6 py-4 text-gray-500 dark:text-gray-400 italic">
                      No divisions found for this state.
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

export default ViewState;
