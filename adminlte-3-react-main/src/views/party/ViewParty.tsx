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

const ViewParty = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [partyData, setPartyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParty = async () => {
      try {
        const res = await axios.get(`/party/${id}`);
        setPartyData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load Party");
        router.push("/party");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchParty();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Party Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!partyData) return {};
    return {
      "Party Name": partyData.name,
      "System ID": partyData._id,
      "Created At": partyData.createdAt || "",
    };
  };

  return (
    <>
      <ContentHeader title="Party Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {partyData?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Party Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Party_${partyData?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/party")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_PARTIES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20"
                    onClick={() => router.push(`/party/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Party
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
                      Party Name
                    </label>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">
                      {partyData?.name}
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
                    <p className="font-semibold text-gray-700 dark:text-gray-200 mt-1 text-sm">
                      {partyData?._id}
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

export default ViewParty;
