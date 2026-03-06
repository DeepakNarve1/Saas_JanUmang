"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Edit,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  FileText,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { Badge } from "@app/components/ui/badge";
import { ViewPageActions } from "@app/components/ViewPageActions";

interface IPhoneEntry {
  _id: string;
  name: string;
  post: string;
  department: { _id: string; name: string };
  district: { _id: string; name: string };
  block: { _id: string; name: string };
  party: { _id: string; name: string };
  number: string;
  alternateNumber?: string;
  email?: string;
  remark?: string;
  status: string;
  createdAt?: string;
}

const ViewPhoneDirectory = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<IPhoneEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/phone-directory/${id}`);
        setData(res.data.data);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load Phone Directory data",
        );
        router.push("/phone-directory");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <ContentHeader title="Phone Directory Details" />
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* Define export data */
  const getExportData = () => {
    if (!data) return {};
    return {
      Name: data.name,
      Post: data.post,
      Department: data.department?.name || "",
      District: data.district?.name || "",
      Block: data.block?.name || "",
      Party: data.party?.name || "",
      "Phone Number": data.number,
      "Alternate Number": data.alternateNumber || "",
      Email: data.email || "",
      Status: data.status,
      Remark: data.remark || "",
    };
  };

  return (
    <>
      <ContentHeader title="Phone Directory Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {data?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-500">{data?.post || "No Post"}</p>
                  <Badge
                    variant={
                      data?.status === "Active" ? "default" : "destructive"
                    }
                  >
                    {data?.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`PhoneDirectory_${data?.name || "Entry"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/phone-directory")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                {hasPermission(PERMISSIONS.EDIT_PHONE_DIRECTORY) && (
                  <Button
                    className="bg-[#00563B] hover:bg-[#368F8B]"
                    onClick={() => router.push(`/phone-directory/${id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Contact Information
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <p className="text-gray-700 font-medium">
                        {data?.number}
                      </p>
                      {data?.alternateNumber && (
                        <p className="text-gray-500 text-sm mt-1">
                          Alt: {data?.alternateNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </label>
                      <p className="text-gray-700 font-medium">
                        {data?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Organization Details
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Department & Party
                      </label>
                      <p className="text-gray-700 font-medium">
                        Dept: {data?.department?.name || "N/A"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Party: {data?.party?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Location
                      </label>
                      <p className="text-gray-700 font-medium">
                        District: {data?.district?.name || "N/A"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Block: {data?.block?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {data?.remark && (
                  <div className="md:col-span-2 space-y-4 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Additional Information
                    </h3>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                          Remark
                        </label>
                        <p className="text-gray-700 mt-1">{data?.remark}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewPhoneDirectory;
