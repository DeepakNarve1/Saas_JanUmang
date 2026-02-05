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
import { Doughnut, Bar, Pie } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";

import { useAppSelector } from "@app/store/store";

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
  publicProblems: any[];
  projects: any[];
  assemblyIssues: any[];
  events: any[];
  visitors: any[];
  inDocs: any[];
  departments?: any[];
  blocks?: any[];
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
    publicProblems,
    projects,
    assemblyIssues,
    visitors,
    inDocs,
    departments = [],
    blocks = [],
  }: DashboardChartsProps) => {
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

    // Aggregate Public Problems by Status
    const problemStats = useMemo(() => {
      const counts: Record<string, number> = {};
      publicProblems.forEach((p) => {
        const status = p.status || "Unknown";
        counts[status] = (counts[status] || 0) + 1;
      });
      return counts;
    }, [publicProblems]);

    const problemChartData = useMemo(
      () => ({
        labels: Object.keys(problemStats),
        datasets: [
          {
            label: "Number of Problems",
            data: Object.values(problemStats),
            backgroundColor: [
              "#f59e0b", // Yellow (Pending)
              "#10b981", // Green (Resolved)
              "#ef4444", // Red (Rejected)
              "#3b82f6", // Blue
              "#8b5cf6", // Purple
            ],
            borderColor: darkMode ? "#1e293b" : "#ffffff",
            borderWidth: 2,
          },
        ],
      }),
      [problemStats, darkMode],
    );

    // Aggregate Projects by Status
    const projectStats = useMemo(() => {
      const counts: Record<string, number> = {};
      projects.forEach((p) => {
        const status = p.status || "Unknown";
        counts[status] = (counts[status] || 0) + 1;
      });
      return counts;
    }, [projects]);

    const projectChartData = useMemo(
      () => ({
        labels: Object.keys(projectStats),
        datasets: [
          {
            label: "Number of Projects",
            data: Object.values(projectStats),
            backgroundColor: [
              "#3b82f6", // Blue (Ongoing)
              "#10b981", // Green (Completed)
              "#f59e0b", // Yellow (Delayed)
              "#6366f1", // Indigo
            ],
            borderWidth: 1,
          },
        ],
      }),
      [projectStats],
    );

    // Aggregate Assembly Issues by Block
    const assemblyStats = useMemo(() => {
      const counts: Record<string, number> = {};
      assemblyIssues.forEach((p) => {
        const block = p.block || "Unknown";
        counts[block] = (counts[block] || 0) + 1;
      });
      return counts;
    }, [assemblyIssues]);

    const assemblyChartData = useMemo(
      () => ({
        labels: Object.keys(assemblyStats),
        datasets: [
          {
            label: "Assembly Issues by Block",
            data: Object.values(assemblyStats),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      }),
      [assemblyStats],
    );

    // Aggregate Public Problems by Department
    const departmentStats = useMemo(() => {
      // Initialize with 0 for all known departments
      const counts: Record<string, number> = {};

      // Add known departments first
      departments.forEach((d) => {
        if (d.name) counts[d.name] = 0;
      });

      // Count actual problems
      publicProblems.forEach((p) => {
        const dept = p.department || "Unknown";
        counts[dept] = (counts[dept] || 0) + 1;
      });
      return counts;
    }, [publicProblems, departments]);

    const departmentChartData = useMemo(() => {
      const labels = Object.keys(departmentStats);
      const colors = generateColors(labels.length);
      return {
        labels,
        datasets: [
          {
            label: "Problems by Department",
            data: Object.values(departmentStats),
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.6", "1")),
            borderWidth: 1,
          },
        ],
      };
    }, [departmentStats]);

    // Aggregate Public Problems by Block
    const blockProblemStats = useMemo(() => {
      // Initialize with 0 for all known blocks
      const counts: Record<string, number> = {};

      // Add known blocks first
      blocks.forEach((b) => {
        if (b.name) counts[b.name] = 0;
      });

      // Count actual problems
      publicProblems.forEach((p) => {
        const block = p.block || "Unknown";
        counts[block] = (counts[block] || 0) + 1;
      });
      return counts;
    }, [publicProblems, blocks]);

    const blockProblemChartData = useMemo(() => {
      const labels = Object.keys(blockProblemStats);
      const colors = generateColors(labels.length);
      return {
        labels,
        datasets: [
          {
            label: "Problems by Block",
            data: Object.values(blockProblemStats),
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.6", "1")),
            borderWidth: 1,
          },
        ],
      };
    }, [blockProblemStats]);

    // Aggregate Visitors by Block
    const visitorStats = useMemo(() => {
      const counts: Record<string, number> = {};
      blocks.forEach((b) => {
        if (b.name) counts[b.name] = 0;
      });
      visitors.forEach((v) => {
        const block = v.block || "Unknown";
        counts[block] = (counts[block] || 0) + 1;
      });
      return counts;
    }, [visitors, blocks]);

    const visitorChartData = useMemo(() => {
      const labels = Object.keys(visitorStats);
      return {
        labels,
        datasets: [
          {
            label: "Visitors by Block",
            data: Object.values(visitorStats),
            backgroundColor: "rgba(16, 185, 129, 0.6)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          },
        ],
      };
    }, [visitorStats]);

    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public Problems Chart (Status) */}
          <Card className="dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                MP Public Problem Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center h-64">
              {publicProblems.length > 0 ? (
                <Doughnut data={problemChartData} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                  No Data Available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Chart */}
          <Card className="dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center h-64">
              {projects.length > 0 ? (
                <Pie data={projectChartData} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                  No Data Available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assembly Issues Total */}
          <Card className="dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Assembly Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {assemblyIssues.length}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                Total Issues
              </p>
            </CardContent>
          </Card>

          {/* Problems by Block Chart */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Problems by Block
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {Object.keys(blockProblemStats).length > 0 ? (
                <Bar data={blockProblemChartData} options={commonOptions} />
              ) : (
                <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                  No Block Data Available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visitors by Block Chart */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 dark:bg-[#1e293b] dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Visitors by Block
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {Object.keys(visitorStats).length > 0 ? (
                <Bar data={visitorChartData} options={commonOptions} />
              ) : (
                <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                  No Visitor Data Available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);

DashboardCharts.displayName = "DashboardCharts";
export default DashboardCharts;
