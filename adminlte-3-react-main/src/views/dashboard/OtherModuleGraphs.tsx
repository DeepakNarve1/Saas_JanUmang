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

interface OtherModuleGraphsProps {
  events: any[];
  visitors: any[];
}

const OtherModuleGraphs = memo(
  ({ events = [], visitors = [] }: OtherModuleGraphsProps) => {
    // Aggregate Events by Month or Type
    // Let's do Events by Type
    const eventTypeStats = useMemo(() => {
      const counts: Record<string, number> = {};
      events.forEach((p) => {
        const type = p.eventType || "General";
        counts[type] = (counts[type] || 0) + 1;
      });
      return counts;
    }, [events]);

    const eventChartData = useMemo(
      () => ({
        labels: Object.keys(eventTypeStats),
        datasets: [
          {
            label: "Events by Type",
            data: Object.values(eventTypeStats),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      }),
      [eventTypeStats],
    );

    // Aggregate Visitors by Visitor Type
    const visitorTypeStats = useMemo(() => {
      const counts: Record<string, number> = {};
      visitors.forEach((p) => {
        const type = p.visitorType || "Unknown";
        counts[type] = (counts[type] || 0) + 1;
      });
      return counts;
    }, [visitors]);

    const visitorChartData = useMemo(
      () => ({
        labels: Object.keys(visitorTypeStats),
        datasets: [
          {
            label: "Visitors by Type",
            data: Object.values(visitorTypeStats),
            backgroundColor: [
              "#f59e0b",
              "#10b981",
              "#3b82f6",
              "#8b5cf6",
              "#ef4444",
            ],
            borderWidth: 1,
          },
        ],
      }),
      [visitorTypeStats],
    );

    if (!events.length && !visitors.length) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Events Chart */}
        {events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Events Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <Bar
                data={eventChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Visitors Chart */}
        {visitors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Visitor Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex justify-center">
              <Doughnut
                data={visitorChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
);

OtherModuleGraphs.displayName = "OtherModuleGraphs";
export default OtherModuleGraphs;
