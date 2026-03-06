"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { usePermissions } from "@app/hooks/usePermissions";
import { Skeleton } from "@app/components/ui/skeleton";
import { handleError } from "@app/utils/errorHandler";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IVillage } from "@app/types/village";
import { PERMISSIONS } from "@app/config/permissions";

const ViewVillage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<IVillage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/villages/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load village details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading village details...
        </p>
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-6 text-center dark:text-gray-400">Record not found</div>
    );

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      "Village Name": data.name,
      State: typeof data.state === "object" ? data.state.name : "",
      Division: typeof data.division === "object" ? data.division.name : "",
      District: typeof data.district === "object" ? data.district.name : "",
      Parliament:
        typeof data.parliament === "object" ? data.parliament.name : "",
      Assembly: typeof data.assembly === "object" ? data.assembly.name : "",
      Block: typeof data.block === "object" ? data.block.name : "",
      Booth: typeof data.booth === "object" ? data.booth.name : "",
      Panchayat: typeof data.panchayat === "object" ? data.panchayat.name : "",
    };
  };

  return (
    <>
      <ContentHeader title="Village Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {data?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Village Overview & Information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Village_${data?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/villages")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_VILLAGES) && (
                  <Button
                    onClick={() => router.push(`/villages/${id}/edit`)}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Record
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ViewField label="Village Name" value={data.name} />
                <ViewField
                  label="State"
                  value={
                    typeof data.state === "object" ? data.state.name : "N/A"
                  }
                />
                <ViewField
                  label="Division"
                  value={
                    typeof data.division === "object"
                      ? data.division.name
                      : "N/A"
                  }
                />
                <ViewField
                  label="District"
                  value={
                    typeof data.district === "object"
                      ? data.district.name
                      : "N/A"
                  }
                />
                <ViewField
                  label="Parliament"
                  value={
                    typeof data.parliament === "object"
                      ? data.parliament.name
                      : "N/A"
                  }
                />
                <ViewField
                  label="Assembly"
                  value={
                    typeof data.assembly === "object"
                      ? data.assembly.name
                      : "N/A"
                  }
                />
                <ViewField
                  label="Block"
                  value={
                    typeof data.block === "object" ? data.block.name : "N/A"
                  }
                />
                <ViewField
                  label="Booth"
                  value={
                    typeof data.booth === "object" ? data.booth.name : "N/A"
                  }
                />
                <ViewField
                  label="Panchayat"
                  value={
                    typeof data.panchayat === "object"
                      ? data.panchayat.name
                      : "N/A"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ViewField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
      {label}
    </h3>
    <p className="text-base font-semibold text-gray-800 dark:text-gray-100 wrap-break-word line-clamp-2">
      {value || "-"}
    </p>
  </div>
);

export default ViewVillage;
