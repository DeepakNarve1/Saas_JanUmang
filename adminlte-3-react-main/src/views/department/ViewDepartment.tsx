"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Edit, ArrowLeft, ShieldCheck } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { ViewPageActions } from "@app/components/ViewPageActions";

interface IDepartment {
  _id: string;
  name: string;
  createdAt?: string;
}

const ViewDepartment = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<IDepartment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/departments/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load Department");
        router.push("/department");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      "Department Name": data.name,
      "Created At": data.createdAt || "",
    };
  };

  if (loading) {
    // ...
  }

  return (
    <>
      <ContentHeader title="Department Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {data?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Department Overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Department_${data?.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/department")}
                  className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_DEPARTMENTS) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all font-medium border-0"
                    onClick={() => router.push(`/department/${id}/edit`)}
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
                      Department Name
                    </label>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                      {data?.name}
                    </p>
                  </div>
                </div>

                {/* Additional Info? */}
                {data?.createdAt && (
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Created On
                      </label>
                      <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {new Date(data.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewDepartment;
