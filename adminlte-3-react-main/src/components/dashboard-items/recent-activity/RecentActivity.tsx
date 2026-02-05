"use client";

import React from "react";
import axios from "@app/utils/axios";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import {
  Activity,
  PlusCircle,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Eye,
  Clock,
} from "lucide-react";
import { IActivityLogResponse, IActivityLog } from "@app/types/activityLog";

const RecentActivity = () => {
  const { data, isLoading } = useQuery<IActivityLogResponse>({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const res = await axios.get("/activity-logs", {
        params: {
          limit: 5,
          page: 1,
          sort: "-createdAt",
        },
      });
      return res.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const activities = (data?.data || []).slice(0, 5);

  const getIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <PlusCircle className="w-4 h-4 text-green-500" />;
      case "UPDATE":
        return <Edit className="w-4 h-4 text-blue-500" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "LOGIN":
        return <LogIn className="w-4 h-4 text-purple-500" />;
      case "LOGOUT":
        return <LogOut className="w-4 h-4 text-gray-500" />;
      case "VIEW":
        return <Eye className="w-4 h-4 text-indigo-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#002f5e]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pt-1 pb-2">
            {activities.map((item: IActivityLog, idx: number) => (
              <div key={idx} className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-white">
                  {getIcon(item.action)}
                </span>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      <span className="font-bold">
                        {item.userName ||
                          item.snapshot?.userName ||
                          item.user?.name ||
                          "Unknown User"}
                      </span>{" "}
                      <span className="text-gray-500 font-normal">
                        {item.action === "CREATE"
                          ? "created a new"
                          : item.action === "UPDATE"
                            ? "updated"
                            : item.action === "DELETE"
                              ? "deleted"
                              : item.action.toLowerCase()}
                      </span>{" "}
                      <span className="text-blue-600 font-medium">
                        {(item as any).targetName ||
                          item.snapshot?.targetName ||
                          item.module}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.createdAt &&
                      formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No recent activity found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
