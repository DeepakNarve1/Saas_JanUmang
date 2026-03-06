"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { usePermissions } from "@app/hooks/usePermissions";
import { Skeleton } from "@app/components/ui/skeleton";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IPanchayat } from "@app/types/panchayat";
import { handleError } from "@app/utils/errorHandler";
import { PERMISSIONS } from "@app/config/permissions";

const ViewPanchayat = () => {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<IPanchayat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/panchayat/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load panchayat details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      "Panchayat Name": data.name,
      State: typeof data.state === "object" ? data.state.name : "",
      Division: typeof data.division === "object" ? data.division.name : "",
      District: typeof data.district === "object" ? data.district.name : "",
      Parliament:
        typeof data.parliament === "object" ? data.parliament.name : "",
      Assembly: typeof data.assembly === "object" ? data.assembly.name : "",
      Block: typeof data.block === "object" ? data.block.name : "",
      Booth: typeof data.booth === "object" ? data.booth.name : "",
    };
  };

  if (loading) {
    // ... (keep structure)
    return (
      <>
        <ContentHeader title="Panchayat Details" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }
  if (!data)
    return (
      <div className="p-6 text-center dark:text-gray-400">Record not found</div>
    );

  return (
    <>
      <ContentHeader title="Panchayat Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 gap-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {data.name}
              </h2>
              <div className="flex gap-2 items-center">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Panchayat_${data.name}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {hasPermission(PERMISSIONS.EDIT_PANCHAYATS) && (
                  <Button
                    onClick={() => router.push(`/panchayat/${id}/edit`)}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Record
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <ViewField label="Panchayat Name" value={data.name} />
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
  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
    <div>
      <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </h3>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {value}
      </p>
    </div>
  </div>
);

export default ViewPanchayat;
