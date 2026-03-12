"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { API_BASE_URL } from "@app/utils/api";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { FileImage } from "lucide-react";
import { Label } from "@app/components/ui/label";
import { Badge } from "@app/components/ui/badge";
import { Skeleton } from "@app/components/ui/skeleton";
import { IPublicProblem } from "@app/types/mpPublicProblem";
import { ViewPageActions } from "@app/components/ViewPageActions";

const ViewMPPublicProblem = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<IPublicProblem | null>(null);
  const [hierarchy, setHierarchy] = useState<{
    division: string;
    state: string;
  }>({ division: "", state: "" });
  const [loading, setLoading] = useState(true);

  // Section Visibility State
  const [visibleSections, setVisibleSections] = useState({
    timer: true,
    dateInfo: true,
    location: true,
    problem: true,
    contact: true,
    documents: true,
    metadata: true,
    additional: true,
  });

  const [now, setNow] = useState(Date.now());

  // ... (keep useEffects)

  // Export Handlers
  const getExportData = () => {
    if (!entry) return {};

    const data: any = {};
    if (visibleSections.additional) {
      data["Sr No"] = entry.srNo || "N/A";
      data["Recommended Letter No"] = entry.recommendedLetterNo || "N/A";
      data["Status"] = entry.status;
    }
    if (visibleSections.dateInfo) {
      data["Year"] = entry.year;
      data["Month"] = entry.month;
      data["Date"] = entry.dateString;
    }
    if (visibleSections.location) {
      data["State"] = hierarchy.state;
      data["Division"] = hierarchy.division;
      data["District"] = entry.district;
      data["Assembly"] = entry.assembly;
      data["Block"] = entry.block;
      data["Panchayat"] = entry.panchayatName;
      data["Village"] = entry.village;
      data["Booth"] = `${entry.boothName} (${entry.boothNo})`;
    }
    if (visibleSections.problem) {
      data["Work/Problem"] = entry.workProblem;
      data["Office"] = entry.office;
      data["Approx Cost"] = entry.approximateCost;
      data["Department"] = entry.department;
      data["Priority"] = entry.priority;
      data["Type of Work"] = entry.typeOfWork;
    }
    if (visibleSections.contact) {
      data["Middle Man"] = `${entry.middleMen} (${entry.middleMenContactNo})`;
      data["Beneficiary"] =
        `${entry.beneficialName} (${entry.beneficialMobile})`;
    }
    if (visibleSections.documents) {
      data["Remark"] = entry.remarkGoshana;
    }
    if (visibleSections.metadata) {
      data["Added By"] = entry.addedBy;
      data["Created At"] = entry.createdAt;
    }

    return data;
  };

  /* Export handlers removed in favor of ViewPageActions */

  const toggleSection = (key: string) => {
    setVisibleSections((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimer = (dateStr: string) => {
    const sub = new Date(dateStr);
    const diff = now - sub.getTime();

    if (diff < 0) return "0d, 0h, 0m, 0s";

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${d}d, ${h}h, ${m}m, ${s}s`;
  };

  useEffect(() => {
    const fetchEntry = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/public-problems/${params.id}`);
        // Ensure type compatibility if backend returns extended object
        const entryData = res.data.data;
        setEntry(entryData);

        if (entryData.related) {
          setHierarchy({
            division: entryData.related.divisionName || "",
            state: entryData.related.stateName || "",
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load entry");
        router.push("/mp-public-problem");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [params.id, router]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="View Public Problem Entry" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-6xl mx-auto p-8">
              <Skeleton className="h-8 w-64 mb-4 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-4 w-96 mb-8 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-32 w-full mb-4 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-32 w-full mb-4 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <>
      <ContentHeader title="View Public Problem Entry" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Registration No: {entry.regNo}
                  </h2>
                  <Badge
                    className={`whitespace-nowrap ${getStatusColor(entry.status)} border dark:bg-gray-800`}
                  >
                    {entry.status}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {entry.district} {entry.assembly ? `- ${entry.assembly}` : ""}
                </p>

                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Entry_${entry.regNo}`}
                  visibleSections={visibleSections as any}
                  onToggleSection={toggleSection}
                  sectionLabels={{
                    timer: "Time Elapsed",
                    dateInfo: "Date Info",
                    location: "Location",
                    problem: "Problem Details",
                    contact: "Contact Info",
                    documents: "Remarks",
                    metadata: "Timeline",
                    additional: "Additional Headers",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/mp-public-problem")}
                  className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(`/mp-public-problem/${entry._id}/edit`)
                  }
                  className="bg-[#00563B] hover:bg-[#368F8B] text-white shadow-lg transition-all"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Timer Card */}
              {visibleSections.timer && (
                <Card className="bg-linear-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-400">
                      <Clock className="w-5 h-5" />
                      Time Elapsed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                      {calculateTimer(entry.submissionDate)}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400/70 mt-2">
                      Since submission on{" "}
                      {new Date(entry.submissionDate).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Date Information */}
              {visibleSections.dateInfo && (
                <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                      <Calendar className="w-5 h-5 text-[#368F8B]" />
                      Date Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 font-medium">
                        Year
                      </Label>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.year as any}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 font-medium">
                        Month
                      </Label>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.month}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 font-medium">
                        Date
                      </Label>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.dateString || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Information */}
              <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                    <MapPin className="w-5 h-5 text-[#368F8B]" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        State
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {hierarchy.state || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Division
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {hierarchy.division || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        District
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.district || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Assembly
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.assembly || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Block
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.block || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Panchayat Name
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.panchayatName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Village
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.village || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Majra/Faliya
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.majraFaliya || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Booth Name
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.boothName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Booth Number
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.boothNo || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Details */}
              <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                    <FileText className="w-5 h-5 text-[#368F8B]" />
                    Problem / Work Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Work / Problem
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.workProblem || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Office
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.office || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Approximate Cost
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.approximateCost || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Department
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Priority
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.priority || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Type of Work
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.typeOfWork || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recommended Letter No
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.recommendedLetterNo || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                    <User className="w-5 h-5 text-[#368F8B]" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 dark:text-gray-300">
                        Middle Man
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Name:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {entry.middleMen || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Contact:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {entry.middleMenContactNo || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 dark:text-gray-300">
                        Beneficiary
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Name:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {entry.beneficialName || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Contact:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {entry.beneficialMobile || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avedan & Remarks */}
              <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-gray-200">
                    Documents & Remarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Avedan (File)
                      </p>
                      {entry.avedan ? (
                        <a
                          href={
                            entry.avedan.startsWith("/")
                              ? `${API_BASE_URL.replace("/api", "")}${entry.avedan}`
                              : entry.avedan
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2"
                        >
                          <FileImage className="w-5 h-5" /> View Attached File
                        </a>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">
                          No file attached
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Remark / Goshana
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        {entry.remarkGoshana || "No remarks found."}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="dark:bg-gray-800/30 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-200">
                    Entry Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created At
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Updated
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.updatedAt
                          ? new Date(entry.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added By
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.addedBy || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewMPPublicProblem;
