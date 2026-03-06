"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@app/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Loader2, History, Shield, Globe, Clock, MapPin } from "lucide-react";
import { Badge } from "@app/components/ui/badge";
import { IActivityLogResponse } from "@app/types/activityLog";

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const LoginHistoryModal = ({
  isOpen,
  onClose,
  userId,
  userName,
}: LoginHistoryModalProps) => {
  const { data: response, isLoading } = useQuery<IActivityLogResponse>({
    queryKey: ["login-history", userId],
    queryFn: async () => {
      const { data } = await axios.get("/activity-logs", {
        params: {
          user: userId,
          action: "LOGIN",
          limit: 10,
        },
      });
      return data;
    },
    enabled: isOpen && !!userId,
  });

  const logs = response?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-2xl">
        <DialogHeader className="p-6 bg-[#368F8B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Login History
              </DialogTitle>
              <DialogDescription className="text-white/80 font-medium">
                Showing recent login activities for {userName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-[#1A1B1E]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#368F8B]" />
              <p className="text-gray-500 font-medium animate-pulse">
                Fetching history...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Shield className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-medium text-lg">No login history found</p>
              <p className="text-sm">
                We couldn&apos;t find any recent login activity for this user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px] font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Date & Time
                      </div>
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> IP Address
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> User Agent
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log._id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs dark:bg-gray-800 dark:border-gray-700"
                        >
                          {log.ipAddress || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        <p
                          className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 italic"
                          title={log.userAgent}
                        >
                          {log.userAgent || "No data"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
          <span>{logs.length} Recent Sessions Displayed</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#368F8B]" /> Securely Logged
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
