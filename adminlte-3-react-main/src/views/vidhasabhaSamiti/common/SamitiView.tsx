"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { usePermissions } from "@app/hooks/usePermissions";

interface ISamitiData {
  _id: string;
  uniqueId: string;
  year: string;
  acMpNo: string;
  block: string;
  sector: string;
  microSectorNo: string;
  microSectorName: string;
  boothName: string;
  boothNo: string;
  gramPanchayat: string;
  village: string;
  faliya: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SamitiViewProps {
  title: string;
  apiEndpoint: string;
  resourceName: string; // for edit permission check
  basePath: string; // e.g. /vidhasabha-samiti/ganesh-samiti
}

const SamitiView = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiViewProps) => {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<ISamitiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/${apiEndpoint}/${id}`);
        setData(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, apiEndpoint]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading details...
        </p>
      </div>
    );
  }
  if (error)
    return (
      <div className="p-20 text-center text-red-500 font-bold dark:bg-[#1a1c1e]">
        Error: {error}
      </div>
    );
  if (!data)
    return (
      <div className="p-20 text-center dark:text-gray-400 dark:bg-[#1a1c1e]">
        Record not found
      </div>
    );

  return (
    <>
      <ContentHeader title={`${title} Details`} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Record Information
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-lg border-gray-200 dark:border-gray-700 dark:bg-[#202123] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {hasPermission(`edit_${resourceName}`) && (
                  <Button
                    onClick={() => router.push(`${basePath}/${id}/edit`)}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Record
                  </Button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Unique ID */}
                <ViewField label="Unique ID" value={data.uniqueId} />
                <ViewField label="Year" value={data.year} />
                <ViewField label="AC/MP No_" value={data.acMpNo} />

                {/* Location Info */}
                <ViewField label="Block" value={data.block} />
                <ViewField label="Sector" value={data.sector} />

                {/* Combined or Separate Micro Sector Info */}
                <ViewField
                  label="Micro Sector"
                  value={`${data.microSectorNo} - ${data.microSectorName}`}
                />

                {/* Booth Info */}
                <ViewField label="Booth Name" value={data.boothName} />
                <ViewField label="Booth No" value={data.boothNo} />

                {/* Village Details */}
                <ViewField label="Gram Panchayat" value={data.gramPanchayat} />
                <ViewField label="Village" value={data.village} />
                <ViewField label="Faliya" value={data.faliya} />

                {/* Image */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Attached Image/Photo
                  </h3>
                  <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[200px] flex items-center justify-center">
                    {data.image ? (
                      <div className="relative w-full max-w-lg transition-transform hover:scale-[1.01]">
                        <NextImage
                          src={data.image}
                          alt="Attached"
                          width={0}
                          height={0}
                          sizes="100vw"
                          className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-2xl border-4 border-white dark:border-gray-800"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 dark:text-gray-500 italic flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-2xl">?</span>
                        </div>
                        <span>No image attached to this record</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ViewField = ({
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
    <p className="text-base font-semibold text-gray-800 dark:text-gray-100 wrap-break-word line-clamp-2">
      {value || (
        <span className="text-gray-400 dark:text-gray-600 italic">N/A</span>
      )}
    </p>
  </div>
);

export default SamitiView;
