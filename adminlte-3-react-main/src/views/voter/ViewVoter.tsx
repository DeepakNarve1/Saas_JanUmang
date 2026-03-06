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
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IVoter } from "@app/types/voter";
import { ArrowLeft, Edit } from "lucide-react";
import { PERMISSIONS } from "@app/config/permissions";

const ViewVoter = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_VOTERS]}>
      <ViewVoterContent />
    </RouteGuard>
  );
};

const ViewVoterContent = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [voter, setVoter] = useState<IVoter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoter = async () => {
      try {
        const { data } = await axios.get(`/voters/${id}`);
        setVoter(data.data || null);
      } catch (error: unknown) {
        handleError(error, "Failed to load voter details");
        router.push("/voter");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoter();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading voter details...
        </p>
      </div>
    );
  }

  if (!voter) {
    return <div className="p-8 text-center">Voter not found</div>;
  }

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | undefined | null;
  }) => (
    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </h3>
      <p className="text-base font-semibold text-gray-800 dark:text-gray-100 break-words line-clamp-2">
        {value || "-"}
      </p>
    </div>
  );

  /* Define export data */
  const getExportData = () => {
    if (!voter) return {};
    return {
      Name: voter.name,
      "Voter ID": voter.voterId,
      Status: voter.isActive ? "Active" : "Inactive",
      "Father Name": voter.fatherName,
      Mobile: voter.mobileNumber,
      Age: voter.age,
      Caste: voter.cast,
      "Sub-Caste": voter.subcast,
      "Full Address": voter.fulladdress,
      Block:
        typeof voter.blockname === "object"
          ? voter.blockname?.name
          : voter.blockname,
      "Booth Name":
        typeof voter.boothname === "object"
          ? voter.boothname?.name
          : voter.boothname,
      "Booth No": voter.boothno,
      Panchayat:
        typeof voter.panchayat === "object"
          ? voter.panchayat?.name
          : voter.panchayat,
      Village:
        typeof voter.village === "object" ? voter.village?.name : voter.village,
      "Falla/Marjra": voter.fallaMarjra,
      "Created On": voter.createdAt
        ? new Date(voter.createdAt).toLocaleDateString()
        : "",
    };
  };

  return (
    <>
      <ContentHeader title="View Voter" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mt-6 max-w-6xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Voter Identification Profile
                </h2>
              </div>
              <div className="flex gap-4 items-center">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Voter_${voter.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  onClick={() => router.push("/voter")}
                  className="dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm rounded-lg sm:flex hidden"
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
                  <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 border-l-4 border-[#368F8B] pl-4 tracking-tight">
                    {voter.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 pl-5 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Voter ID (Epic):
                    </span>
                    <span className="font-mono font-bold text-[#368F8B] bg-[#368F8B]/10 px-2 py-0.5 rounded">
                      {voter.voterId}
                    </span>
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Badge
                    variant={voter.isActive ? "default" : "destructive"}
                    className={`text-sm px-6 py-2 rounded-full font-bold shadow-sm ${voter.isActive ? "bg-[#368F8B] hover:bg-[#368F8B]/90" : ""}`}
                  >
                    {voter.isActive ? "Active Account" : "Inactive Account"}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DetailItem label="Father Name" value={voter.fatherName} />
                <DetailItem label="Mobile" value={voter.mobileNumber} />
                <DetailItem label="Age" value={voter.age} />

                <DetailItem label="Caste" value={voter.cast} />
                <DetailItem label="Sub-Caste" value={voter.subcast} />
                <DetailItem label="Full Address" value={voter.fulladdress} />

                <DetailItem
                  label="Block"
                  value={
                    typeof voter.blockname === "object"
                      ? voter.blockname?.name
                      : voter.blockname
                  }
                />
                <DetailItem
                  label="Booth Name"
                  value={
                    typeof voter.boothname === "object"
                      ? voter.boothname?.name
                      : voter.boothname
                  }
                />
                <DetailItem label="Booth No" value={voter.boothno} />

                <DetailItem
                  label="Panchayat"
                  value={
                    typeof voter.panchayat === "object"
                      ? voter.panchayat?.name
                      : voter.panchayat
                  }
                />
                <DetailItem
                  label="Village"
                  value={
                    typeof voter.village === "object"
                      ? voter.village?.name
                      : voter.village
                  }
                />
                <DetailItem label="Falla/Marjra" value={voter.fallaMarjra} />

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Voter Identification Photo
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/20 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex min-h-[160px] items-center justify-center">
                    {voter.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={voter.image}
                        alt="Voter"
                        className="max-h-72 w-auto object-contain rounded-lg shadow-2xl border-4 border-white dark:border-gray-800"
                      />
                    ) : (
                      <div className="text-center text-gray-400 dark:text-gray-500 italic flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-2xl">?</span>
                        </div>
                        <span>No image available for this profile</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Update Info */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>
                  Profile Created:{" "}
                  {voter.createdAt &&
                    new Date(voter.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                </span>
                <span>
                  Last Information Update:{" "}
                  {voter.updatedAt &&
                    new Date(voter.updatedAt as string).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => router.push(`/voter/${voter._id}/edit`)}
                  className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all min-w-[140px] font-bold"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewVoter;
