"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import { Button } from "@app/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { ViewPageActions } from "@app/components/ViewPageActions";

interface IVisitor {
  _id: string;
  district: string;
  vidhansabha: string;
  block: string;
  date: string;
  time: string;
  name: string;
  category: string;
  post: string;
  place: string;
  mobileNumber: string;
  incomingVisitor: string;
  message: string;
  visitorType: string;
  attendBy: string;
  remarks: string;
  bhaiyakanirdesh: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

const ViewVisitor = () => {
  const router = useRouter();
  const { id } = useParams();
  const [visitor, setVisitor] = useState<IVisitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        const res = await axios.get(`/visitors/${id}`);
        setVisitor(res.data.data);
      } catch (error: unknown) {
        console.error("Failed to fetch visitor", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVisitor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading visitor details...
        </p>
      </div>
    );
  }

  if (!visitor) {
    return <div className="p-6">Visitor not found</div>;
  }

  /* Define export data */
  const getExportData = () => {
    if (!visitor) return {};
    return {
      Name: visitor.name,
      Mobile: visitor.mobileNumber,
      Category: visitor.category,
      Post: visitor.post,
      Place: visitor.place,
      District: visitor.district,
      Vidhansabha: visitor.vidhansabha,
      Block: visitor.block,
      "Visitor Type": visitor.visitorType,
      "Incoming / Visitor": visitor.incomingVisitor,
      "Attend By": visitor.attendBy,
      Message: visitor.message,
      Remarks: visitor.remarks,
      "Added By": visitor.addedBy,
      Date: new Date(visitor.createdAt).toLocaleDateString(),
    };
  };

  return (
    <>
      <ContentHeader title="Visitor Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <ViewPageActions
              getExportData={getExportData}
              fileName={`Visitor_${visitor.name || "Details"}`}
            />

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-white dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={() => router.push(`/visitors/${id}/edit`)}
                className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-bold"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Visitor
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <h2 className="text-2xl font-black text-gray-800 dark:text-gray-50 tracking-tight">
                {visitor.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#368F8B]"></span>
                Registration Date:{" "}
                {new Date(visitor.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Mobile" value={visitor.mobileNumber} />
              <DetailItem label="District" value={visitor.district} />
              <DetailItem label="Vidhansabha" value={visitor.vidhansabha} />
              <DetailItem label="Block" value={visitor.block} />
              <DetailItem label="Date" value={visitor.date || "-"} />
              <DetailItem label="Time" value={visitor.time || "-"} />
              <DetailItem label="Category" value={visitor.category} />
              <DetailItem label="Post" value={visitor.post} />
              <DetailItem label="Place" value={visitor.place} />
              <DetailItem
                label="Incoming / Visitor"
                value={visitor.incomingVisitor}
              />
              <DetailItem label="Visitor Type" value={visitor.visitorType} />
              <DetailItem label="Attend By" value={visitor.attendBy} />
              <DetailItem label="Added By" value={visitor.addedBy} />

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <DetailItem label="Message" value={visitor.message} fullWidth />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <DetailItem label="Remarks" value={visitor.remarks} fullWidth />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <DetailItem
                  label="Bhaiya Ka Nirdesh"
                  value={visitor.bhaiyakanirdesh}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const DetailItem = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) => (
  <div
    className={`p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50 transition-all hover:shadow-sm ${fullWidth ? "w-full" : ""}`}
  >
    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
      {label}
    </h3>
    <p className="text-base font-semibold text-gray-800 dark:text-gray-100 break-words line-clamp-3">
      {value || "-"}
    </p>
  </div>
);

export default ViewVisitor;
