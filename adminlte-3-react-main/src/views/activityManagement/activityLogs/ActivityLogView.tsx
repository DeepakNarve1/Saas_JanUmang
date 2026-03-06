"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { ChevronLeft, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { IActivityLog } from "@app/types/activityLog";

const ActivityLogView = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [log, setLog] = useState<IActivityLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await axios.get(`/activity-logs/${id}`);
        setLog(res.data.data);
      } catch (error: unknown) {
        handleError(error, "Failed to load activity log");
        router.push("/activity-management/activity-logs");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLog();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!log) return null;

  return (
    <>
      <ContentHeader
        title={
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6" />
            <span>Activity Log Details</span>
            <span className="text-sm font-normal text-gray-500 ml-2">
              View detailed information about this activity
            </span>
          </div>
        }
      />

      <section className="content">
        <div className="container-fluid px-4">
          <Card className="mt-6 dark:bg-card border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-colors">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Activity Information
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push("/activity-management/activity-logs")
                }
                className="gap-1 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" /> Back to List
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 w-1/4 font-semibold text-gray-600 dark:text-gray-400">
                        Date & Time
                      </th>
                      <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium">
                        {new Date(log.createdAt)
                          .toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                          .replace(/\//g, "/")}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        User
                      </th>
                      <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium">
                        {log.user?.name ||
                          log.snapshot?.userName ||
                          log.userName ||
                          "System"}
                        <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                          (ID: {log.user?._id || log.snapshot?.userId || "N/A"})
                        </span>
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        Action
                      </th>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.action === "UPDATE" || log.action === "EDIT"
                              ? "bg-orange-400 text-white"
                              : log.action === "CREATE"
                                ? "bg-green-500 text-white"
                                : log.action === "DELETE"
                                  ? "bg-red-500 text-white"
                                  : "bg-blue-500 text-white"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        Module
                      </th>
                      <td className="py-4 px-6 text-red-500 dark:text-red-400 font-medium">
                        {log.module}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        Table Name
                      </th>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono text-sm leading-none">
                        {log.metadata?.tableName || "-"}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        Record ID
                      </th>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        {log.metadata?.recordId || "-"}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        IP Address
                      </th>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        User Agent
                      </th>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-500 text-xs italic">
                        {log.userAgent || "-"}
                      </td>
                    </tr>
                    <tr className="italic group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <th className="py-4 px-6 bg-gray-50/30 dark:bg-gray-800/30 font-semibold text-gray-600 dark:text-gray-400">
                        Details
                      </th>
                      <td className="py-4 px-6 text-orange-600 dark:text-orange-400 text-sm leading-relaxed">
                        {log.description}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mb-16">
            {/* New Data */}
            <Card className="dark:bg-card border-green-500/20 dark:border-green-500/20 shadow-lg overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  New Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-gray-50/30 dark:bg-gray-900/10">
                <div className="bg-white dark:bg-[#202123] border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-80 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 shadow-inner">
                  <pre className="text-xs text-orange-600 dark:text-orange-400 font-mono leading-relaxed">
                    {log.metadata?.newData
                      ? JSON.stringify(log.metadata.newData, null, 2)
                      : "{}"}
                  </pre>
                </div>
                <div className="flex gap-2 mt-5">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white border-0 shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="h-3 w-12 bg-gray-400/30 dark:bg-gray-700 rounded-full my-auto ml-1 mr-auto"></div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white border-0 shadow-md"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Old Data */}
            <Card className="dark:bg-card border-orange-500/20 dark:border-orange-500/20 shadow-lg overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Old Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-gray-50/30 dark:bg-gray-900/10">
                <div className="bg-white dark:bg-[#202123] border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-80 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 shadow-inner">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
                    {log.metadata?.oldData
                      ? JSON.stringify(log.metadata.oldData, null, 2)
                      : "{}"}
                  </pre>
                </div>
                <div className="flex gap-2 mt-5">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white border-0 shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="h-3 w-12 bg-gray-400/30 dark:bg-gray-700 rounded-full my-auto ml-1 mr-auto"></div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white border-0 shadow-md"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ActivityLogView;
