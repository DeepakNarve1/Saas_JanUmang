"use client";

import React from "react";
import {
  Users,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@app/components/ui/card";

interface DashboardStatsGridProps {
  stats: any;
  cardStats: any;
  isLoading: boolean;
}

const DashboardStatsGrid = ({
  stats,
  cardStats,
  isLoading,
}: DashboardStatsGridProps) => {
  const statCards = [
    {
      title: "Today Total Member",
      value: stats.todayMembers,
      icon: Users,
      color: "bg-[#0ea5e9]",
      description: "Registered today",
    },
    {
      title: "All Total Member",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-[#0ea5e9]",
      description: "Total registered",
    },
    {
      title: "Total Public Problems",
      value: cardStats.public.total,
      icon: FileText,
      color: "bg-[#ef4444]",
      description: "All issues",
    },
    {
      title: "Complete Public Problem",
      value: cardStats.public.complete,
      icon: CheckCircle2,
      color: "bg-[#22c55e]",
      description: "Resolved issues",
    },
    {
      title: "Incomplete Public Problem",
      value: cardStats.public.incomplete,
      icon: AlertCircle,
      color: "bg-[#ef4444]",
      description: "Pending issues",
    },
    {
      title: "In Progress Public Problem",
      value: cardStats.public.inProgress,
      icon: Clock,
      color: "bg-[#f97316]",
      description: "Being processed",
    },
    {
      title: "MP Total Public Problem",
      value: cardStats.mp.total,
      icon: Shield,
      color: "bg-[#6366f1]",
      description: "MP specific issues",
    },
    {
      title: "MP Complete Problem",
      value: cardStats.mp.complete,
      icon: CheckCircle2,
      color: "bg-[#22c55e]",
      description: "MP resolved",
    },
    {
      title: "MP Incomplete Problem",
      value: cardStats.mp.incomplete,
      icon: AlertCircle,
      color: "bg-[#ef4444]",
      description: "MP pending",
    },
    {
      title: "MP InProgress Problem",
      value: cardStats.mp.inProgress,
      icon: Clock,
      color: "bg-[#f97316]",
      description: "MP processing",
    },
    {
      title: "Total InDocs",
      value: stats.totalInDocs,
      icon: FileText,
      color: "bg-[#8b5cf6]",
      description: "Total documents",
    },
    {
      title: "Total Visitors",
      value: stats.totalVisitors,
      icon: Users,
      color: "bg-[#10b981]",
      description: "Active visitors",
    },
    {
      title: "Total Samitis",
      value: stats.totalSamitis,
      icon: Shield,
      color: "bg-[#f59e0b]",
      description: "Total samitis",
    },
    {
      title: "Total Panchayats",
      value: stats.totalPanchayats,
      icon: Shield,
      color: "bg-[#ec4899]",
      description: "Total panchayats",
    },
    {
      title: "Total Villages",
      value: stats.totalVillages,
      icon: Shield,
      color: "bg-[#6366f1]",
      description: "Total villages",
    },
    {
      title: "Total Booths",
      value: stats.totalBooths,
      icon: Shield,
      color: "bg-[#14b8a6]",
      description: "Total booths",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 justify-center sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {statCards.map((stat, idx) => (
        <Card
          key={idx}
          className="hover:shadow-md transition-shadow duration-300 border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800"
        >
          <CardHeader className={`pb-2 ${stat.color} text-white rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{stat.value}</h3>
              <stat.icon className="w-5 h-5 opacity-80" />
            </div>
            <p
              className="text-xs font-semibold opacity-90 truncate"
              title={stat.title}
            >
              {stat.title}
            </p>
          </CardHeader>
          <CardContent className="pt-2 bg-white dark:bg-card rounded-b-xl border-t-0 p-3">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatsGrid;
