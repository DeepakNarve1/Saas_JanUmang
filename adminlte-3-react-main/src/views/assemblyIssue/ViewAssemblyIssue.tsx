"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";

import { Button } from "@app/components/ui/button";
import { Badge } from "@app/components/ui/badge";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";

interface ViewAssemblyIssueProps {
  issueType?: string;
  title?: string;
  basePath?: string;
}

const ViewAssemblyIssue = ({
  issueType = "assembly-issue",
  title = "View Assembly Issue",
  basePath = "/assembly-issue",
}: ViewAssemblyIssueProps) => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_ASSEMBLY_ISSUES]}>
      <ViewAssemblyIssueContent
        issueType={issueType}
        title={title}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@app/components/ui/dialog";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { ArrowLeft, Edit, FileImage } from "lucide-react";
import { API_BASE_URL } from "@app/utils/api";

import { IAssemblyIssue } from "@app/types/assemblyIssue";

const ViewAssemblyIssueContent = ({
  issueType,
  title,
  basePath,
}: {
  issueType: string;
  title: string;
  basePath: string;
}) => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [issue, setIssue] = useState<IAssemblyIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const { data } = await axios.get(`/assembly-issues/${id}`);
        setIssue(data.data || null);
      } catch (error: unknown) {
        handleError(error, "Failed to load assembly issue details");
        router.push(basePath);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id, router, basePath]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#00563B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading issue details...
        </p>
      </div>
    );
  }

  if (!issue) {
    return <div className="p-8 text-center">Issue not found</div>;
  }

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </h3>
      <div className="text-base font-semibold text-gray-800 dark:text-gray-100 wrap-break-words line-clamp-3">
        {value || "-"}
      </div>
    </div>
  );

  const getExportData = () => {
    if (!issue) return {};
    return {
      "Unique ID": issue.uniqueId,
      Year: issue.year,
      Month: issue.month,
      Date: issue.date,
      "Recommended Letter No": issue.recommendedLetterNo,
      "AC/MP No.": issue.acMpNo,
      Block: issue.block,
      Sector: issue.sectorName,
      "Micro Sector No": issue.microSectorNo,
      "Micro Sector Name": issue.microSectorName,
      "Booth Name": issue.boothName,
      "Booth No": issue.boothNo,
      "Panchayat Name": issue.panchayatName,
      Village: issue.village,
      "Majra/Faliya": issue.majraFaliya,
      "Total Members": issue.totalMembers,
      "Created At": issue.createdAt,
      "Updated At": issue.updatedAt,
      Description:
        "Assembly issue details including sector and booth information.",
    };
  };

  return (
    <>
      <ContentHeader title={title} />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mt-6 max-w-5xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Assembly Issue Details
              </h2>
              <div className="flex gap-2 items-center">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`AssemblyIssue_${issue.uniqueId}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push(basePath)}
                  className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 border-l-4 border-[#00563B] pl-4 tracking-tight">
                    {issue.uniqueId}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 pl-5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Created on{" "}
                    {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-sm px-4 py-2 border-slate-200 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50 font-bold rounded-full shadow-sm"
                  >
                    Year: {issue.year}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-sm px-4 py-2 border-slate-200 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50 font-bold rounded-full shadow-sm"
                  >
                    {issue.month}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DetailItem label="Month" value={issue.month} />
                <DetailItem label="Date" value={issue.date} />
                <DetailItem
                  label="Recommended Letter No"
                  value={issue.recommendedLetterNo}
                />
                <DetailItem label="AC/MP No." value={issue.acMpNo || "N/A"} />
                <DetailItem label="Block" value={issue.block} />
                <DetailItem label="Sector" value={issue.sectorName} />
                <DetailItem
                  label="Micro Sector No"
                  value={issue.microSectorNo}
                />
                <DetailItem
                  label="Micro Sector Name"
                  value={issue.microSectorName}
                />
                <DetailItem label="Booth Name" value={issue.boothName} />
                <DetailItem label="Booth No" value={issue.boothNo} />
                <DetailItem
                  label="Panchayat Name"
                  value={issue.panchayatName}
                />
                <DetailItem label="Village" value={issue.village} />
                <DetailItem label="Majra/Faliya" value={issue.majraFaliya} />
                <DetailItem label="Total Members" value={issue.totalMembers} />
                <DetailItem label="Status" value={issue.status} />
                <DetailItem label="Added By" value={issue.addedBy} />
                <DetailItem
                  label="Lat/Lng"
                  value={(() => {
                    const parts = (
                      issue.latLng || "0.00000000, 0.00000000"
                    ).split(",");
                    return (
                      <div className="flex flex-col">
                        <span>{parts[0]?.trim()}</span>
                        <span>{parts[1]?.trim()}</span>
                      </div>
                    );
                  })()}
                />
                <DetailItem
                  label="Registration Date"
                  value={
                    issue.registrationDate
                      ? new Date(issue.registrationDate).toLocaleDateString()
                      : "-"
                  }
                />

                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Avedan File
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[100px] flex items-center justify-center">
                      {issue.avedanFile ? (
                        <div className="text-center">
                          <a
                            href={
                              issue.avedanFile.startsWith("/")
                                ? `${API_BASE_URL.replace("/api", "")}${issue.avedanFile}`
                                : issue.avedanFile
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex flex-col items-center gap-2 text-[#368F8B] hover:text-[#2d7a76] font-bold transition-all"
                          >
                            <FileImage className="w-12 h-12" />
                            <span>View Avedan</span>
                            <span className="text-xs text-gray-400 font-normal">
                              {issue.avedanFileName || "View Attachment"}
                            </span>
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">
                          No Avedan attached
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Documents Set
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[100px] flex items-center justify-center">
                      {issue.documentFile ? (
                        <div className="text-center">
                          <a
                            href={
                              issue.documentFile.startsWith("/")
                                ? `${API_BASE_URL.replace("/api", "")}${issue.documentFile}`
                                : issue.documentFile
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex flex-col items-center gap-2 text-[#00563B] hover:text-[#368F8B] font-bold transition-all"
                          >
                            <FileImage className="w-12 h-12" />
                            <span>View Documents</span>
                            <span className="text-xs text-gray-400 font-normal">
                              {issue.documentFileName || "View PDF"}
                            </span>
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">
                          No documents attached
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Info */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Last updated:{" "}
                  {new Date(issue.updatedAt).toLocaleString("en-IN")}
                </span>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`${basePath}/${issue._id}/edit`)}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all min-w-[140px] font-bold"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewAssemblyIssue;
