"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";

import { ArrowLeft, Edit, Calendar, DollarSign, FileText } from "lucide-react";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Skeleton } from "@app/components/ui/skeleton";
import { ViewPageActions } from "@app/components/ViewPageActions";

interface IProject {
  _id: string;
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: number;
  proposalEstimate: number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  currentProgress?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ViewProject = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<IProject | null>(null);
  const [hierarchy, setHierarchy] = useState<{
    division: string;
    state: string;
  }>({ division: "", state: "" });
  const [loading, setLoading] = useState(true);

  // Section Visibility State
  const [visibleSections, setVisibleSections] = useState({
    basicInfo: true,
    financialDetails: true,
    technicalDetails: true,
    contactInfo: true,
    remarks: true,
    metadata: true,
  });

  const getExportData = () => {
    if (!project) return {};
    const data: any = {};
    if (visibleSections.basicInfo) {
      data["Work Name"] = project.workName;
      data["Status"] = project.status;
      data["District"] = project.district;
      data["Block"] = project.block;
      data["State"] = hierarchy.state;
      data["Division"] = hierarchy.division;
      data["Department"] = project.department;
    }
    if (visibleSections.financialDetails) {
      data["Project Cost"] = `₹${project.projectCost}`;
      data["Proposal Estimate"] = `₹${project.proposalEstimate}`;
    }
    if (visibleSections.technicalDetails) {
      data["TS No/Date"] = project.tsNoDate;
      data["AS No/Date"] = project.asNoDate;
    }
    if (visibleSections.contactInfo) {
      data["Officer Name"] = project.officerName;
      data["Contact Number"] = project.contactNumber;
    }
    if (visibleSections.remarks) {
      data["Remarks"] = project.remarks;
      data["Current Progress"] = project.currentProgress;
    }
    if (visibleSections.metadata) {
      data["Created At"] = project.createdAt;
      data["Updated At"] = project.updatedAt;
    }
    return data;
  };

  const toggleSection = (key: string) => {
    setVisibleSections((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/projects/${params.id}`);
        const projData = res.data.data;
        setProject(projData);

        // Fetch hierarchy based on district name
        if (projData.district) {
          try {
            const districtRes = await axios.get(
              `/districts?search=${projData.district}&limit=1`,
            );
            const foundDistrict = districtRes.data?.data?.[0];
            if (foundDistrict && foundDistrict.division) {
              const divObj = foundDistrict.division;
              // Check if division is populated and has state
              if (divObj._id) {
                // Division is populated
                setHierarchy((prev) => ({ ...prev, division: divObj.name }));

                // Check state
                if (divObj.state && divObj.state.name) {
                  setHierarchy((prev) => ({
                    ...prev,
                    state: divObj.state.name,
                  }));
                } else {
                  // State is missing from division object, fetch full division
                  try {
                    const divRes = await axios.get(`/divisions/${divObj._id}`);
                    const fullDiv = divRes.data?.data;
                    if (fullDiv?.state?.name) {
                      setHierarchy((prev) => ({
                        ...prev,
                        state: fullDiv.state.name,
                      }));
                    }
                  } catch (e) {
                    console.error("Failed to fetch division details", e);
                  }
                }
              }
            }
          } catch (err) {
            console.error("Failed to fetch hierarchy details", err);
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load project");
        router.push("/project-summary");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="View Project" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto p-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96 mb-8" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <ContentHeader title="View Project" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {project.workName}
                  </h2>
                  <Badge className={`${getStatusColor(project.status)} border`}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  {project.district} - {project.block}
                </p>

                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Project_${project.workName.replace(/\s+/g, "_")}`}
                  visibleSections={visibleSections}
                  onToggleSection={toggleSection}
                  sectionLabels={{
                    basicInfo: "Basic Information",
                    financialDetails: "Financial Details",
                    technicalDetails: "Technical Details",
                    contactInfo: "Contact Information",
                    remarks: "Remarks",
                    metadata: "Project Timeline",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/project-summary")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(`/project-summary/${project._id}/edit`)
                  }
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Basic Information */}
              {visibleSections.basicInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="font-medium text-gray-900">
                          {hierarchy.state || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Division</p>
                        <p className="font-medium text-gray-900">
                          {hierarchy.division || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">District</p>
                        <p className="font-medium text-gray-900">
                          {project.district}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Block</p>
                        <p className="font-medium text-gray-900">
                          {project.block}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">
                          {project.department}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Details */}
              {visibleSections.financialDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">
                          Project Cost
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          ₹{project.projectCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 mb-1">
                          Proposal Estimate
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          ₹{project.proposalEstimate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Details */}
              {visibleSections.technicalDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">TS No/Date</p>
                        <p className="font-medium text-gray-900">
                          {project.tsNoDate || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">AS No/Date</p>
                        <p className="font-medium text-gray-900">
                          {project.asNoDate || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              {visibleSections.contactInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Officer Name</p>
                        <p className="font-medium text-gray-900">
                          {project.officerName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium text-gray-900">
                          {project.contactNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Remarks */}
              {project.remarks && visibleSections.remarks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {project.remarks}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Progress */}
              {project.currentProgress && visibleSections.remarks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {project.currentProgress}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {visibleSections.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Project Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium">
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">
                          {project.updatedAt
                            ? new Date(project.updatedAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewProject;
