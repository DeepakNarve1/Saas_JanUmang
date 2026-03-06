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

// Helper for dynamic colors
const CHART_COLORS = [
  "rgba(255, 99, 132, 0.7)",
  "rgba(54, 162, 235, 0.7)",
  "rgba(255, 206, 86, 0.7)",
  "rgba(75, 192, 192, 0.7)",
  "rgba(153, 102, 255, 0.7)",
  "rgba(255, 159, 64, 0.7)",
  "rgba(199, 199, 199, 0.7)",
  "rgba(83, 102, 255, 0.7)",
  "rgba(40, 159, 64, 0.7)",
  "rgba(210, 99, 132, 0.7)",
];

const generateColors = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => CHART_COLORS[i % CHART_COLORS.length],
  );

interface DashboardChartsProps {
  // New props from the full dashboard
  publicProblems?: any[];
  projects?: any[];
  assemblyIssues?: any[];
  events?: any[];
  visitors?: any[];
  inDocs?: any[];
  departments?: any[];
  blocks?: any[];

  // Legacy props (kept for backward compatibility)
  problemsByDepartment?: Array<{ department: string; count: number }>;
  problemsByStatus?: Array<{ status: string; count: number }>;
  stats?: {
    totalAssemblyIssues?: number;
    totalProjects?: number;
    completedProjects?: number;
  };
}

const DashboardCharts = memo(
  ({
    publicProblems = [],
    projects = [],
    assemblyIssues = [],
    departments = [],
    // Legacy
    problemsByDepartment = [],
    problemsByStatus = [],
    stats = {},
  }: DashboardChartsProps) => {
    const { checkModuleAccess } = useModuleAccess();
    const showPublicProblems = true; // Public problems are always shown on the dashboard
    const showProjects = checkModuleAccess(MODULE_IDS.PROJECTS);
    const showAssemblyIssues = checkModuleAccess(MODULE_IDS.ASSEMBLY_ISSUES);
    const showDepartments =
      departments.length > 0 || problemsByDepartment.length > 0;

    const darkMode = useAppSelector((state) => state.ui.darkMode);
    const textColor = darkMode ? "#e2e8f0" : "#475569";
    const gridColor = darkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";

    // Common Chart Options
    const commonBarOptions = useMemo(
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
            ticks: { color: textColor, precision: 0 },
            grid: { color: gridColor },
            beginAtZero: true,
          },
        },
      }),
      [textColor, gridColor, darkMode],
    );

    const pieOptions = useMemo(
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
      }),
      [textColor, darkMode],
    );

    // --- Public Problems by Status (from live data OR legacy props) ---
    const problemStatusData = useMemo(() => {
      // Live data path: aggregate from publicProblems array
      if (publicProblems.length > 0) {
        const counts: Record<string, number> = {};
        publicProblems.forEach((p) => {
          const status = p.status || "Pending";
          counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([status, count]) => ({
          status,
          count,
        }));
      }
      // Legacy fallback
      return problemsByStatus;
    }, [publicProblems, problemsByStatus]);

    const problemStatusChartData = useMemo(
      () => ({
        labels: problemStatusData.map((p) => p.status),
        datasets: [
          {
            label: "Problems by Status",
            data: problemStatusData.map((p) => p.count),
            backgroundColor: [
              "#f59e0b",
              "#10b981",
              "#ef4444",
              "#3b82f6",
              "#8b5cf6",
            ],
            borderColor: darkMode ? "#1e293b" : "#ffffff",
            borderWidth: 2,
          },
        ],
      }),
      [problemStatusData, darkMode],
    );

    // --- Problems by Department (from live departments OR legacy props) ---
    const deptData = useMemo(() => {
      if (departments.length > 0 && publicProblems.length > 0) {
        const counts: Record<string, number> = {};
        publicProblems.forEach((p) => {
          const dept = p.department || "Unknown";
          counts[dept] = (counts[dept] || 0) + 1;
        });
        return Object.entries(counts).map(([department, count]) => ({
          department,
          count,
        }));
      }
      return problemsByDepartment;
    }, [departments, publicProblems, problemsByDepartment]);

    const deptChartData = useMemo(() => {
      const colors = generateColors(deptData.length);
      return {
        labels: deptData.map((d) => d.department),
        datasets: [
          {
            label: "Problems by Department",
            data: deptData.map((d) => d.count),
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.7", "1")),
            borderWidth: 1,
          },
        ],
      };
    }, [deptData]);

    // --- Projects by Status ---
    const projectStatusData = useMemo(() => {
      if (projects.length === 0) return null;
      const counts: Record<string, number> = {};
      projects.forEach((p) => {
        const status = p.status || "Active";
        counts[status] = (counts[status] || 0) + 1;
      });
      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: "Projects by Status",
            data: Object.values(counts),
            backgroundColor: generateColors(Object.keys(counts).length),
            borderWidth: 1,
          },
        ],
      };
    }, [projects]);

    // --- Assembly Issues by Status ---
    const assemblyIssueData = useMemo(() => {
      if (assemblyIssues.length === 0) return null;
      const counts: Record<string, number> = {};
      assemblyIssues.forEach((issue) => {
        const status = issue.status || "Open";
        counts[status] = (counts[status] || 0) + 1;
      });
      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: "Assembly Issues",
            data: Object.values(counts),
            backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"],
            borderWidth: 1,
          },
        ],
      };
    }, [assemblyIssues]);

    const hasAnyData =
      problemStatusData.length > 0 ||
      deptData.length > 0 ||
      showProjects ||
      showAssemblyIssues;

    if (!hasAnyData) return null;

    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public Problems by Status */}
          {showPublicProblems && problemStatusData.length > 0 && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Public Problems by Status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center h-64">
                <Doughnut data={problemStatusChartData} options={pieOptions} />
              </CardContent>
            </Card>
          )}

          {/* Projects Status */}
          {showProjects && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center">
                {projectStatusData ? (
                  <Doughnut data={projectStatusData} options={pieOptions} />
                ) : (
                  <>
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalProjects || projects.length || 0}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                      Total Projects
                    </p>
                    <p className="text-green-600 dark:text-green-400 mt-1 text-sm">
                      {stats.completedProjects || 0} Completed
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assembly Issues */}
          {showAssemblyIssues && (
            <Card className="dark:bg-[#1e293b] dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Assembly Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center">
                {assemblyIssueData ? (
                  <Doughnut data={assemblyIssueData} options={pieOptions} />
                ) : (
                  <>
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalAssemblyIssues || assemblyIssues.length || 0}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                      Total Issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Problems by Department — full width */}
        {showDepartments && deptData.length > 0 && (
          <Card className="dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Problems by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <Bar data={deptChartData} options={commonBarOptions} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
);

DashboardCharts.displayName = "DashboardCharts";
export default DashboardCharts;
