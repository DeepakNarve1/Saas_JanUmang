"use client";

import React, { useMemo, memo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";

import { useAppSelector } from "@app/store/store";
import { useModuleAccess } from "@app/hooks/useModuleAccess";
import { MODULE_IDS } from "@app/config/modules";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

interface DashboardChartsProps {
  problemsByDepartment?: Array<{ department: string; count: number }>;
  problemsByStatus?: Array<{ status: string; count: number }>;
  stats?: {
    totalAssemblyIssues?: number;
    totalProjects?: number;
    completedProjects?: number;
  };
}

// Helper for dynamic colors
const generateColors = (count: number) => {
  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(199, 199, 199, 0.6)",
    "rgba(83, 102, 255, 0.6)",
    "rgba(40, 159, 64, 0.6)",
    "rgba(210, 99, 132, 0.6)",
  ];
  return Array.from({ length: count }).map((_, i) => colors[i % colors.length]);
};

const DashboardCharts = memo(
  ({
    problemsByDepartment = [],
    problemsByStatus = [],
    stats = {},
  }: DashboardChartsProps) => {
    const { checkModuleAccess } = useModuleAccess();
    const showMPProblems = checkModuleAccess(MODULE_IDS.MP_PUBLIC_PROBLEMS);
    const showProjects = checkModuleAccess(MODULE_IDS.PROJECTS);
    const showAssemblyIssues = checkModuleAccess(MODULE_IDS.ASSEMBLY_ISSUES);

    const darkMode = useAppSelector((state) => state.ui.darkMode);
    const textColor = darkMode ? "#e2e8f0" : "#475569";
    const gridColor = darkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";

    // Common Chart Options
    const commonOptions = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom" as const,
            labels: { color: textColor, font: { size: 11 } },
          },
          tooltip: {
            backgroundColor: darkMode ? "#1e293b" : "#475569",
            titleColor: "#fff",
            bodyColor: "#fff",
          },
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor, display: false },
          },
          y: {
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      }),
      [textColor, gridColor, darkMode],
    );

    const pieOptions = useMemo(
      () => ({
        ...commonOptions,
        scales: undefined, // Remove scales for circular charts
      }),
      [commonOptions],
    );

    // Problems by Status Chart Data
    const problemChartData = useMemo(
      () => ({
        labels: problemsByStatus.map((p) => p.status),
        datasets: [
          {
            label: "Number of Problems",
            data: problemsByStatus.map((p) => p.count),
            backgroundColor: [
              "#f59e0b", // Yellow (Pending)
              "#10b981", // Green (Resolved)
              "#ef4444", // Red (Rejected)
              "#3b82f6", // Blue (In Progress)
              "#8b5cf6", // Purple
            ],
            borderColor: darkMode ? "#1e293b" : "#ffffff",
            borderWidth: 2,
          },
        ],
      }),
      [problemsByStatus, darkMode],
    );

    // Problems by Department Chart Data
    const departmentChartData = useMemo(() => {
      const colors = generateColors(problemsByDepartment.length);
      return {
        labels: problemsByDepartment.map((d) => d.department),
        datasets: [
          {
            label: "Problems by Department",
            data: problemsByDepartment.map((d) => d.count),
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.6", "1")),
            borderWidth: 1,
          },
        ],
      };
    }, [problemsByDepartment]);

    if (!showMPProblems && !showProjects && !showAssemblyIssues) {
      return null;
    }

    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public Problems Chart (Status) */}
          {showMPProblems && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  MP Public Problem Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center h-64">
                {problemsByStatus.length > 0 ? (
                  <Doughnut data={problemChartData} options={pieOptions} />
                ) : (
                  <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                    No Data Available
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Projects Chart */}
          {showProjects && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalProjects || 0}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                  Total Projects
                </p>
                <p className="text-green-600 dark:text-green-400 mt-1 text-sm">
                  {stats.completedProjects || 0} Completed
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assembly Issues Total */}
          {showAssemblyIssues && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Assembly Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalAssemblyIssues || 0}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                  Total Issues
                </p>
              </CardContent>
            </Card>
          )}

          {/* Problems by Department Chart */}
          {showMPProblems && (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Problems by Department
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {problemsByDepartment.length > 0 ? (
                  <Bar data={departmentChartData} options={commonOptions} />
                ) : (
                  <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                    No Department Data Available
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  },
);

DashboardCharts.displayName = "DashboardCharts";
export default DashboardCharts;
